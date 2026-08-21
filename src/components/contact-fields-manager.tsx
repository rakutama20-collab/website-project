"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";

type Field = { id: number; fieldKey: string; label: string; type: string; options: string[]; isRequired: boolean; sortOrder: number; isActive: boolean };
type Draft = { fieldKey: string; label: string; type: string; options: string; isRequired: boolean };
const emptyDraft: Draft = { fieldKey: "", label: "", type: "text", options: "", isRequired: false };
const types = [{ value: "text", label: "テキスト" }, { value: "email", label: "メール" }, { value: "textarea", label: "長文" }, { value: "select", label: "選択肢" }, { value: "checkbox", label: "チェックボックス" }];

export function ContactFieldsManager() {
  const [fields, setFields] = useState<Field[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/contact-fields", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "項目を取得できませんでした");
      setFields(data);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "項目を取得できませんでした");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { fieldKey: draft.fieldKey, label: draft.label, type: draft.type, options: draft.options.split("\n").map((item) => item.trim()).filter(Boolean), isRequired: draft.isRequired };
      const response = await fetch("/api/contact-fields", { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingId ? { ...payload, id: editingId } : payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "保存に失敗しました");
      toast.success(editingId ? "項目を更新しました" : "項目を追加しました");
      setDraft(emptyDraft);
      setEditingId(null);
      await load();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const edit = (field: Field) => { setEditingId(field.id); setDraft({ fieldKey: field.fieldKey, label: field.label, type: field.type, options: field.options.join("\n"), isRequired: field.isRequired }); };
  const archive = async (id: number) => {
    if (!window.confirm("この項目を非表示にしますか？過去の回答は保持されます。")) return;
    const response = await fetch(`/api/contact-fields?id=${id}`, { method: "DELETE" });
    if (!response.ok) { const data = await response.json(); toast.error(data.error || "削除に失敗しました"); return; }
    toast.success("項目を非表示にしました");
    await load();
  };
  const move = async (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= fields.length) return;
    const next = [...fields];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setFields(next);
    const response = await fetch("/api/contact-fields", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderedIds: next.map((field) => field.id) }) });
    if (!response.ok) { toast.error("並び替えに失敗しました"); await load(); }
  };

  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><h2 className="text-base font-bold text-slate-900">登録済みの項目</h2><p className="mt-1 text-xs text-slate-500">上下ボタンで公開フォームの表示順を変更できます。</p></div><div className="divide-y divide-slate-100">{loading ? <p className="p-8 text-center text-sm text-slate-400">読み込み中...</p> : fields.length === 0 ? <p className="p-8 text-center text-sm text-slate-400">追加項目はまだありません。</p> : fields.map((field, index) => <div key={field.id} className="flex items-start gap-3 p-4"><div className="flex flex-col gap-1"><button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="上へ移動" className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-sky-600 disabled:opacity-30"><ChevronUp size={16} /></button><button type="button" onClick={() => move(index, 1)} disabled={index === fields.length - 1} aria-label="下へ移動" className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-sky-600 disabled:opacity-30"><ChevronDown size={16} /></button></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-bold text-slate-800">{field.label}</p><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{field.type}</span>{field.isRequired && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">必須</span>}</div><p className="mt-1 text-xs text-slate-400">キー: {field.fieldKey}{field.options.length > 0 ? ` / 選択肢: ${field.options.join(", ")}` : ""}</p></div><div className="flex shrink-0 gap-1"><button type="button" onClick={() => edit(field)} aria-label="項目を編集" className="rounded-lg p-2 text-slate-400 hover:bg-sky-50 hover:text-sky-600"><Pencil size={16} /></button><button type="button" onClick={() => archive(field.id)} aria-label="項目を削除" className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button></div></div>)}</div></section>
    <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4"><div><h2 className="text-base font-bold text-slate-900">{editingId ? "項目を編集" : "項目を追加"}</h2><p className="mt-1 text-xs text-slate-500">公開フォームに表示する追加項目です。</p></div>{editingId && <button type="button" onClick={() => { setEditingId(null); setDraft(emptyDraft); }} aria-label="編集をキャンセル" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={17} /></button>}</div><form onSubmit={save} className="space-y-4"><div><label htmlFor="field-key" className="mb-1.5 block text-xs font-bold text-slate-600">フィールドキー</label><input id="field-key" value={draft.fieldKey} onChange={(event) => setDraft({ ...draft, fieldKey: event.target.value })} disabled={Boolean(editingId)} required pattern="[a-z][a-z0-9_]{1,63}" placeholder="budget" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:bg-white" /><p className="mt-1 text-[11px] text-slate-400">英小文字で始める英数字・アンダースコア</p></div><div><label htmlFor="field-label" className="mb-1.5 block text-xs font-bold text-slate-600">表示ラベル</label><input id="field-label" value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value })} required maxLength={255} placeholder="ご予算" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:bg-white" /></div><div><label htmlFor="field-type" className="mb-1.5 block text-xs font-bold text-slate-600">入力タイプ</label><select id="field-type" value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:bg-white">{types.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></div>{draft.type === "select" && <div><label htmlFor="field-options" className="mb-1.5 block text-xs font-bold text-slate-600">選択肢（1行1項目）</label><textarea id="field-options" value={draft.options} onChange={(event) => setDraft({ ...draft, options: event.target.value })} required rows={4} placeholder="〜50万円\n50〜100万円" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-sky-500 focus:bg-white" /></div>}<label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={draft.isRequired} onChange={(event) => setDraft({ ...draft, isRequired: event.target.checked })} className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />必須項目にする</label><button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-500 disabled:opacity-50">{editingId ? <Save size={16} /> : <Plus size={16} />}{saving ? "保存中..." : editingId ? "変更を保存" : "項目を追加"}</button></form></section>
  </div>;
}
