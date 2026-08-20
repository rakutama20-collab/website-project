import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile() {
  const envPath = path.join(projectRoot, ".env.local");
  if (!fs.existsSync(envPath)) return {};

  return Object.fromEntries(
    fs.readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.trim().startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
        return [key, value];
      }),
  );
}

const env = { ...loadEnvFile(), ...process.env };
const email = (env.ADMIN_EMAIL || "admin@besmile.jp").trim().toLowerCase();
const password = env.ADMIN_PASSWORD || "besmile7011";
const name = env.ADMIN_NAME || "管理者";
const role = env.ADMIN_ROLE || "admin";

if (!env.DATABASE_URL) {
  console.error("DATABASE_URL が設定されていません。");
  process.exit(1);
}

if (password.length < 8) {
  console.error("ADMIN_PASSWORD は8文字以上にしてください。");
  process.exit(1);
}

const sql = neon(env.DATABASE_URL);
const passwordHash = await bcrypt.hash(password, 12);

await sql`
  INSERT INTO admins (email, password_hash, name, role, status)
  VALUES (${email}, ${passwordHash}, ${name}, ${role}, 'active')
  ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    status = 'active'
`;

console.log(`管理者アカウントを登録・更新しました: ${email} (${role})`);