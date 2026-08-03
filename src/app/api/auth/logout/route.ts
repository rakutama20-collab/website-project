import { NextResponse } from "next/server";

export async function POST() {
  // 本来はCookieやセッションを削除する処理をここに書きます
  return NextResponse.json({ success: true, message: "ログアウトしました" });
}