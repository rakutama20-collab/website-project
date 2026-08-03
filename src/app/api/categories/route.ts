import { NextResponse } from "next/server";

// ご希望のカテゴリ一覧に更新
let categoriesData = [
  { id: 1, name: "WEB制作" },
  { id: 2, name: "動画" },
  { id: 3, name: "DTP" },
  { id: 4, name: "イラスト" },
  { id: 5, name: "Other（3D、ゲーム、音源など）" },
];

// GET: カテゴリ一覧取得
export async function GET() {
  try {
    return NextResponse.json(categoriesData);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST: 新規カテゴリ追加
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const newCategory = {
      id: Date.now(),
      name: body.name,
    };
    categoriesData.push(newCategory);
    return NextResponse.json(newCategory, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

// DELETE: カテゴリ削除
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    categoriesData = categoriesData.filter((cat) => cat.id !== id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}