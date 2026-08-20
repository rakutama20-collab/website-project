import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { artistsTable } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

// クリエイター一覧を取得 (GET)
export async function GET() {
  try {
    const results = await db
      .select()
      .from(artistsTable)
      .orderBy(desc(artistsTable.createdAt));
    return NextResponse.json(results);
  } catch (error) {
    console.error("Failed to fetch artists:", error);
    return NextResponse.json({ error: "Failed to fetch artists" }, { status: 500 });
  }
}

// クリエイターを新規追加 (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [newArtist] = await db
      .insert(artistsTable)
      .values({
        name: body.name || "名無し",
        email: body.email || null,
        role: body.role || null,
        avatarUrl: body.avatarUrl || null,
        bio: body.bio || null,
        status: body.status || "active",
      })
      .returning();

    return NextResponse.json(newArtist, { status: 201 });
  } catch (err) {
    console.error("Failed to create artist:", err);
    return NextResponse.json({ error: "Failed to create artist" }, { status: 500 });
  }
}

// クリエイターを更新 (PUT)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, role, avatarUrl, bio, status } = body;
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db
      .update(artistsTable)
      .set({
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(role !== undefined && { role }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(bio !== undefined && { bio }),
        ...(status !== undefined && { status }),
      })
      .where(eq(artistsTable.id, Number(id)));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update artist:", err);
    return NextResponse.json({ error: "Failed to update artist" }, { status: 500 });
  }
}

// クリエイターを削除 (DELETE)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db.delete(artistsTable).where(eq(artistsTable.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete artist:", err);
    return NextResponse.json({ error: "Failed to delete artist" }, { status: 500 });
  }
}