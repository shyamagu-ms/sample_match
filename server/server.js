const app = require('./app');
const http = require('http');

// サーバーポート設定（環境変数から取得、なければ3000を使用）
const port = process.env.PORT || 3000;
app.set('port', port);

// HTTPサーバーの作成
const server = http.createServer(app);

// サーバー起動
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

// エラーハンドラ
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // 特定のエラーメッセージを表示
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' は管理者権限が必要です');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' は既に使用中です');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

// サーバー起動時の処理
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('サーバーが起動しました: ' + bind);
}
