import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. エラーで処理が落ちないよう、まずはテキストとして安全にデータを受け取る
    const text = await request.text();
    
    if (!text) {
      return NextResponse.json({ error: "データが空で送信されました。" }, { status: 400 });
    }

    // 2. 受け取ったテキストをJSONに変換
    const body = JSON.parse(text);
    const { email, password } = body;

    // 3. 認証処理
    if (
      (email === "admin@besmile.jp" && password === "password") ||
      (email === "editor@besmile.jp" && password === "password") ||
      (email === "viewer@besmile.jp" && password === "password")
    ) {
      return NextResponse.json({ success: true });
    }

    // 認証失敗時
    return NextResponse.json(
      { error: "メールアドレスまたはパスワードが正しくありません。" },
      { status: 401 }
    );

  } catch (error: any) {
    // ★万が一サーバーエラーが起きても、システムを止めずに「画面に直接エラーの理由を出す」
    return NextResponse.json(
      { error: `システムエラー詳細: ${error.message || "不明なエラー"}` },
      { status: 200 } // あえて200（成功扱い）で返し、ログイン画面に直接赤い文字でエラー内容を表示させます
    );
  }
}