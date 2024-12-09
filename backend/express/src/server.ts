import express from 'express';
import { Request, Response, NextFunction } from 'express'
import * as OpenApiValidator from 'express-openapi-validator';
import { ApiError, errorHandler } from './error/ApiError';
import path from 'path';

const app = express();
app.use(express.json());
app.use(
  OpenApiValidator.middleware({
    apiSpec: path.resolve(__dirname, '../../open-api/openapi.yaml'),
    validateRequests: true,
    validateResponses: true,
  }),
);

const apiRouter = express.Router();
apiRouter.get('/users', (req: Request, res: Response) => {
  res.json([{ id: 1, name: 'John Doe' }]);
});

apiRouter.get('/users/:id', (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id;
  if (userId === '123') {
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
