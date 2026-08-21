"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Save } from "lucide-react";
import { toast } from "sonner";

type Contact = {
  id: number;
  name: string;
  company: string | null;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  internalNote: string | null;
  createdAt: string;
};

const statusOptions = [
  { value: "new", label: "未対応", tone: "bg-rose-50 text-rose-700 border-rose-200" },
  { value: "in_progress", label: "対応中", tone: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "completed", label: "完了", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "spam", label: "スパム", tone: "bg-slate-100 text-slate-600 border-slate-200" },
];

export function ContactsAdminTable() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (status) params.set("status", status);
      const response = await fetch(`/api/contacts?${params}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "お問い合わせを取得できませんでした");
      setContacts(data);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "お問い合わせを取得できませんでした");
    } finally {
      setLoading(false);
    }
  }, [query, status]);

  useEffect(() => {
    const timer = window.setTimeout(loadContacts, 250);
    return () => window.clearTimeout(timer);
  }, [loadContacts]);

  const updateContact = async (contact: Contact) => {
    setSavingId(contact.id);
    try {
      const response = await fetch("/api/contacts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: contact.id, status: contact.status, internalNote: contact.internalNote || "" }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "更新に失敗しました");
      setContacts((current) => current.map((item) => item.id === contact.id ? data : item));
      toast.success("お問い合わせを更新しました");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "更新に失敗しました");
    } finally {
      setSavingId(null);
    }
  };

  return <div className="space-y-4">
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
      <label className="relative min-w-0 flex-1"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="名前・メール・件名で検索" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-sky-500 focus:bg-white" /></label>
      <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-sky-500"><option value="">すべてのステータス</option>{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
    </div>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm text-slate-600"><thead className="border-b border-slate-200 bg-slate-50 text-slate-900"><tr><th className="px-5 py-4">お問合せ</th><th className="px-5 py-4">内容</th><th className="px-5 py-4">受信日</th><th className="px-5 py-4">ステータス</th><th className="px-5 py-4">内部メモ</th><th className="px-5 py-4" /></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">読み込み中...</td></tr> : contacts.length === 0 ? <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">該当するお問い合わせはありません。</td></tr> : contacts.map((contact) => { const option = statusOptions.find((item) => item.value === contact.status) || statusOptions[0]; return <tr key={contact.id} className="align-top hover:bg-slate-50/70"><td className="px-5 py-4"><p className="font-bold text-slate-800">{contact.name}</p><p className="mt-1 text-xs text-slate-500">{contact.company || ""}</p><a href={`mailto:${contact.email}`} className="mt-1 block text-xs text-sky-600 hover:underline">{contact.email}</a></td><td className="max-w-xs px-5 py-4"><p className="font-semibold text-slate-800">{contact.subject || "件名なし"}</p><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-500">{contact.message}</p></td><td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">{new Date(contact.createdAt).toLocaleString("ja-JP")}</td><td className="px-5 py-4"><select value={contact.status} onChange={(event) => setContacts((current) => current.map((item) => item.id === contact.id ? { ...item, status: event.target.value } : item))} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${option.tone}`}>{statusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></td><td className="px-5 py-4"><textarea value={contact.internalNote || ""} onChange={(event) => setContacts((current) => current.map((item) => item.id === contact.id ? { ...item, internalNote: event.target.value } : item))} rows={3} placeholder="社内メモ" className="w-48 rounded-lg border border-slate-200 bg-amber-50/40 p-2 text-xs text-slate-700 outline-none focus:border-amber-400" /></td><td className="px-5 py-4"><button type="button" onClick={() => updateContact(contact)} disabled={savingId === contact.id} aria-label="お問い合わせを保存" className="rounded-lg p-2 text-slate-500 hover:bg-sky-50 hover:text-sky-600 disabled:opacity-50"><Save size={17} /></button></td></tr>; })}</tbody></table></div></div>
  </div>;
}
