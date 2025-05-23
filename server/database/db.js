const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// データベースファイルのパス
const dbPath = path.resolve(__dirname, '../../database.sqlite');

// データベース接続
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('データベース接続エラー:', err.message);
  } else {
    console.log('SQLiteデータベースに接続しました');
    // テーブルの初期化
    initDb();
  }
});

// データベーステーブルの初期化
function initDb() {
  // PRAGMA外部キー制約を有効にする
  db.run('PRAGMA foreign_keys = ON');

  // usersテーブルの作成
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // projectsテーブルの作成
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    user_id INTEGER NOT NULL,
    status TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // helpsテーブルの作成
  db.run(`CREATE TABLE IF NOT EXISTS helps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  console.log('データベーステーブルを初期化しました');

  // 初期ユーザーの作成
  createInitialUser();
}

// 初期ユーザーの作成
function createInitialUser() {
  const stmt = db.prepare('INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)');
  stmt.run('admin', ''); // 要件に従い、パスワードは空
  stmt.finalize();
  console.log('初期ユーザーを作成しました');
}

// モジュールエクスポート
module.exports = db;
