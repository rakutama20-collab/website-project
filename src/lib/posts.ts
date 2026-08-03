import { db } from "./db";
import { postsTable } from "./schema";
import { desc } from "drizzle-orm";

export type Post = {
  id: number;
  title: string;
  content: string | null;
  status: string;
  tags: string | null;
  createdAt: string;
  updatedAt: string;
};

// ブログ記事一覧をデータベースから取得する関数
export async function getPosts(): Promise<Post[]> {
  try {
    const result = await db
      .select()
      .from(postsTable)
      .orderBy(desc(postsTable.createdAt));

    return result.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      status: row.status,
      tags: row.tags,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.warn("[posts] could not fetch posts", error);
    return [];
  }
}