import express from 'express';
import { Request, Response, NextFunction } from 'express'
import * as OpenApiValidator from 'express-openapi-validator';
import { ApiError, errorHandler } from './error/ApiError';
import path from 'path';
import Logger from '../../lib/logger';
import expressPino from 'express-pino-logger';
import {APIGatewayEventRequestContext} from 'aws-lambda'

const app = express();
app.use(express.json());
app.get('/status', (req: Request, res: Response) => {
  // ヘルスチェック用
  res.json({status: 'ok'});
})

app.use(expressPino({logger: Logger as any, serializers: {
  // req: (...), res: (...), err: (...) といったカスタムシリアライザを定義可能
  req: (req) => {
    const requestContext: APIGatewayEventRequestContext | undefined = req.headers['x-amzn-request-context']
      && JSON.parse(req.headers['x-amzn-request-context']);
    return {
      // ここで必要なプロパティだけ返す
      resource: `${req.method} ${req.url}`,
      accountId: requestContext?.authorizer?.claims['cognito:username'] || '-',
      requestId: requestContext?.requestId || '-'
      
      // ボディを含めたければ、req.body もここで追記する
      // ただしデフォルトではボディはログ化されないため、別途 parse している場合のみ
    };
  },
  res: (res) => {
    return {
      statusCode: res.statusCode,
      responseTime: res.responseTime,
    }
  },
  responseTime: () => undefined,
},}));
app.use(
  OpenApiValidator.middleware({
    apiSpec: path.resolve(__dirname, '../../open-api/openapi.yaml'),
    validateRequests: true,
    validateResponses: true,
  }),
);

const myMiddleware = (req: Request, res: Response, next: NextFunction) => {
  Logger.info(`mymiddleWrare req`);
  Logger.info(req.get)
  console.log(JSON.parse(req.get('x-amzn-request-context') ?? '').authorizer.claims);
  next();
}

app.use(myMiddleware);

const apiRouter = express.Router();
apiRouter.get('/users', (req: Request, res: Response) => {
  req.log.info('test');
  res.json([{ id: 1, name: 'John Doe' }]);
});

apiRouter.get('/users/:id', (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id;
  if (userId === '123') {
    req.log.info('test');
    res.status(200).json({ id: userId, name: 'John Doe' });
  } else {
    next(new ApiError('User not found!!!', 404));
  }
});

apiRouter.post('/users', (req, res) => {
  const { name } = req.body;
  res.status(201).json({ id: 2, name });
});

app.use('/api', apiRouter);
app.use(errorHandler);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
