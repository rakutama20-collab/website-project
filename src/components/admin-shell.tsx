"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { ReactNode } from "react";
import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  FolderOpen,
  Globe2,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Palette,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/settings", label: "基本設定・サイト設定", icon: Settings },
  { href: "/posts", label: "投稿管理", icon: BookOpen },
  { href: "/artists/admin", label: "クリエイター管理", icon: Users },
  { href: "/works/admin", label: "ワークス管理", icon: BriefcaseBusiness },
  { href: "/works-log", label: "実績一覧", icon: BarChart3 },
  { href: "/media/admin", label: "メディア", icon: Images },
  { href: "/categories", label: "カテゴリー", icon: FolderOpen },
  { href: "/contacts/admin", label: "お問合せ", icon: Mail },
] satisfies { href: string; label: string; icon: LucideIcon }[];

export function AdminShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/login" });
    } catch (err) {
      console.error("ログアウトに失敗しました", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50/50 to-slate-100 text-slate-900">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-3 py-3 sm:px-5 sm:py-5 lg:flex-row lg:gap-6 lg:px-8">
        <aside className="flex w-full shrink-0 flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950 p-4 text-slate-100 shadow-xl shadow-slate-300/30 lg:sticky lg:top-5 lg:h-[calc(100vh-40px)] lg:w-72">
          <div>
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-500/20">
                <Palette size={20} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-400">Besmile CMS</p>
                <h1 className="mt-0.5 text-base font-bold text-white">管理コンソール</h1>
              </div>
            </div>

            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Workspace</p>
            <nav className="grid grid-cols-2 gap-1 lg:grid-cols-1">
              {navItems.map(({ icon: Icon, ...item }) => {
                const isActive = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${isActive ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" : "text-slate-400 hover:translate-x-0.5 hover:bg-slate-900 hover:text-white"}`}
                >
                  <Icon size={17} className={isActive ? "text-white" : "text-slate-500 transition-colors group-hover:text-sky-400"} />
                  <span className="truncate">{item.label}</span>
                </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-6 space-y-1 border-t border-slate-800 pt-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-sky-400 transition hover:bg-slate-900"
            >
              <Globe2 size={17} />
              <span>サイトを表示</span>
              <span className="ml-auto text-xs transition-transform group-hover:translate-x-0.5">↗</span>
            </a>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-400 transition hover:bg-slate-900"
            >
              <LogOut size={17} />
              <span>ログアウト</span>
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
          <div className="mb-7 flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600">Admin workspace</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            </div>
            <div className="hidden items-center gap-2 text-xs font-semibold text-slate-400 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> System online
            </div>
          </div>
          {children}
        </main>

      </div>
    </div>
  );
}