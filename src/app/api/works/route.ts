import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { worksTable } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

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
    const [newWork] = await db
      .insert(worksTable)
      .values({
        title: body.title || "無題の作品",
        category: body.category || body.role || "",
        status: body.status || "draft",
        imageUrl: body.imageUrl || body.url || "",
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
    const { id, title, category, status, imageUrl, url } = body;
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db
      .update(worksTable)
      .set({
        ...(title !== undefined && { title }),
        ...(category !== undefined && { category }),
        ...(status !== undefined && { status }),
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