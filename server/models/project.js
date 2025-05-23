const db = require('../database/db');

class ProjectModel {
  // 案件の取得（ID指定）
  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          p.id, p.title, p.description, p.status, p.user_id, p.created_at, p.updated_at,
          u.username as creator_name
         FROM projects p
         JOIN users u ON p.user_id = u.id
         WHERE p.id = ?`, 
        [id], 
        (err, project) => {
          if (err) {
            reject(err);
          } else {
            resolve(project);
          }
        }
      );
    });
  }

  // 全案件の取得
  static findAll() {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          p.id, p.title, p.description, p.status, p.user_id, p.created_at, p.updated_at,
          u.username as creator_name
         FROM projects p
         JOIN users u ON p.user_id = u.id
         ORDER BY p.created_at DESC`, 
        [], 
        (err, projects) => {
          if (err) {
            reject(err);
          } else {
            resolve(projects);
          }
        }
      );
    });
  }

  // ユーザーの案件を取得
  static findByUserId(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          p.id, p.title, p.description, p.status, p.user_id, p.created_at, p.updated_at,
          u.username as creator_name
         FROM projects p
         JOIN users u ON p.user_id = u.id
         WHERE p.user_id = ?
         ORDER BY p.created_at DESC`, 
        [userId], 
        (err, projects) => {
          if (err) {
            reject(err);
          } else {
            resolve(projects);
          }
        }
      );
    });
  }

  // 案件の作成
  static create(projectData) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO projects (title, description, user_id, status) VALUES (?, ?, ?, ?)',
        [projectData.title, projectData.description, projectData.user_id, projectData.status || 'open'],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...projectData });
          }
        }
      );
    });
  }

  // 案件の更新
  static update(id, projectData) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE projects SET title = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [projectData.title, projectData.description, projectData.status, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, ...projectData });
          }
        }
      );
    });
  }

  // 案件の削除
  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM projects WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deleted: this.changes > 0 });
        }
      });
    });
  }

  // 案件へのヘルプ申請
  static applyHelp(projectId, userId) {
    return new Promise((resolve, reject) => {
      // 既存の申請がないか確認
      db.get('SELECT * FROM helps WHERE project_id = ? AND user_id = ?', [projectId, userId], (err, existing) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (existing) {
          // 既に申請済み
          resolve({ exists: true, help: existing });
        } else {
          // 新規申請
          db.run(
            'INSERT INTO helps (project_id, user_id, status) VALUES (?, ?, ?)',
            [projectId, userId, 'pending'],
            function(err) {
              if (err) {
                reject(err);
              } else {
                resolve({ 
                  exists: false, 
                  help: { 
                    id: this.lastID, 
                    project_id: projectId, 
                    user_id: userId, 
                    status: 'pending' 
                  } 
                });
              }
            }
          );
        }
      });
    });
  }

  // 案件のヘルプ申請一覧を取得
  static getHelps(projectId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          h.id as help_id,
          h.status as help_status,
          h.created_at,
          h.updated_at,
          u.id as user_id,
          u.username
         FROM helps h
         JOIN users u ON h.user_id = u.id
         WHERE h.project_id = ?`,
        [projectId],
        (err, helps) => {
          if (err) {
            reject(err);
          } else {
            resolve(helps);
          }
        }
      );
    });
  }

  // ヘルプのステータス更新（マッチングなど）
  static updateHelpStatus(helpId, status) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE helps SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, helpId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ 
              id: helpId, 
              status, 
              updated: this.changes > 0 
            });
          }
        }
      );
    });
  }
}

module.exports = ProjectModel;
