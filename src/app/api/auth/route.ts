import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // どんなデータが届いているかログに残す
    console.log("受信したデータ:", { email, password });

    // テスト用の簡易認証
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
    // エラーの本当の原因をログに残す
    console.error("【エラー詳細】:", error);
    
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}