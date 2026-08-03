"use client";

import { AdminShell } from "@/components/admin-shell";
import { useState } from "react";

export default function SettingsPage() {
  const [siteName, setSiteName] = useState("Besmile CMS Portfolio");
  const [adminName, setAdminName] = useState("Admin User");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AdminShell title="Settings" description="サイトの基本情報およびプロフィールの管理">
      <form onSubmit={handleSave} className="space-y-6 max-w-xl">
        {saved && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 font-medium shadow-sm">
            設定を保存しました！
          </div>
        )}

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">サイト一般設定</h3>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              サイト名
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 transition-all duration-200 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-500/10"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 space-y-4 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">管理者プロフィール</h3>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              管理者名
            </label>
            <input
              type="text"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 transition-all duration-200 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-500/10"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sky-600/20 transition-all duration-200 hover:bg-sky-500 hover:shadow-md hover:shadow-sky-600/30 active:scale-[0.98]"
          >
            変更を保存する
          </button>
        </div>
      </form>
    </AdminShell>
  );
}