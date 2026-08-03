import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminsTable } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "メールアドレスとパスワードを入力してください" },
        { status: 400 }
      );
    }

    // データベースから管理者情報を検索
    const [admin] = await db
      .select()
      .from(adminsTable)
      .where(eq(adminsTable.email, email));

    // 管理者が存在しない、またはパスワードが一致しない場合
    if (!admin || admin.passwordHash !== password) {
      return NextResponse.json(
        { error: "メールアドレスまたはパスワードが正しくありません。" },
        { status: 401 }
      );
    }

    // ログイン成功
    return NextResponse.json({
      success: true,
      message: "ログインに成功しました",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}