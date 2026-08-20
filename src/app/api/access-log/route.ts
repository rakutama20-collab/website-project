import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { accessLogsTable } from "@/lib/schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const path = typeof body.path === "string" ? body.path.slice(0, 500) : "";
    const trackingId = typeof body.trackingId === "string" ? body.trackingId.slice(0, 64) : "";
    const duration = Number.isFinite(body.duration) ? Math.min(Math.max(Math.round(body.duration), 0), 86400) : null;
    const maxScrollDepth = Number.isFinite(body.maxScrollDepth) ? Math.min(Math.max(Math.round(body.maxScrollDepth), 0), 100) : null;

    if (!trackingId || !/^[A-Za-z0-9_-]{16,64}$/.test(trackingId) || !path.startsWith("/")) {
      return NextResponse.json({ error: "Tracking data is invalid" }, { status: 400 });
    }

    await db.insert(accessLogsTable).values({
      trackingId,
      path,
      userAgent: typeof body.userAgent === "string" ? body.userAgent.slice(0, 2000) : null,
      referer: typeof body.referer === "string" ? body.referer.slice(0, 2000) : null,
      duration,
      maxScrollDepth,
    }).onConflictDoUpdate({
      target: accessLogsTable.trackingId,
      set: {
        duration,
        maxScrollDepth,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to record access log:", error);
    return NextResponse.json({ error: "Failed to record access log" }, { status: 500 });
  }
}