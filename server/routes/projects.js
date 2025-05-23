const express = require('express');
const router = express.Router();
const ProjectModel = require('../models/project');
const { authenticateJWT } = require('./auth');

// 全案件のリスト取得
router.get('/', async (req, res) => {
  try {
    const projects = await ProjectModel.findAll();
    res.json({ projects });
  } catch (error) {
    console.error('案件一覧取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 案件の詳細取得
router.get('/:id', async (req, res) => {
  try {
    const project = await ProjectModel.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: '案件が見つかりません' });
    }

    res.json({ project });
  } catch (error) {
    console.error('案件取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 新規案件の作成（認証必要）
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // バリデーション
    if (!title) {
      return res.status(400).json({ message: '案件タイトルは必須です' });
    }

    // 案件データの作成
    const projectData = {
      title,
      description: description || '',
      user_id: req.user.id,
      status: 'open'
    };

    const newProject = await ProjectModel.create(projectData);
    res.status(201).json({ message: '案件が作成されました', project: newProject });
  } catch (error) {
    console.error('案件作成エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 案件の更新（認証必要）
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const projectId = req.params.id;
    const { title, description, status } = req.body;
    
    // 案件の存在確認
    const existingProject = await ProjectModel.findById(projectId);
    
    if (!existingProject) {
      return res.status(404).json({ message: '案件が見つかりません' });
    }
    
    // 権限チェック（自分の案件のみ更新可能）
    if (existingProject.user_id !== req.user.id) {
      return res.status(403).json({ message: 'この操作を行う権限がありません' });
    }

    // 更新データの準備
    const projectData = {
      title: title || existingProject.title,
      description: description !== undefined ? description : existingProject.description,
      status: status || existingProject.status
    };

    // 案件の更新
    const updatedProject = await ProjectModel.update(projectId, projectData);
    res.json({ message: '案件が更新されました', project: updatedProject });
  } catch (error) {
    console.error('案件更新エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 案件の削除（認証必要）
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // 案件の存在確認
    const existingProject = await ProjectModel.findById(projectId);
    
    if (!existingProject) {
      return res.status(404).json({ message: '案件が見つかりません' });
    }
    
    // 権限チェック（自分の案件のみ削除可能）
    if (existingProject.user_id !== req.user.id) {
      return res.status(403).json({ message: 'この操作を行う権限がありません' });
    }

    // 案件の削除
    await ProjectModel.delete(projectId);
    res.json({ message: '案件が削除されました' });
  } catch (error) {
    console.error('案件削除エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 案件にヘルプ申請する（認証必要）
router.post('/:id/help', authenticateJWT, async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    
    // 案件の存在確認
    const project = await ProjectModel.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: '案件が見つかりません' });
    }
    
    // 自分の案件には申請できない
    if (project.user_id === userId) {
      return res.status(400).json({ message: '自分の案件にはヘルプ申請できません' });
    }

    // ヘルプ申請
    const result = await ProjectModel.applyHelp(projectId, userId);
    
    if (result.exists) {
      res.json({ message: '既にヘルプ申請済みです', help: result.help });
    } else {
      res.status(201).json({ message: 'ヘルプ申請が送信されました', help: result.help });
    }
  } catch (error) {
    console.error('ヘルプ申請エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 案件のヘルプ申請一覧を取得（案件作成者のみ）
router.get('/:id/helps', authenticateJWT, async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // 案件の存在確認と権限チェック
    const project = await ProjectModel.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: '案件が見つかりません' });
    }
    
    // 権限チェック（案件作成者のみ閲覧可能）
    if (project.user_id !== req.user.id) {
      return res.status(403).json({ message: 'この操作を行う権限がありません' });
    }

    // ヘルプ申請一覧を取得
    const helps = await ProjectModel.getHelps(projectId);
    res.json({ helps });
  } catch (error) {
    console.error('ヘルプ申請一覧取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// ヘルプ申請のステータス更新（マッチングなど）（案件作成者のみ）
router.put('/:id/helps/:helpId', authenticateJWT, async (req, res) => {
  try {
    const projectId = req.params.id;
    const helpId = req.params.helpId;
    const { status } = req.body;
    
    // ステータスのバリデーション
    if (!status || !['pending', 'matched', 'rejected'].includes(status)) {
      return res.status(400).json({ message: '無効なステータス値です' });
    }
    
    // 案件の存在確認と権限チェック
    const project = await ProjectModel.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ message: '案件が見つかりません' });
    }
    
    // 権限チェック（案件作成者のみ更新可能）
    if (project.user_id !== req.user.id) {
      return res.status(403).json({ message: 'この操作を行う権限がありません' });
    }

    // ヘルプステータスの更新
    const result = await ProjectModel.updateHelpStatus(helpId, status);
    
    if (!result.updated) {
      return res.status(404).json({ message: 'ヘルプ申請が見つかりません' });
    }
    
    res.json({ message: 'ヘルプ申請のステータスが更新されました', help: result });
  } catch (error) {
    console.error('ヘルプステータス更新エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

module.exports = router;
