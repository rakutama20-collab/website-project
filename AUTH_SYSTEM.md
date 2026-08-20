# 認証・セッション・権限管理システム

## 概要

認証は Auth.js (NextAuth.js) の Credentials Provider を使用しています。既存の `admins` テーブルが User モデルの役割を担い、`email`、`password_hash`、`role`、`status` を保持します。セッションは JWT 方式で、`role` は JWT と Session の両方へ格納されます。

BeSMILE CMS Admin に以下の3つの認証・セキュリティ機能を実装しました：

- **ログイン/認証機能** - 管理画面へのアクセス制限
- **セッション管理** - ユーザーセッション管理（iron-sessionを使用）
- **権限管理** - 3段階の権限レベル（管理者/編集者/閲覧者）

---

## システムアーキテクチャ

### 権限レベル

| 権限 | 説明 | アクセス可能な機能 |
|-----|------|-----------------|
| **Admin（管理者）** | システム全体の管理 | ✓ ポスト閲覧<br>✓ ポスト作成<br>✓ ポスト編集<br>✓ ポスト削除<br>✓ ユーザー管理 |
| **Editor（編集者）** | コンテンツ編集 | ✓ ポスト閲覧<br>✓ ポスト作成<br>✓ ポスト編集<br>✗ ポスト削除<br>✗ ユーザー管理 |
| **Viewer（閲覧者）** | コンテンツ閲覧のみ | ✓ ポスト閲覧<br>✗ ポスト作成<br>✗ ポスト編集<br>✗ ポスト削除<br>✗ ユーザー管理 |

---

## テストアカウント

ログインページ（`/login`）に以下のテストアカウントが表示されます：

```
管理者:
  Email: admin@besmile.jp
  Password: password
  Role: admin

編集者:
  Email: editor@besmile.jp
  Password: password
  Role: editor

閲覧者:
  Email: viewer@besmile.jp
  Password: password
  Role: viewer
```

> **注意**: 本番環境では必ず強いパスワードに変更してください。

---

## ファイル構成

### 認証ユーティリティ

- **`src/lib/auth.ts`** - ユーザー認証とパスワード検証
  - `findUserByEmail()` - メールアドレスでユーザー検索
  - `verifyPassword()` - パスワード検証（bcrypt使用）
  - `hasPermission()` - 権限チェック
  - `toSessionUser()` - ユーザーオブジェクト変換

- **`src/lib/session.ts`** - セッション管理
  - `getSession()` - 現在のセッション取得
  - `setSessionUser()` - ユーザーセッション設定
  - `clearSession()` - セッション削除（ログアウト）

### APIエンドポイント

- **`src/app/api/auth/login/route.ts`** - ログインエンドポイント
  ```
  POST /api/auth/login
  Body: { email: string, password: string }
  Response: { success: boolean, user: SessionUser }
  ```

- **`src/app/api/auth/logout/route.ts`** - ログアウトエンドポイント
  ```
  POST /api/auth/logout
  Response: { success: boolean }
  ```

- **`src/app/api/users/route.ts`** - ユーザー一覧取得（Adminのみ）
  ```
  GET /api/users
  Requires: Admin role
  Response: User[]
  ```

### ページ

- **`src/app/login/page.tsx`** - ログインページ
- **`src/app/page.tsx`** - ダッシュボード（権限に応じた表示）
- **`src/app/admin/users/page.tsx`** - ユーザー管理ページ（Adminのみ）

### データファイル

- **`data/users.json`** - ユーザーデータ（bcryptでパスワードをハッシュ化）

---

## 保護されたエンドポイント

### ログイン認証が必要

- すべての管理画面ページ（`/posts`, `/admin/*` など）
- 大多数のAPI（`/api/posts/*`, `/api/users` など）

### 権限チェックが必要

| エンドポイント | 必須権限 | メソッド |
|-------------|---------|--------|
| `POST /api/posts` | Editor以上 | POST |
| `PUT /api/posts` | Editor以上 | PUT |
| `DELETE /api/posts` | Admin | DELETE |
| `DELETE /api/posts/[id]` | Admin | DELETE |
| `GET /api/users` | Admin | GET |

---

## セッション設定

### セッションキー

- **Cookie Name**: `besmile-cms-session`
- **Session Duration**: 24時間
- **Cookie Options**:
  - `httpOnly: true` - JavaScriptからアクセス不可
  - `sameSite: lax` - CSRF攻撃対策
  - `secure: true`（本番環境のみ）- HTTPS接続でのみ送信

### パスワード設定

環境変数 `SESSION_PASSWORD` で暗号化キーを設定：

```env
# .env.local
SESSION_PASSWORD=your-secret-key-change-in-production-at-least-32-characters
```

> **セキュリティ**: 本番環境では最低32文字の複雑なキーに変更してください。

---

## ミドルウェア（`middleware.ts`）

### 機能

- ログイン未認証ユーザーを `/login` にリダイレクト
- API エンドポイントへの無認可アクセスを拒否
- 公開パスはバイパス（`/login` など）

### 保護対象

- すべての管理画面ページ
- `/api/` 配下のエンドポイント（`/api/auth/*` を除く）

---

## セキュリティ機能

### パスワード暗号化

- **Library**: bcryptjs
- **Hash Algorithm**: bcrypt (自動ソルト生成)
- **Cost Factor**: 10

### セッションセキュリティ

- **Library**: iron-session
- **暗号化**: AES-256
- **署名**: HMAC

### API保護

1. **認証チェック** - セッションクッキーの確認
2. **権限チェック** - ユーザーロールの確認
3. **エラーハンドリング** - 401/403ステータスコードで応答

---

## ユーザー追加方法

`data/users.json` にユーザーを追加する方法：

```json
{
  "id": 4,
  "email": "newuser@besmile.jp",
  "password": "パスワードのハッシュ値",
  "name": "新規ユーザー",
  "role": "editor",
  "status": "active",
  "createdAt": "2026-07-13"
}
```

> **注意**: パスワードは必ずbcryptでハッシュ化してください。平文での保存は避けてください。

---

## 環境変数

### 必須

```env
SESSION_PASSWORD=your-secret-key-minimum-32-characters
```

### オプション

```env
NODE_ENV=production  # 本番環境の場合設定
```

---

## トラブルシューティング

### ログインできない

1. メールアドレスが正しいか確認
2. ユーザーのステータスが `active` であるか確認
3. ブラウザのクッキーが有効か確認

### セッションが保持されない

1. `SESSION_PASSWORD` が設定されているか確認
2. ブラウザがクッキーを受け入れているか確認
3. Cookieの有効期限が切れていないか確認

### 権限エラー (403)

1. ユーザーのロールが十分か確認
2. APIが必須権限をチェックしているか確認
3. セッションが有効か確認

---

## 今後の拡張機能

- [ ] パスワードリセット機能
- [ ] 2要素認証（2FA）
- [ ] ユーザーアクティビティログ
- [ ] IP制限
- [ ] セッション管理UI
- [ ] ユーザー招待機能
- [ ] ロール管理UI

---

## 参考資料

- [iron-session Documentation](https://github.com/vvo/iron-session)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)
- [Next.js Middleware](https://nextjs.org/docs/advanced-features/middleware)
