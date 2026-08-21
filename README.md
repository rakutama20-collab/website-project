This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## お問い合わせメール設定

既存のNeon DBへ問い合わせテーブルと自動返信用カラムを追加するには、次を実行します。

```bash
npm run init:neon
```

メール送信には `.env.local` に次の値を設定します。SMTPパスワードは管理画面から保存できます。

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-account@example.com
SMTP_FROM=your-account@example.com
```

自動返信テンプレートでは `{{name}}`、`{{message}}`、`{{siteTitle}}` を利用できます。SMTP設定後、管理画面の「テストメールを送信」で接続を確認してください。

## お問い合わせフォーム項目

動的項目用の `contact_fields` と回答保存用の `contact_field_values` は、Drizzleマイグレーションまたは既存の初期化スクリプトで追加できます。

```bash
npx drizzle-kit migrate
# または既存DBの初期化・不足項目補完を含める場合
npm run init:neon
```

管理画面の「お問合せ」から「フォーム項目を設定」を開くと、項目の追加、編集、論理削除、表示順変更ができます。キーは `a-z` で始まる英小文字の英数字・アンダースコアで、既存の `name`、`company`、`email`、`subject`、`message` などの固定キーは利用できません。

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
