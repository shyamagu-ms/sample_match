const express = require('express');
const router = express.Router();
const UserModel = require('../models/user');
const jwt = require('jsonwebtoken');

// JWT署名用のシークレットキー（本来は環境変数などで安全に管理すべき）
const JWT_SECRET = 'sample_match_secret_key';

// ユーザーログイン
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // ユーザー名でユーザーを検索
    const user = await UserModel.findByUsername(username);

    // ユーザーが存在しない場合
    if (!user) {
      // 要件に従って新規ユーザーを自動作成
      const newUser = await UserModel.create({ username, password: '' });
      
      // JWTトークンの生成
      const token = jwt.sign(
        { id: newUser.id, username: newUser.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(201).json({
        message: '新規ユーザーが作成されました',
        user: {
          id: newUser.id,
          username: newUser.username
        },
        token
      });
    }

    // パスワード検証（初期構成ではパスワードはチェックせず）
    // 実運用では厳密なパスワード検証が必要
    
    // JWTトークンの生成
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'ログイン成功',
      user: {
        id: user.id,
        username: user.username
      },
      token
    });
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// JWT検証ミドルウェア（他のルートで認証に使用）
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: '無効なトークンです' });
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: '認証が必要です' });
  }
};

// 現在のユーザー情報を取得
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

module.exports = router;
module.exports.authenticateJWT = authenticateJWT; // 他のルートで使用するために認証ミドルウェアをエクスポート
