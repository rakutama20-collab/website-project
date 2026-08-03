import { NextResponse } from "next/server";

// お問い合わせデータを保持するメモリ上の配列（必要に応じてDBやファイルに保存するように拡張できます）
let contactsData: {
  id: number;
  name: string;
  company: string;
  email: string;
  message: string;
  createdAt: string;
}[] = [];

// GET: お問い合わせ一覧の取得（管理画面用）
export async function GET() {
  try {
    return NextResponse.json(contactsData);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

// POST: お問い合わせの送信（フロントのフォームから）
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: "必須項目が入力されていません" }, { status: 400 });
    }

    const newContact = {
      id: Date.now(),
      name: body.name,
      company: body.company || "",
      email: body.email,
      message: body.message,
      createdAt: new Date().toISOString(),
    };

    contactsData.unshift(newContact); // 新しいものを先頭に追加
    return NextResponse.json({ success: true, data: newContact }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to submit contact" }, { status: 500 });
  }
}