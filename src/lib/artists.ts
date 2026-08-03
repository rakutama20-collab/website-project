import { db } from "./db";
import { artistsTable } from "./schema";
import { desc } from "drizzle-orm";

export type Artist = {
  id: number;
  name: string;
  email: string | null;
  role: string | null;
  status: string;
  createdAt: string;
};

// クリエイター一覧をデータベースから取得する関数
export async function getArtists(): Promise<Artist[]> {
  try {
    const result = await db
      .select()
      .from(artistsTable)
      .orderBy(desc(artistsTable.createdAt));

    return result.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
    }));
  } catch (error) {
    console.warn("[artists] could not fetch artists", error);
    return [];
  }
}