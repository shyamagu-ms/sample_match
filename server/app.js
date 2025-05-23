const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// ルーターのインポート
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const userRoutes = require('./routes/users');

// Express アプリケーションの初期化
const app = express();

// ミドルウェア設定
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静的ファイルの提供（開発時は不要、本番環境用）
// app.use(express.static(path.join(__dirname, '../client/public')));

// API ルートの設定
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);

// 基本ルート（ヘルスチェック用）
app.get('/', (req, res) => {
  res.json({ message: 'ビジネスマッチングAPIサーバーが稼働中です' });
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'サーバーエラーが発生しました',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

module.exports = app;
