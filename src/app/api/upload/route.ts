import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "ファイルがありません" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ファイル名を重複しないように現在時刻の数字を頭に付ける
    const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const filePath = path.join(uploadDir, uniqueFilename);

    // ファイルをサーバーに保存
    await writeFile(filePath, buffer);

    // フロント側で表示するための画像パスを返す
    const imageUrl = `/uploads/${uniqueFilename}`;
    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "ファイルのアップロードに失敗しました" }, { status: 500 });
  }
}