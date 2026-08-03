"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "ダッシュボード" },
  { href: "/posts", label: "投稿" },
  { href: "/artists/admin", label: "クリエイター管理" },
  { href: "/works/admin", label: "ワークス管理" },
  { href: "/media/admin", label: "メディア" },
  { href: "/categories", label: "カテゴリー" },
  { href: "/contacts/admin", label: "お問合せ" },
  { href: "/settings", label: "設定" },
];

export function AdminShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error("ログアウトに失敗しました", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8">
        <aside className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:w-72 flex flex-col justify-between">
          <div>
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
                Besmile CMS
              </p>
              <h1 className="mt-2 text-xl font-semibold">管理コンソール</h1>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 space-y-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-sky-600 transition hover:bg-sky-50"
            >
              <span>サイトを表示</span>
              <span className="text-xs">↗</span>
            </a>

            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-red-600 transition hover:bg-red-50 flex items-center justify-between"
            >
              <span>ログアウト</span>
              <span className="text-xs">🚪</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-medium text-sky-600">管理画面</p>
            <h2 className="mt-1 text-2xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}