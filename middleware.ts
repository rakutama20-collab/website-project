import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 公開パス
const publicPaths = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 公開ページ（/login）や、認証処理用のAPI（/api/auth/...）は無条件で通す
  if (publicPaths.includes(pathname) || pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // クッキーからセッションを確認
  const session = request.cookies.get("besmile-cms-session");

  // 2. その他のAPI（データ取得など）へのアクセスのうち、未ログインのものは弾く
  if (pathname.startsWith("/api/")) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // 3. 管理画面（ダッシュボード等）へのアクセスで未ログインならログイン画面へリダイレクト
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};