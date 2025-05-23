const express = require('express');
const router = express.Router();
const UserModel = require('../models/user');
const ProjectModel = require('../models/project');
const { authenticateJWT } = require('./auth');

// 現在のユーザーの案件一覧を取得
router.get('/me/projects', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const projects = await ProjectModel.findByUserId(userId);
    res.json({ projects });
  } catch (error) {
    console.error('ユーザー案件一覧取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 現在のユーザーのヘルプ申請一覧を取得
router.get('/me/helps', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const helps = await UserModel.getUserHelps(userId);
    res.json({ helps });
  } catch (error) {
    console.error('ユーザーヘルプ申請一覧取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 現在のユーザーのマッチング一覧を取得
router.get('/me/matches', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const matches = await UserModel.getUserMatches(userId);
    res.json({ matches });
  } catch (error) {
    console.error('ユーザーマッチング一覧取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

module.exports = router;
