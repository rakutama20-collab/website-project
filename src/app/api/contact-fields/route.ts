import { NextResponse } from "next/server";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { CONTACT_FIELD_TYPES, isContactFieldType, isValidFieldKey } from "@/lib/contact-fields";
import { contactFieldsTable } from "@/lib/schema";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === "admin";
}

function parseField(body: Record<string, unknown>) {
  const fieldKey = typeof body.fieldKey === "string" ? body.fieldKey.trim().toLowerCase() : "";
  const label = typeof body.label === "string" ? body.label.trim().slice(0, 255) : "";
  const type = body.type;
  const options = Array.isArray(body.options) ? body.options.filter((option): option is string => typeof option === "string").map((option) => option.trim()).filter(Boolean).slice(0, 50) : [];
  const isRequired = body.isRequired === true;
  if (!isValidFieldKey(fieldKey)) return { error: "キーは英小文字で始まる2〜64文字の英数字・アンダースコアで入力してください" };
  if (!label) return { error: "ラベルを入力してください" };
  if (!isContactFieldType(type)) return { error: `入力タイプは ${CONTACT_FIELD_TYPES.join(", ")} のいずれかを指定してください` };
  if (type === "select" && options.length === 0) return { error: "選択肢を1つ以上入力してください" };
  if (type !== "select" && options.length > 0) return { error: "選択肢を指定できるのはselectタイプのみです" };
  return { value: { fieldKey, label, type, options, isRequired } };
}

export async function GET(request: Request) {
  const isPublic = new URL(request.url).searchParams.get("public") === "true";
  if (!isPublic && !(await requireAdmin())) return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  try {
    const fields = await db.select({ id: contactFieldsTable.id, fieldKey: contactFieldsTable.fieldKey, label: contactFieldsTable.label, type: contactFieldsTable.type, options: contactFieldsTable.options, isRequired: contactFieldsTable.isRequired, sortOrder: contactFieldsTable.sortOrder, isActive: contactFieldsTable.isActive }).from(contactFieldsTable).where(isPublic ? eq(contactFieldsTable.isActive, true) : undefined).orderBy(asc(contactFieldsTable.sortOrder), asc(contactFieldsTable.id));
    return NextResponse.json(fields);
  } catch (error) {
    console.error("Failed to fetch contact fields:", error);
    return NextResponse.json({ error: "フォーム項目の取得に失敗しました" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  try {
    const parsed = parseField(await request.json());
    if (parsed.error || !parsed.value) return NextResponse.json({ error: parsed.error || "入力内容が正しくありません" }, { status: 400 });
    const [last] = await db.select({ sortOrder: contactFieldsTable.sortOrder }).from(contactFieldsTable).orderBy(desc(contactFieldsTable.sortOrder)).limit(1);
    const [field] = await db.insert(contactFieldsTable).values({ ...parsed.value, sortOrder: (last?.sortOrder ?? -1) + 1 }).returning();
    return NextResponse.json(field, { status: 201 });
  } catch (error) {
    console.error("Failed to create contact field:", error);
    return NextResponse.json({ error: "フォーム項目の追加に失敗しました" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const id = Number(body.id);
    const parsed = parseField(body);
    if (!Number.isInteger(id) || parsed.error || !parsed.value) return NextResponse.json({ error: parsed.error || "更新内容が正しくありません" }, { status: 400 });
    const [field] = await db.update(contactFieldsTable).set({ ...parsed.value, updatedAt: new Date() }).where(eq(contactFieldsTable.id, id)).returning();
    if (!field) return NextResponse.json({ error: "フォーム項目が見つかりません" }, { status: 404 });
    return NextResponse.json(field);
  } catch (error) {
    console.error("Failed to update contact field:", error);
    return NextResponse.json({ error: "フォーム項目の更新に失敗しました" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  try {
    const body = await request.json() as { orderedIds?: unknown };
    if (!Array.isArray(body.orderedIds) || body.orderedIds.length > 100 || body.orderedIds.some((id) => !Number.isInteger(Number(id)))) return NextResponse.json({ error: "並び順が正しくありません" }, { status: 400 });
    const orderedIds = body.orderedIds.map(Number);
    const fields = await db.select({ id: contactFieldsTable.id }).from(contactFieldsTable).where(inArray(contactFieldsTable.id, orderedIds));
    if (fields.length !== orderedIds.length || new Set(orderedIds).size !== orderedIds.length) return NextResponse.json({ error: "存在しない項目が含まれています" }, { status: 400 });
    for (const [sortOrder, id] of orderedIds.entries()) await db.update(contactFieldsTable).set({ sortOrder, updatedAt: new Date() }).where(eq(contactFieldsTable.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder contact fields:", error);
    return NextResponse.json({ error: "フォーム項目の並び替えに失敗しました" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 });
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!Number.isInteger(id)) return NextResponse.json({ error: "項目IDが正しくありません" }, { status: 400 });
    const [field] = await db.update(contactFieldsTable).set({ isActive: false, updatedAt: new Date() }).where(eq(contactFieldsTable.id, id)).returning({ id: contactFieldsTable.id });
    if (!field) return NextResponse.json({ error: "フォーム項目が見つかりません" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to archive contact field:", error);
    return NextResponse.json({ error: "フォーム項目の削除に失敗しました" }, { status: 400 });
  }
}