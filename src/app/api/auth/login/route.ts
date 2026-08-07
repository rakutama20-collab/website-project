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
      return NextResponse.json({ success: true });
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