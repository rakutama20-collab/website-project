import { NextResponse } from "next/server";
import { desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { accessLogsTable } from "@/lib/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [recent, monthly, engagement] = await Promise.all([
      db.select().from(accessLogsTable).orderBy(desc(accessLogsTable.createdAt)).limit(20),
      db.execute(sql`
        SELECT
          TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
          COUNT(*)::int AS count
        FROM access_logs
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at) ASC
      `),
      db.execute(sql`
        SELECT
          COALESCE(AVG(duration) FILTER (WHERE duration IS NOT NULL), 0)::float AS average_duration,
          COALESCE(AVG(max_scroll_depth) FILTER (WHERE max_scroll_depth IS NOT NULL), 0)::float AS average_scroll_depth
        FROM access_logs
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
      `),
    ]);

    return NextResponse.json({
      recent,
      monthly: monthly.rows,
      engagement: engagement.rows[0] ?? { average_duration: 0, average_scroll_depth: 0 },
    });
  } catch (error) {
    console.error("Failed to fetch access logs:", error);
    return NextResponse.json({ error: "Failed to fetch access logs" }, { status: 500 });
  }
}