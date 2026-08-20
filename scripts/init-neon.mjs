import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function loadEnvFile() {
  const envPath = path.join(projectRoot, '.env.local');
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const values = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

const env = {
  ...process.env,
  ...loadEnvFile(),
};

const databaseUrl = env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL が設定されていません。');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function ensureSchema() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'admin',
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS works (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      status VARCHAR(50) NOT NULL DEFAULT 'draft',
      image_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS artists (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      role VARCHAR(100),
      avatar_url TEXT,
      bio TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`,
    `ALTER TABLE artists ADD COLUMN IF NOT EXISTS avatar_url TEXT`,
    `ALTER TABLE artists ADD COLUMN IF NOT EXISTS bio TEXT`,
    `CREATE TABLE IF NOT EXISTS access_logs (
      id SERIAL PRIMARY KEY,
      tracking_id VARCHAR(64) UNIQUE NOT NULL,
      path VARCHAR(500) NOT NULL,
      user_agent TEXT,
      referer TEXT,
      duration INTEGER,
      max_scroll_depth INTEGER,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`,
    `ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS tracking_id VARCHAR(64)`,
    `ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS duration INTEGER`,
    `ALTER TABLE access_logs ADD COLUMN IF NOT EXISTS max_scroll_depth INTEGER`,
    `UPDATE access_logs SET tracking_id = 'legacy-' || id::text WHERE tracking_id IS NULL`,
    `ALTER TABLE access_logs ALTER COLUMN tracking_id SET NOT NULL`,
    `CREATE UNIQUE INDEX IF NOT EXISTS access_logs_tracking_id_idx ON access_logs (tracking_id)`,
    `CREATE INDEX IF NOT EXISTS access_logs_created_at_idx ON access_logs (created_at)`,
    `CREATE TABLE IF NOT EXISTS site_settings (
      id SERIAL PRIMARY KEY,
      site_title VARCHAR(255) NOT NULL DEFAULT 'Besmile CMS Portfolio',
      favicon_url TEXT,
      admin_email VARCHAR(255),
      smtp_app_password TEXT,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'draft',
      tags VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`,
  ];

  for (const statement of statements) {
    await sql.query(statement);
  }
}

async function seedAdmins() {
  const passwordHash = await bcrypt.hash('besmile7011', 10);
  const accounts = [
    { email: 'admin@besmile.jp', name: '管理者', role: 'admin', status: 'active' },
    { email: 'editor@besmile.jp', name: '編集者', role: 'editor', status: 'active' },
    { email: 'viewer@besmile.jp', name: '閲覧者', role: 'viewer', status: 'active' },
  ];

  for (const account of accounts) {
    await sql`
      INSERT INTO admins (email, password_hash, name, role, status)
      VALUES (${account.email}, ${passwordHash}, ${account.name}, ${account.role}, ${account.status})
      ON CONFLICT (email) DO NOTHING
    `;
  }
}

async function main() {
  console.log('Neonデータベースの初期化を開始します...');
  await ensureSchema();
  await seedAdmins();
  console.log('初期化が完了しました。');
  console.log('ログイン用アカウント:');
  console.log(' - admin@besmile.jp / besmile7011');
  console.log(' - editor@besmile.jp / besmile7011');
  console.log(' - viewer@besmile.jp / besmile7011');
}

main().catch((error) => {
  console.error('初期化に失敗しました。', error);
  process.exit(1);
});
