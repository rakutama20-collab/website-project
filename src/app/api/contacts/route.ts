import { NextResponse } from "next/server";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sendConfiguredMail } from "@/lib/mailer";
import { contactFieldValuesTable, contactFieldsTable, contactsTable, siteSettingsTable } from "@/lib/schema";
import { isContactFieldType } from "@/lib/contact-fields";

export const dynamic = "force-dynamic";
const statuses = ["new", "in_progress", "completed", "spam"] as const;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const requestLog = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const recent = (requestLog.get(ip) || []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    requestLog.set(ip, recent);
    return true;
  }
  recent.push(now);
  requestLog.set(ip, recent);
  return false;
}

async function getSettings() {
  const [settings] = await db.select().from(siteSettingsTable).limit(1);
  return settings;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("q")?.trim();
  const filters = [];
  if (status && statuses.includes(status as (typeof statuses)[number])) filters.push(eq(contactsTable.status, status));
  if (search) filters.push(or(ilike(contactsTable.name, `%${search}%`), ilike(contactsTable.email, `%${search}%`), ilike(contactsTable.subject, `%${search}%`)));

  try {
    const contacts = await db.select().from(contactsTable).where(filters.length ? and(...filters) : undefined).orderBy(desc(contactsTable.createdAt));
    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Failed to fetch contacts:", error);
    return NextResponse.json({ error: "お問い合わせの取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (isRateLimited(request)) return NextResponse.json({ error: "送信回数が上限に達しました。しばらくしてからお試しください" }, { status: 429 });
    const body = await request.json();
    if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ error: "送信に失敗しました" }, { status: 400 });
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 255) : "";
    const company = typeof body.company === "string" ? body.company.trim().slice(0, 255) : "";
    const email = typeof body.email === "string" ? body.email.trim().slice(0, 255) : "";
    const subject = typeof body.subject === "string" ? body.subject.trim().slice(0, 255) : "";
    const message = typeof body.message === "string" ? body.message.trim().slice(0, 10000) : "";
    if (!name || !email || !message) return NextResponse.json({ error: "必須項目が入力されていません" }, { status: 400 });
    if (!emailPattern.test(email)) return NextResponse.json({ error: "メールアドレスの形式が正しくありません" }, { status: 400 });

    const customFields = body.customFields && typeof body.customFields === "object" && !Array.isArray(body.customFields) ? body.customFields as Record<string, unknown> : {};
    const activeFields = await db.select().from(contactFieldsTable).where(eq(contactFieldsTable.isActive, true)).orderBy(asc(contactFieldsTable.sortOrder), asc(contactFieldsTable.id));
    const dynamicValues: { fieldId: number; fieldKey: string; labelSnapshot: string; value: string }[] = [];
    for (const field of activeFields) {
      if (!isContactFieldType(field.type)) return NextResponse.json({ error: "フォーム設定に不正な入力タイプがあります" }, { status: 500 });
      const rawValue = customFields[field.fieldKey];
      const value = field.type === "checkbox" ? (rawValue === true ? "true" : rawValue === false || rawValue === undefined ? "false" : "") : typeof rawValue === "string" ? rawValue.trim().slice(0, 10000) : "";
      if (field.isRequired && !value) return NextResponse.json({ error: `${field.label}を入力してください` }, { status: 400 });
      if (field.type === "email" && value && !emailPattern.test(value)) return NextResponse.json({ error: `${field.label}の形式が正しくありません` }, { status: 400 });
      if (field.type === "select" && value && !(field.options || []).includes(value)) return NextResponse.json({ error: `${field.label}の選択値が正しくありません` }, { status: 400 });
      if (value) dynamicValues.push({ fieldId: field.id, fieldKey: field.fieldKey, labelSnapshot: field.label, value });
    }

    const contact = await db.transaction(async (transaction) => {
      const [createdContact] = await transaction.insert(contactsTable).values({ name, company: company || null, email, subject: subject || null, message }).returning();
      if (dynamicValues.length) await transaction.insert(contactFieldValuesTable).values(dynamicValues.map((item) => ({ ...item, contactId: createdContact.id })));
      return createdContact;
    });
    const settings = await getSettings();
    let emailWarning = false;
    if (settings?.adminEmail) {
      const mailTasks = [sendConfiguredMail(settings, { to: settings.adminEmail, subject: `【お問い合わせ】${subject || "件名なし"}`, text: `お名前: ${name}\nメール: ${email}\n会社名: ${company || "-"}\n\n${message}` })];
      if (settings.autoReplyEnabled) {
        const replace = (template: string) => template.replaceAll("{{name}}", name).replaceAll("{{message}}", message).replaceAll("{{siteTitle}}", settings.siteTitle);
        mailTasks.push(sendConfiguredMail(settings, { to: email, subject: replace(settings.autoReplySubject), text: replace(settings.autoReplyBody) }));
      }
      const mailResults = await Promise.allSettled(mailTasks);
      emailWarning = mailResults.some((result) => result.status === "rejected");
      if (emailWarning) console.error("One or more contact emails failed to send", mailResults.filter((result) => result.status === "rejected"));
    }
    return NextResponse.json({ success: true, data: contact, emailWarning }, { status: 201 });
  } catch (error) {
    console.error("Failed to submit contact:", error);
    return NextResponse.json({ error: "お問い合わせの送信に失敗しました" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  try {
    const body = await request.json();
    const id = Number(body.id);
    const status = typeof body.status === "string" ? body.status : "";
    const internalNote = typeof body.internalNote === "string" ? body.internalNote.trim().slice(0, 10000) : "";
    if (!Number.isInteger(id) || !statuses.includes(status as (typeof statuses)[number])) return NextResponse.json({ error: "更新内容が正しくありません" }, { status: 400 });
    const [contact] = await db.update(contactsTable).set({ status, internalNote: internalNote || null, updatedAt: new Date() }).where(eq(contactsTable.id, id)).returning();
    return NextResponse.json(contact);
  } catch (error) {
    console.error("Failed to update contact:", error);
    return NextResponse.json({ error: "お問い合わせの更新に失敗しました" }, { status: 500 });
  }
}