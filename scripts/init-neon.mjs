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
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
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
  const passwordHash = await bcrypt.hash('password', 10);
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
  console.log(' - admin@besmile.jp / password');
  console.log(' - editor@besmile.jp / password');
  console.log(' - viewer@besmile.jp / password');
}

main().catch((error) => {
  console.error('初期化に失敗しました。', error);
  process.exit(1);
});
