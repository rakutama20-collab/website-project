import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { postsTable } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

// 記事一覧を取得 (GET)
export async function GET() {
  try {
    const results = await db
      .select()
      .from(postsTable)
      .orderBy(desc(postsTable.createdAt));
    return NextResponse.json(results);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// 記事を新規追加 (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [newPost] = await db
      .insert(postsTable)
      .values({
        title: body.title || "無題の投稿",
        content: body.content || body.body || "",
        status: body.status || "draft",
        tags: body.tags || "",
      })
      .returning();

    return NextResponse.json(newPost, { status: 201 });
  } catch (err) {
    console.error("Failed to create post:", err);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

// 記事を更新 (PUT)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, content, body: postBody, status, tags } = body;
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db
      .update(postsTable)
      .set({
        ...(title !== undefined && { title }),
        ...((content !== undefined || postBody !== undefined) && { content: content || postBody }),
        ...(status !== undefined && { status }),
        ...(tags !== undefined && { tags }),
        updatedAt: new Date(),
      })
      .where(eq(postsTable.id, Number(id)));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update post:", err);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

// 記事を削除 (DELETE)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db.delete(postsTable).where(eq(postsTable.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete post:", err);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}