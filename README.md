# ビジネスマッチングアプリ

## プロジェクト概要
このプロジェクトは、ビジネスマッチングアプリケーションです。ユーザーが案件情報を投稿し、他のユーザーがヘルプを申請することでマッチングが成立します。

## 機能一覧
- ログイン認証
- 案件情報の投稿
- 案件一覧の表示
- ヘルプ申請
- マッチング通知

## 技術スタック
- フロントエンド: Vue 3 (CDN経由)
- バックエンド: Express.js
- データベース: SQLite

## プロジェクト構造
```
/sample_match
  /client             # フロントエンド（Vue 3）
    /public           # 静的ファイル
    /src              # ソースコード
      /components     # Vue コンポーネント
      /views          # ページビュー
      /services       # APIとの通信など
      /store          # 状態管理
  /server             # バックエンド（Express.js）
    /controllers      # APIコントローラー
    /models           # データモデル
    /services         # ビジネスロジック
    /database         # データベース関連（SQLite）
    /routes           # APIルート
    /middleware       # ミドルウェア
  /tests              # テスト
    /unit             # 単体テスト
    /integration      # 統合テスト
    /ui               # UIテスト
```

## 初期セットアップ
```bash
# 依存関係のインストール
npm install

# バックエンドサーバーの起動
npm run dev:server

# フロントエンドサーバーの起動
npm run dev:client

# バックエンドとフロントエンドの両方を同時に起動
npm run dev
```

## アプリケーションについて

### ローカル開発環境
- バックエンドサーバー: http://localhost:3000
- フロントエンドサーバー: http://localhost:8080

### API エンドポイント
- 認証API
  - POST /api/auth/login - ユーザーログイン
  - GET /api/auth/me - ログイン中のユーザー情報取得

- 案件API
  - GET /api/projects - 全案件の取得
  - GET /api/projects/:id - 案件詳細の取得
  - POST /api/projects - 新規案件の作成
  - PUT /api/projects/:id - 案件の更新
  - POST /api/projects/:id/help - 案件へのヘルプ申請
  - GET /api/projects/:id/helps - 案件のヘルプ申請一覧取得
  - PUT /api/projects/:id/helps/:helpId - ヘルプ申請のステータス更新

- ユーザーAPI
  - GET /api/users/me/projects - 自分の案件一覧
  - GET /api/users/me/helps - 自分のヘルプ申請一覧
  - GET /api/users/me/matches - 自分のマッチング一覧

## テスト実行
```bash
# 全てのテストを実行
npm test

# 単体テストのみ実行
npm run test:unit

# 統合テストのみ実行
npm run test:integration

# UIテストのみ実行
npm run test:ui
```
