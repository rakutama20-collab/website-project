import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { siteSettingsTable } from "@/lib/schema";

export const dynamic = "force-dynamic";

async function getSettings() {
  const [settings] = await db.select().from(siteSettingsTable).limit(1);
  return settings;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const settings = await getSettings();
    return NextResponse.json({
      siteTitle: settings?.siteTitle ?? "Besmile CMS Portfolio",
      faviconUrl: settings?.faviconUrl ?? "",
      adminEmail: settings?.adminEmail ?? "",
      hasSmtpAppPassword: Boolean(settings?.smtpAppPassword),
    });
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    return NextResponse.json({ error: "設定の取得に失敗しました" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });

  try {
    const body = await request.json();
    const siteTitle = typeof body.siteTitle === "string" ? body.siteTitle.trim().slice(0, 255) : "";
    const faviconUrl = typeof body.faviconUrl === "string" ? body.faviconUrl.trim().slice(0, 1000) : "";
    const adminEmail = typeof body.adminEmail === "string" ? body.adminEmail.trim().slice(0, 255) : "";
    const smtpAppPassword = typeof body.smtpAppPassword === "string" ? body.smtpAppPassword.trim() : "";

    if (!siteTitle) return NextResponse.json({ error: "サイトタイトルを入力してください" }, { status: 400 });
    if (adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
      return NextResponse.json({ error: "メールアドレスの形式が正しくありません" }, { status: 400 });
    }

    const current = await getSettings();
    const values = {
      siteTitle,
      faviconUrl: faviconUrl || null,
      adminEmail: adminEmail || null,
      smtpAppPassword: smtpAppPassword || current?.smtpAppPassword || null,
      updatedAt: new Date(),
    };

    if (current) {
      await db.update(siteSettingsTable).set(values).where(eq(siteSettingsTable.id, current.id));
    } else {
      await db.insert(siteSettingsTable).values(values);
    }

    return NextResponse.json({ success: true, hasSmtpAppPassword: Boolean(values.smtpAppPassword) });
  } catch (error) {
    console.error("Failed to save site settings:", error);
    return NextResponse.json({ error: "設定の保存に失敗しました" }, { status: 500 });
  }
}