import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (
      (email === "admin@besmile.jp" && password === "password") ||
      (email === "editor@besmile.jp" && password === "password") ||
      (email === "viewer@besmile.jp" && password === "password")
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