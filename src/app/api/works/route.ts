import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { worksTable } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

// ★追加：Next.jsのAPIキャッシュを無効化し、常に最新のデータを取得させる設定
export const dynamic = "force-dynamic";

// 作品一覧を取得 (GET)
export async function GET() {
  try {
    const results = await db
      .select()
      .from(worksTable)
      .orderBy(desc(worksTable.createdAt));
    return NextResponse.json(results);
  } catch (error) {
    console.error("Failed to fetch works:", error);
    return NextResponse.json({ error: "Failed to fetch works" }, { status: 500 });
  }
}

// 作品を新規追加 (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const titleStr = typeof body.title === 'string' ? body.title : "無題の作品";
    const categoryStr = typeof body.category === 'string' ? body.category : (body.role || "");
    const statusStr = typeof body.status === 'string' ? body.status : "draft";

    const [newWork] = await db
      .insert(worksTable)
      .values({
        title: titleStr.substring(0, 250),
        creatorId: body.creatorId ? Number(body.creatorId) : null,
        description: body.description || "",
        projectUrl: body.projectUrl || "", 
        category: categoryStr.substring(0, 90),
        status: statusStr.substring(0, 40),
        imageUrl: body.url || body.imageUrl || "", 
      })
      .returning();

    return NextResponse.json(newWork, { status: 201 });
  } catch (err) {
    console.error("Failed to create work:", err);
    return NextResponse.json({ error: "Failed to create work" }, { status: 500 });
  }
}

// 作品を更新 (PUT)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, creatorId, description, projectUrl, category, status, imageUrl, url } = body;
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db
      .update(worksTable)
      .set({
        ...(title !== undefined && { title: String(title).substring(0, 250) }),
        // ★修正：未選択の場合は確実にnullになるように修正
        ...(creatorId !== undefined && { creatorId: creatorId ? Number(creatorId) : null }),
        ...(description !== undefined && { description }),
        ...(projectUrl !== undefined && { projectUrl }),
        ...(category !== undefined && { category: String(category).substring(0, 90) }),
        ...(status !== undefined && { status: String(status).substring(0, 40) }),
        ...((imageUrl !== undefined || url !== undefined) && { imageUrl: imageUrl || url }),
      })
      .where(eq(worksTable.id, Number(id)));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update work:", err);
    return NextResponse.json({ error: "Failed to update work" }, { status: 500 });
  }
}

// 作品を削除 (DELETE)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db.delete(worksTable).where(eq(worksTable.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete work:", err);
    return NextResponse.json({ error: "Failed to delete work" }, { status: 500 });
  }
}