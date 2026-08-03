import { NextResponse } from "next/server";

// メモリ上の仮のメディアデータ
let mediaData = [
  { id: 1, url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop", name: "sample-bg-1.jpg" },
  { id: 2, url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=400&auto=format&fit=crop", name: "sample-gradient.jpg" },
];

// GET: メディア一覧取得
export async function GET() {
  try {
    return NextResponse.json(mediaData);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

// POST: メディア追加
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }
    const newMedia = {
      id: Date.now(),
      url: body.url,
      name: body.name || "uploaded-image",
    };
    mediaData.push(newMedia);
    return NextResponse.json(newMedia, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create media" }, { status: 500 });
  }
}

// DELETE: メディア削除
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    mediaData = mediaData.filter((item) => item.id !== id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}