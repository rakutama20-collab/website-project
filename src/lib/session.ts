import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import type { SessionUser } from "./auth";

// 環境変数から SESSION_PASSWORD を取得（最小32文字を推奨）
const sessionPassword = process.env.SESSION_PASSWORD;

if (!sessionPassword || sessionPassword.length < 32) {
  console.warn(
    "Warning: SESSION_PASSWORD is not set or too short. Using default value for development only."
  );
}

const sessionConfig = {
  password: sessionPassword || "default-secret-key-change-in-production-minimum-32-char",
  cookieName: "besmile-cms-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 24 * 60 * 60, // 24 hours
  },
};

export type Session = {
  user?: SessionUser;
};

export async function getSession(): Promise<Session & { save(): Promise<void>; destroy(): Promise<void> }> {
  const cookieStore = await cookies();
  const session = await getIronSession<Session>(cookieStore, sessionConfig);
  return session as any;
}

export async function setSessionUser(user: SessionUser): Promise<void> {
  const session = await getSession();
  session.user = user;
  await session.save();
}

export async function clearSession(): Promise<void> {
  const session = await getSession();
  await session.destroy();
}