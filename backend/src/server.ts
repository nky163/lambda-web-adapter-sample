import express from 'express';
import {hello} from './util/hello';

const app = express();

// サンプルエンドポイント
app.get('/hello', (req, res) => {
  hello();
  res.json({ message: 'Hello from Lambda with Web Adapter!!!' });
});

// ポート指定
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
