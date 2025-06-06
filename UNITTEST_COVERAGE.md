# Unit Test Coverage Report

このプロジェクトのUnit Testは100% C0/C1カバレッジを達成しています。

## テスト実行方法

### 基本的なテスト実行
```bash
# 全てのテストを実行
npm test

# ユニットテストのみ実行
npm run test:unit

# 統合テストのみ実行
npm run test:integration

# UIテストのみ実行
npm run test:ui
```

### カバレッジレポート付きテスト実行
```bash
# ユニットテストのカバレッジレポートを生成
npm run test:unit:coverage

# 全てのテストのカバレッジレポートを生成
npm run test:coverage
```

## カバレッジレポートについて

カバレッジレポートは以下の形式で出力されます：
- **コンソール出力**: テーブル形式でカバレッジ結果を表示
- **HTML レポート**: `coverage/index.html` で詳細な結果を確認可能
- **LCOV レポート**: `coverage/lcov.info` (CI/CD用)
- **JSON レポート**: `coverage/coverage-final.json` (プログラム処理用)

## カバレッジ目標

以下のカバレッジ目標を設定しています：
- **Statement Coverage (C0)**: 100%
- **Branch Coverage (C1)**: 100%
- **Function Coverage**: 100%
- **Line Coverage**: 100%

## テスト対象

### UserModel (`server/models/user.js`)
- findById
- findByUsername
- findAll
- create
- update
- delete
- getUserMatches
- getUserHelps

### ProjectModel (`server/models/project.js`)
- findById
- findAll
- findByUserId
- create
- update
- delete
- applyHelp
- getHelps
- updateHelpStatus

## テストファイル構成

```
tests/
├── unit/
│   ├── models.test.js (レガシーテスト)
│   ├── user.model.test.js (UserModel包括テスト)
│   └── project.model.test.js (ProjectModel包括テスト)
├── integration/
│   └── api.test.js
└── ui/
    └── ui.test.js
```

## テスト実行例

```bash
$ npm run test:unit:coverage

> sample_match@1.0.0 test:unit:coverage
> jest tests/unit --coverage --collectCoverageFrom='server/models/**/*.js'

 PASS  tests/unit/project.model.test.js
 PASS  tests/unit/user.model.test.js
 PASS  tests/unit/models.test.js
------------|---------|----------|---------|---------|-------------------
File        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
------------|---------|----------|---------|---------|-------------------
All files   |     100 |      100 |     100 |     100 |                   
 project.js |     100 |      100 |     100 |     100 |                   
 user.js    |     100 |      100 |     100 |     100 |                   
------------|---------|----------|---------|---------|-------------------

Test Suites: 3 passed, 3 total
Tests:       51 passed, 51 total
Snapshots:   0 total
Time:        0.786 s
Ran all test suites matching /tests\/unit/i.
```