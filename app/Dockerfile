# Stage 1: Build Stage
FROM public.ecr.aws/docker/library/node:20-alpine AS builder

# 作業ディレクトリ
WORKDIR /usr/src/app

# パッケージファイルをコピーして依存関係をインストール
COPY package*.json ./
RUN npm install

# ソースコードをコピーしてビルド
COPY . .
RUN npm run build

# Stage 2: Runtime Stage
FROM public.ecr.aws/docker/library/node:20-alpine

# Lambda Web Adapter を追加
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4 /lambda-adapter /opt/extensions/lambda-adapter
ENV PORT=3000
EXPOSE 3000

# 作業ディレクトリ
WORKDIR /usr/src/app

# Build Stage から必要な成果物だけをコピー
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./

# 実行に必要な依存関係のみをインストール
RUN npm install --only=production

# 実行コマンド
CMD ["node", "dist/server.js"]
