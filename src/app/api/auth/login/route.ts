import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (
      (email === "admin@besmile.jp" && password === "besmile7011") ||
      (email === "editor@besmile.jp" && password === "besmile7011") ||
      (email === "viewer@besmile.jp" && password === "besmile7011")
    ) {
      // 成功時にクッキー（besmile-cms-session）を付与してレスポンスを返す
      const response = NextResponse.json({ success: true });
      response.cookies.set({
        name: "besmile-cms-session",
        value: "authenticated",
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24, // 1日有効
      });
      return response;
    }

    return NextResponse.json(
      { error: "メールアドレスまたはパスワードが正しくありません。" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}