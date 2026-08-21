import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { siteSettingsTable } from "@/lib/schema";
import { sendConfiguredMail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

async function getSettings() {
  const [settings] = await db.select().from(siteSettingsTable).limit(1);
  return settings;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });

  try {
    const settings = await getSettings();
    return NextResponse.json({
      siteTitle: settings?.siteTitle ?? "Besmile CMS Portfolio",
      faviconUrl: settings?.faviconUrl ?? "",
      adminEmail: settings?.adminEmail ?? "",
      hasSmtpAppPassword: Boolean(settings?.smtpAppPassword),
      autoReplyEnabled: Boolean(settings?.autoReplyEnabled),
      autoReplySubject: settings?.autoReplySubject ?? "お問い合わせありがとうございます",
      autoReplyBody: settings?.autoReplyBody ?? "{{name}} 様\n\nお問い合わせありがとうございます。\n内容を確認のうえ、担当者よりご連絡いたします。",
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
    const autoReplyEnabled = body.autoReplyEnabled === true;
    const autoReplySubject = typeof body.autoReplySubject === "string" ? body.autoReplySubject.trim().slice(0, 255) : "";
    const autoReplyBody = typeof body.autoReplyBody === "string" ? body.autoReplyBody.trim().slice(0, 10000) : "";

    if (!siteTitle) return NextResponse.json({ error: "サイトタイトルを入力してください" }, { status: 400 });
    if (!adminEmail) return NextResponse.json({ error: "管理者メールアドレスを入力してください" }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
      return NextResponse.json({ error: "メールアドレスの形式が正しくありません" }, { status: 400 });
    }
    if (autoReplyEnabled && (!autoReplySubject || !autoReplyBody)) return NextResponse.json({ error: "自動返信の件名と本文を入力してください" }, { status: 400 });

    const current = await getSettings();
    const values = {
      siteTitle,
      faviconUrl: faviconUrl || null,
      adminEmail: adminEmail || null,
      smtpAppPassword: smtpAppPassword || current?.smtpAppPassword || null,
      autoReplyEnabled,
      autoReplySubject: autoReplySubject || "お問い合わせありがとうございます",
      autoReplyBody: autoReplyBody || "{{name}} 様\n\nお問い合わせありがとうございます。\n内容を確認のうえ、担当者よりご連絡いたします。",
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

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin") return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  try {
    const settings = await getSettings();
    if (!settings?.adminEmail) return NextResponse.json({ error: "管理者メールアドレスを先に設定してください" }, { status: 400 });
    await sendConfiguredMail(settings, { to: settings.adminEmail, subject: "【テスト】Besmile CMSのメール設定", text: "このメールが届けば、SMTP設定は正常です。" });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send test email:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "テストメールの送信に失敗しました" }, { status: 502 });
  }
}