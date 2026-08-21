import { pgTable, serial, timestamp, varchar, text, integer, boolean, jsonb } from 'drizzle-orm/pg-core';

// Auth.js Credentials Provider が User モデルとして利用する管理者テーブル
export const adminsTable = pgTable('admins', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('admin'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 作品（ワークス）テーブル
export const worksTable = pgTable('works', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  creatorId: integer('creator_id'), // ★追加：クリエイターと紐付けるID
  description: text('description'), // ★追加：作品の説明文
  projectUrl: varchar('project_url', { length: 500 }), // ★追加：作品のURL
  category: varchar('category', { length: 100 }),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// クリエイターテーブル
export const artistsTable = pgTable('artists', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  role: varchar('role', { length: 100 }),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ブログ記事テーブル
export const postsTable = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  tags: varchar('tags', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 公開ページの閲覧履歴
export const accessLogsTable = pgTable('access_logs', {
  id: serial('id').primaryKey(),
  trackingId: varchar('tracking_id', { length: 64 }).notNull().unique(),
  path: varchar('path', { length: 500 }).notNull(),
  userAgent: text('user_agent'),
  referer: text('referer'),
  duration: integer('duration'),
  maxScrollDepth: integer('max_scroll_depth'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// サイト基本設定（1行のみ利用）
export const siteSettingsTable = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  siteTitle: varchar('site_title', { length: 255 }).notNull().default('Besmile CMS Portfolio'),
  faviconUrl: text('favicon_url'),
  adminEmail: varchar('admin_email', { length: 255 }),
  smtpAppPassword: text('smtp_app_password'),
  autoReplyEnabled: boolean('auto_reply_enabled').notNull().default(false),
  autoReplySubject: varchar('auto_reply_subject', { length: 255 }).notNull().default('お問い合わせありがとうございます'),
  autoReplyBody: text('auto_reply_body').notNull().default('{{name}} 様\n\nお問い合わせありがとうございます。\n内容を確認のうえ、担当者よりご連絡いたします。'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const contactsTable = pgTable('contacts', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }),
  message: text('message').notNull(),
  status: varchar('status', { length: 30 }).notNull().default('new'),
  internalNote: text('internal_note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const contactFieldsTable = pgTable('contact_fields', {
  id: serial('id').primaryKey(),
  fieldKey: varchar('field_key', { length: 64 }).notNull().unique(),
  label: varchar('label', { length: 255 }).notNull(),
  type: varchar('type', { length: 30 }).notNull().default('text'),
  options: jsonb('options').$type<string[]>().notNull().default([]),
  isRequired: boolean('is_required').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const contactFieldValuesTable = pgTable('contact_field_values', {
  id: serial('id').primaryKey(),
  contactId: integer('contact_id').notNull(),
  fieldId: integer('field_id'),
  fieldKey: varchar('field_key', { length: 64 }).notNull(),
  labelSnapshot: varchar('label_snapshot', { length: 255 }).notNull(),
  value: text('value').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});