import { db } from "./db";
import { worksTable } from "./schema";
import { eq, desc } from "drizzle-orm";

export type Work = {
  id: number;
  title: string;
  category: string | null;
  status: string;
  imageUrl: string | null;
  createdAt: string;
};

// 作品一覧をデータベースから取得する関数
export async function getWorks(): Promise<Work[]> {
  try {
    const result = await db
      .select()
      .from(worksTable)
      .orderBy(desc(worksTable.createdAt));

    return result.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      status: row.status,
      imageUrl: row.imageUrl,
      createdAt: row.createdAt.toISOString(),
    }));
  } catch (error) {
    console.warn("[works] could not fetch works", error);
    return [];
  }
}