const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['./src/server.ts'], // エントリーポイント
  bundle: true,                    // 必要な依存関係をバンドル
  platform: 'node',                // Node.js 環境向け
  target: 'node20',                // Node.js 20.x をターゲットに
  outfile: './dist/server.js',     // 出力ファイル
  minify: true,                    // コードを最適化・圧縮
  sourcemap: 'external',
}).then(() => {
  console.log('Build completed successfully.');
}).catch(() => {
  console.error('Build failed.');
  process.exit(1);
});
