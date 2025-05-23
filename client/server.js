const express = require('express');
const path = require('path');

// Expressアプリケーションの初期化
const app = express();
const PORT = process.env.PORT || 8080;

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, 'public')));
app.use('/src', express.static(path.join(__dirname, 'src')));

// すべてのルートをindex.htmlにリダイレクト（SPA用）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`フロントエンドサーバーが起動しました: http://localhost:${PORT}`);
});
