"use client";

import { useEffect, useState } from "react";

type ContactField = {
  id: number;
  fieldKey: string;
  label: string;
  type: "text" | "email" | "textarea" | "select" | "checkbox";
  options: string[];
  isRequired: boolean;
  sortOrder: number;
};

type FormState = {
  name: string;
  company: string;
  email: string;
  subject: string;
  message: string;
  website: string;
  customFields: Record<string, string | boolean>;
};

const initialForm: FormState = { name: "", company: "", email: "", subject: "", message: "", website: "", customFields: {} };

export default function ContactPage() {
  const [fields, setFields] = useState<ContactField[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [loadingFields, setLoadingFields] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/contact-fields?public=true", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "フォーム項目を取得できませんでした");
        setFields(Array.isArray(data) ? data : []);
      })
      .catch((reason) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "フォーム項目を取得できませんでした");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingFields(false);
      });
    return () => controller.abort();
  }, []);

  const update = (key: keyof Omit<FormState, "customFields">, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const updateCustom = (key: string, value: string | boolean) => setForm((current) => ({ ...current, customFields: { ...current.customFields, [key]: value } }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "送信に失敗しました");
      setSubmitted(true);
      if (data.emailWarning) setError("お問い合わせは受付済みですが、確認メールの送信に失敗しました。");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "送信に失敗しました");
    } finally {
      setSending(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10";
  const renderField = (field: ContactField) => {
    const required = field.isRequired ? <span className="ml-1 text-rose-500">*</span> : null;
    if (field.type === "textarea") return <div key={field.fieldKey}><label htmlFor={field.fieldKey} className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">{field.label}{required}</label><textarea id={field.fieldKey} value={String(form.customFields[field.fieldKey] ?? "")} onChange={(event) => updateCustom(field.fieldKey, event.target.value)} rows={5} required={field.isRequired} maxLength={10000} className={inputClass} /></div>;
    if (field.type === "select") return <div key={field.fieldKey}><label htmlFor={field.fieldKey} className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">{field.label}{required}</label><select id={field.fieldKey} value={String(form.customFields[field.fieldKey] ?? "")} onChange={(event) => updateCustom(field.fieldKey, event.target.value)} required={field.isRequired} className={inputClass}><option value="">選択してください</option>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>;
    if (field.type === "checkbox") return <label key={field.fieldKey} className="flex items-center gap-2 text-sm text-slate-700"><input id={field.fieldKey} type="checkbox" checked={form.customFields[field.fieldKey] === true} onChange={(event) => updateCustom(field.fieldKey, event.target.checked)} required={field.isRequired} className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />{field.label}{required}</label>;
    return <div key={field.fieldKey}><label htmlFor={field.fieldKey} className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">{field.label}{required}</label><input id={field.fieldKey} type={field.type} value={String(form.customFields[field.fieldKey] ?? "")} onChange={(event) => updateCustom(field.fieldKey, event.target.value)} required={field.isRequired} maxLength={10000} className={inputClass} /></div>;
  };

  return <main className="mx-auto max-w-xl px-4 py-12"><h1 className="mb-6 text-2xl font-bold text-slate-900">お問い合わせ</h1>{submitted ? <div className="space-y-3"><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">お問い合わせありがとうございます。メッセージが送信されました。</div>{error && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">{error}</div>}</div> : <form onSubmit={handleSubmit} className="space-y-4">
    <div><label htmlFor="name" className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">お名前<span className="ml-1 text-rose-500">*</span></label><input id="name" type="text" value={form.name} onChange={(event) => update("name", event.target.value)} required maxLength={255} className={inputClass} /></div>
    <div><label htmlFor="company" className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">会社名</label><input id="company" type="text" value={form.company} onChange={(event) => update("company", event.target.value)} maxLength={255} className={inputClass} /></div>
    <div><label htmlFor="email" className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">メールアドレス<span className="ml-1 text-rose-500">*</span></label><input id="email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required maxLength={255} autoComplete="email" className={inputClass} /></div>
    <div><label htmlFor="subject" className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">件名</label><input id="subject" type="text" value={form.subject} onChange={(event) => update("subject", event.target.value)} maxLength={255} className={inputClass} /></div>
    <div><label htmlFor="message" className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">メッセージ<span className="ml-1 text-rose-500">*</span></label><textarea id="message" value={form.message} onChange={(event) => update("message", event.target.value)} rows={5} required maxLength={10000} className={inputClass} /></div>
    {loadingFields ? <p className="text-sm text-slate-400">追加項目を読み込み中...</p> : fields.map(renderField)}
    <div aria-hidden="true" className="hidden"><label htmlFor="website">Website</label><input id="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update("website", event.target.value)} /></div>
    {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
    <button type="submit" disabled={sending || loadingFields} className="w-full rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50">{sending ? "送信中..." : "送信する"}</button>
  </form>}</main>;
}
