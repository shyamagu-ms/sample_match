const db = require('../database/db');

class UserModel {
  // ユーザーの取得（ID指定）
  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, username, created_at, updated_at FROM users WHERE id = ?', [id], (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  }

  // ユーザー名でユーザーを検索
  static findByUsername(username) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  }

  // 全ユーザーの取得
  static findAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, username, created_at, updated_at FROM users', [], (err, users) => {
        if (err) {
          reject(err);
        } else {
          resolve(users);
        }
      });
    });
  }

  // ユーザーの作成
  static create(userData) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [userData.username, userData.password || ''],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...userData });
          }
        }
      );
    });
  }

  // ユーザーの更新
  static update(id, userData) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET username = ?, password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [userData.username, userData.password, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, ...userData });
          }
        }
      );
    });
  }

  // ユーザーの削除
  static delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deleted: this.changes > 0 });
        }
      });
    });
  }

  // ユーザーのマッチング一覧を取得
  static getUserMatches(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          h.id as help_id,
          h.status as help_status,
          p.id as project_id,
          p.title as project_title,
          p.description as project_description,
          p.status as project_status,
          u.id as user_id,
          u.username as username
         FROM helps h
         JOIN projects p ON h.project_id = p.id
         JOIN users u ON p.user_id = u.id
         WHERE h.user_id = ? AND h.status = 'matched'`,
        [userId],
        (err, matches) => {
          if (err) {
            reject(err);
          } else {
            resolve(matches);
          }
        }
      );
    });
  }

  // ユーザーのヘルプ申請一覧を取得
  static getUserHelps(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          h.id as help_id,
          h.status as help_status,
          p.id as project_id,
          p.title as project_title,
          p.description as project_description,
          p.status as project_status,
          u.id as user_id,
          u.username as username
         FROM helps h
         JOIN projects p ON h.project_id = p.id
         JOIN users u ON p.user_id = u.id
         WHERE h.user_id = ?`,
        [userId],
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
}

module.exports = UserModel;
