import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 公開パス
const publicPaths = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 公開パスはスキップ
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // API保護（/api/auth/login, /api/auth/logout は除外）
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    // APIエンドポイントはクッキーから確認
    const session = request.cookies.get("besmile-cms-session");
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // 管理画面へのアクセス（/以外はすべて保護）
  if (pathname !== "/login") {
    const session = request.cookies.get("besmile-cms-session");

    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
