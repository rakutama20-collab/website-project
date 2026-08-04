import { neon } from '@neondatabase/serverless';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

const env = { ...process.env, ...loadEnvFile() };
const databaseUrl = env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL が設定されていません。');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function main() {
  const rows = await sql`SELECT email, name, role, status FROM admins ORDER BY id`;
  console.log('adminsテーブルの内容:');
  console.table(rows);
}

main().catch((error) => {
  console.error('確認に失敗しました。', error);
  process.exit(1);
});
