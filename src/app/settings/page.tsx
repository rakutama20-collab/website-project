"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ImagePlus, KeyRound, Mail, Save, Settings2 } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";

type SettingsData = {
  siteTitle: string;
  faviconUrl: string;
  adminEmail: string;
  hasSmtpAppPassword: boolean;
};

const initialSettings: SettingsData = {
  siteTitle: "Besmile CMS Portfolio",
  faviconUrl: "",
  adminEmail: "",
  hasSmtpAppPassword: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(initialSettings);
  const [smtpAppPassword, setSmtpAppPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/settings", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "設定を取得できませんでした");
        setSettings({ ...initialSettings, ...data });
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "設定を取得できませんでした");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const updateSettings = (changes: Partial<SettingsData>) => {
    setSettings((current) => ({ ...current, ...changes }));
    setMessage("");
    setError("");
  };

  const handleFaviconChange = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("画像ファイルを選択してください");
      return;
    }

    setUploading(true);
    setMessage("");
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok || !data.imageUrl) throw new Error(data.error || "画像のアップロードに失敗しました");
      updateSettings({ faviconUrl: data.imageUrl });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "画像のアップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, smtpAppPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "設定の保存に失敗しました");
      setSettings((current) => ({ ...current, hasSmtpAppPassword: Boolean(data.hasSmtpAppPassword) }));
      setSmtpAppPassword("");
      setMessage("設定を保存しました");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "設定の保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="サイト基本設定" description="サイトの基本情報、ファビコン、お問い合わせ送信設定を管理します。">
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {message && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"><CheckCircle2 size={18} />{message}</div>}
        {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600"><Settings2 size={19} /></span><div><h2 className="text-base font-bold text-slate-900">サイト一般設定</h2><p className="mt-1 text-xs text-slate-500">公開サイトに表示される基本情報です。</p></div></div>
          <label htmlFor="site-title" className="mb-2 block text-xs font-bold text-slate-600">サイトのタイトル</label>
          <input id="site-title" value={settings.siteTitle} onChange={(event) => updateSettings({ siteTitle: event.target.value })} disabled={loading || saving} required maxLength={255} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10" placeholder="Besmile CMS Portfolio" />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600"><ImagePlus size={19} /></span><div><h2 className="text-base font-bold text-slate-900">サイトアイコン</h2><p className="mt-1 text-xs text-slate-500">ブラウザのタブなどに表示する画像です。</p></div></div>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
              {settings.faviconUrl ? <img src={settings.faviconUrl} alt="サイトアイコンのプレビュー" className="h-full w-full object-cover" /> : <ImagePlus size={24} className="text-slate-300" />}
            </div>
            <div className="space-y-2"><input id="favicon" type="file" accept="image/png,image/jpeg,image/webp,image/x-icon" disabled={loading || saving || uploading} onChange={(event) => handleFaviconChange(event.target.files?.[0])} className="block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:font-semibold file:text-sky-700 hover:file:bg-sky-100" /><p className="text-xs text-slate-400">PNG、JPG、WebP、ICO / 最大10MB</p>{uploading && <p className="text-xs font-semibold text-sky-600">アップロード中...</p>}</div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Mail size={19} /></span><div><h2 className="text-base font-bold text-slate-900">管理者・送信元メールアドレス</h2><p className="mt-1 text-xs text-slate-500">お問い合わせの通知先として利用します。</p></div></div>
          <label htmlFor="admin-email" className="mb-2 block text-xs font-bold text-slate-600">メールアドレス</label>
          <input id="admin-email" type="email" value={settings.adminEmail} onChange={(event) => updateSettings({ adminEmail: event.target.value })} disabled={loading || saving} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10" placeholder="admin@example.com" />
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-3 border-b border-amber-200/70 pb-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-600"><KeyRound size={19} /></span><div><h2 className="text-base font-bold text-slate-900">お問い合わせメール送信認証</h2><p className="mt-1 text-xs text-slate-600">Google アプリパスワードなどの送信用シークレットです。</p></div></div>
          <label htmlFor="smtp-password" className="mb-2 block text-xs font-bold text-slate-600">アプリパスワード</label>
          <input id="smtp-password" type="password" value={smtpAppPassword} onChange={(event) => setSmtpAppPassword(event.target.value)} disabled={loading || saving} className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" placeholder={settings.hasSmtpAppPassword ? "設定済み（変更する場合のみ入力）" : "アプリパスワードを入力"} />
          <p className="mt-2 text-xs leading-5 text-slate-500">保存済みのシークレットは画面へ返さず、変更時だけ入力値を更新します。</p>
        </section>

        <button type="submit" disabled={loading || saving || uploading} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-sky-600/20 transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"><Save size={17} />{saving ? "保存中..." : "設定を保存"}</button>
      </form>
    </AdminShell>
  );
}
