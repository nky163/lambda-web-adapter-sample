// src/logger.ts
import pino, { LoggerOptions } from 'pino';

// Pinoの設定オプションを自由にカスタマイズできます。
const logger = pino({
  // ログレベル（環境変数などで切り替えられるようにしておく例）
  level: process.env.LOG_LEVEL || 'info',

  // 時刻フォーマットの例（ISO形式など）
  timestamp: pino.stdTimeFunctions.isoTime,

  // ログ出力のフォーマット設定など
  formatters: {
    level(label: string) {
      // デフォルトでは { level: 30 } のように数値が入りますが、任意で上書き可能
      return { level: label };
    },
  },
  
  base: null,
  
  // 開発環境でだけpino-prettyを利用したい場合の例
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname', // 不要な項目をログから除外
          },
        }
      : undefined,
});

export default logger;
