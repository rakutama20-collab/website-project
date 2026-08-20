import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

const publicPaths = ["/login"];

function isPublicPage(pathname: string) {
  const isArtistsPage = pathname === "/artists" || (pathname.startsWith("/artists/") && !pathname.startsWith("/artists/admin"));
  const isWorksPage = pathname === "/works";
  return isArtistsPage || isWorksPage;
}

export default auth((request) => {
  const { pathname } = request.nextUrl;

  if (publicPaths.includes(pathname) || pathname === "/api/access-log" || pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  if (isPublicPage(pathname)) {
    return NextResponse.next();
  }

  const user = request.auth?.user;
  const isApiRequest = pathname.startsWith("/api/");
  const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);

  if (!user) {
    if (isApiRequest) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isMutation && user.role === "viewer") {
    return NextResponse.json({ error: "編集権限がありません。" }, { status: 403 });
  }

  if (isMutation && request.method === "DELETE" && user.role !== "admin") {
    return NextResponse.json({ error: "削除には管理者権限が必要です。" }, { status: 403 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};