"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { BriefcaseBusiness, Eye, FileText, Images, Mail, Settings, Users } from "lucide-react";

type DashboardPost = { status?: string };
type DashboardWork = { status?: string; id: number; title: string; category?: string; imageUrl?: string | null };
type DashboardArtist = { id: number; name: string; role?: string | null; avatarUrl?: string | null };
type AccessSummary = { month: string; count: number };
type RecentAccess = { id: number; path: string; createdAt: string };
type EngagementSummary = { average_duration: number; average_scroll_depth: number };

export default function DashboardPage() {
  const [stats, setStats] = useState({
    published: 0,
    drafts: 0,
    scheduled: 0,
  });
  const [worksCount, setWorksCount] = useState(0);
  const [publishedWorksCount, setPublishedWorksCount] = useState(0);
  const [artistsCount, setArtistsCount] = useState(0);
  const [recentWorks, setRecentWorks] = useState<DashboardWork[]>([]);
  const [featuredArtists, setFeaturedArtists] = useState<DashboardArtist[]>([]);
  const [accessStats, setAccessStats] = useState<AccessSummary[]>([]);
  const [recentAccesses, setRecentAccesses] = useState<RecentAccess[]>([]);
  const [engagement, setEngagement] = useState<EngagementSummary>({ average_duration: 0, average_scroll_depth: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const request = (url: string) => fetch(url, { cache: "no-store", signal: controller.signal });

    Promise.allSettled([request("/api/posts"), request("/api/works"), request("/api/access-logs"), request("/api/artists")])
      .then(async ([postsResult, worksResult, accessResult, artistsResult]) => {
        const responses = await Promise.all([
          postsResult.status === "fulfilled" && postsResult.value.ok ? postsResult.value.json() : null,
          worksResult.status === "fulfilled" && worksResult.value.ok ? worksResult.value.json() : null,
          accessResult.status === "fulfilled" && accessResult.value.ok ? accessResult.value.json() : null,
          artistsResult.status === "fulfilled" && artistsResult.value.ok ? artistsResult.value.json() : null,
        ]);
        const [postsData, worksData, accessData, artistsData] = responses;

        if (Array.isArray(postsData)) {
          setStats({
            published: (postsData as DashboardPost[]).filter((post) => post.status === "published" || !post.status).length,
            drafts: (postsData as DashboardPost[]).filter((post) => post.status === "draft").length,
            scheduled: (postsData as DashboardPost[]).filter((post) => post.status === "scheduled").length,
          });
        }
        if (Array.isArray(worksData)) {
          setWorksCount(worksData.length);
          const publishedWorks = (worksData as DashboardWork[]).filter((work) => work.status === "公開" || work.status === "published");
          setPublishedWorksCount(publishedWorks.length);
          setRecentWorks(publishedWorks.slice(0, 3));
        }
        if (accessData) {
          setAccessStats(Array.isArray(accessData.monthly) ? accessData.monthly : []);
          setRecentAccesses(Array.isArray(accessData.recent) ? accessData.recent : []);
          if (accessData.engagement) {
            setEngagement({
              average_duration: Number(accessData.engagement.average_duration) || 0,
              average_scroll_depth: Number(accessData.engagement.average_scroll_depth) || 0,
            });
          }
        }
        if (Array.isArray(artistsData)) {
          setArtistsCount(artistsData.length);
          setFeaturedArtists(artistsData.slice(0, 3));
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const statItems = [
    { label: "公開済み", sub: "Published", value: loading ? "-" : stats.published, color: "text-emerald-600", dot: "bg-emerald-500" },
    { label: "下書き", sub: "Drafts", value: loading ? "-" : stats.drafts, color: "text-amber-600", dot: "bg-amber-500" },
    { label: "予約済み", sub: "Scheduled", value: loading ? "-" : stats.scheduled, color: "text-sky-600", dot: "bg-sky-500" },
  ];
  const maxAccessCount = Math.max(...accessStats.map((item) => item.count), 1);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthAccesses = accessStats.find((item) => item.month === currentMonth)?.count ?? 0;
  const kpiItems = [
    { label: "総クリエイター数", value: artistsCount, unit: "名", detail: "登録中", href: "/artists/admin", icon: Users, tone: "sky" },
    { label: "今月のアクセス数", value: currentMonthAccesses, unit: "PV", detail: "公開ページ", href: "#traffic", icon: Eye, tone: "violet" },
    { label: "公開中の実績", value: publishedWorksCount, unit: "件", detail: `全 ${worksCount} 件中`, href: "/works/admin", icon: BriefcaseBusiness, tone: "emerald" },
  ];
  const quickMenuItems = [
    { title: "基本設定", description: "サイトの基本情報を管理", href: "/settings", icon: Settings, tone: "bg-blue-50 text-blue-600 border-blue-100" },
    { title: "投稿・記事", description: "記事の作成と編集", href: "/posts", icon: FileText, tone: "bg-violet-50 text-violet-600 border-violet-100" },
    { title: "ワークス管理", description: "制作実績を登録・管理", href: "/works/admin", icon: BriefcaseBusiness, tone: "bg-orange-50 text-orange-600 border-orange-100" },
    { title: "クリエイター管理", description: "担当者のプロフィールを管理", href: "/artists/admin", icon: Users, tone: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    { title: "メディア管理", description: "画像・ファイルを整理", href: "/media/admin", icon: Images, tone: "bg-pink-50 text-pink-600 border-pink-100" },
    { title: "お問合せ管理", description: "届いたお問合せを確認", href: "/contacts/admin", icon: Mail, tone: "bg-amber-50 text-amber-600 border-amber-100" },
  ];

  return (
    <AdminShell title="ダッシュボード" description="コンテンツの運用状況と最近のアクティビティの概要です。">
      <section className="mb-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600">Quick Access</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">よく使うメニュー</h2>
          </div>
          <span className="hidden text-xs font-semibold text-slate-400 sm:block">ショートカット</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href + item.title}
                href={item.href}
                className="group flex min-h-28 items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${item.tone} transition-transform duration-200 group-hover:scale-105`}>
                  <Icon size={21} strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-slate-900 group-hover:text-sky-600">{item.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{item.description}</span>
                </span>
                <span className="ml-auto self-start text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-sky-500">→</span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">Public Site</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">公開中のクリエイターと実績を確認できます。</p>
        </div>
        <div className="flex gap-2">
          <Link href="/artists" target="_blank" className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:text-sky-600">クリエイター</Link>
          <Link href="/works" target="_blank" className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-sky-600">実績を見る</Link>
        </div>
      </div>
      
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {kpiItems.map((item) => {
          const Icon = item.icon;
          const toneClasses = item.tone === "violet" ? "bg-violet-50 text-violet-600" : item.tone === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-sky-50 text-sky-600";
          return (
            <Link key={item.label} href={item.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
              <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-slate-500">{item.label}</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{item.detail}</p></div><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses}`}><Icon size={19} /></span></div>
              <div className="mt-6 flex items-baseline gap-2"><span className="text-4xl font-black tracking-tight text-slate-900">{loading ? "-" : item.value}</span><span className="text-sm font-bold text-slate-400">{item.unit}</span></div>
            </Link>
          );
        })}
      </div>

      <section className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-5 shadow-sm">
          <p className="text-xs font-bold text-violet-700">平均滞在時間</p>
          <div className="mt-3 flex items-baseline gap-2"><span className="text-3xl font-black text-slate-900">{loading ? "-" : engagement.average_duration.toFixed(1)}</span><span className="text-sm font-bold text-slate-500">秒</span></div>
          <p className="mt-2 text-xs text-slate-500">今月の公開ページ閲覧</p>
        </div>
        <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-5 shadow-sm">
          <p className="text-xs font-bold text-orange-700">平均スクロール深度</p>
          <div className="mt-3 flex items-baseline gap-2"><span className="text-3xl font-black text-slate-900">{loading ? "-" : engagement.average_scroll_depth.toFixed(0)}</span><span className="text-sm font-bold text-slate-500">%</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80"><div className="h-full rounded-full bg-orange-400 transition-all" style={{ width: `${Math.min(Math.max(engagement.average_scroll_depth, 0), 100)}%` }} /></div>
        </div>
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {statItems.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{stat.sub}</span>
              <div className={`w-2 h-2 rounded-full ${stat.dot}`} />
            </div>
            <p className="text-4xl font-black text-slate-900">{stat.value}</p>
            <p className={`text-sm font-bold mt-2 ${stat.color}`}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-sky-600">Creators</p><h2 className="mt-1 text-xl font-black">注目のクリエイター</h2></div><Link href="/artists" target="_blank" className="text-xs font-bold text-sky-600 hover:underline">一覧を見る →</Link></div>
          <div className="space-y-3">
            {featuredArtists.map((artist) => <Link key={artist.id} href={`/artists/${artist.id}`} target="_blank" className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:border-sky-200"><div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-100">{artist.avatarUrl ? <img src={artist.avatarUrl} alt={artist.name} className="h-full w-full object-cover" /> : <span className="text-[9px] text-slate-400">No</span>}</div><div><p className="text-sm font-bold text-slate-800">{artist.name}</p><p className="text-xs text-slate-500">{artist.role || "専門分野未設定"}</p></div></Link>)}
            {!loading && featuredArtists.length === 0 && <p className="text-sm text-slate-400">クリエイター情報はありません。</p>}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-sky-600">Works</p><h2 className="mt-1 text-xl font-black">公開中の実績</h2></div><Link href="/works" target="_blank" className="text-xs font-bold text-sky-600 hover:underline">一覧を見る →</Link></div>
          <div className="space-y-3">
            {recentWorks.map((work) => <Link key={work.id} href="/works" target="_blank" className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:border-sky-200">{work.imageUrl ? <img src={work.imageUrl} alt={work.title} className="h-12 w-16 rounded-lg object-cover" /> : <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-slate-100 text-[9px] text-slate-400">No Image</div>}<div><p className="text-sm font-bold text-slate-800">{work.title}</p><p className="text-xs text-slate-500">{work.category || "Project"}</p></div></Link>)}
            {!loading && recentWorks.length === 0 && <p className="text-sm text-slate-400">公開中の実績はありません。</p>}
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section id="traffic" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between">
            <div><p className="text-xs font-bold uppercase tracking-widest text-sky-600">Traffic</p><h2 className="mt-1 text-xl font-black">月ごとのアクセス数</h2></div>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-600">直近6か月</span>
          </div>
          {accessStats.length === 0 ? <p className="py-10 text-center text-sm text-slate-400">アクセスデータを集計中です。</p> : <div className="flex h-56 items-end gap-3 border-b border-slate-100 px-2 pb-0 sm:gap-5">
            {accessStats.map((item) => <div key={item.month} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-bold text-slate-600">{item.count}</span><div className="w-full max-w-10 rounded-t-lg bg-sky-500 transition-all" style={{ height: `${Math.max((item.count / maxAccessCount) * 75, 8)}%` }} /><span className="pb-2 text-[10px] font-semibold text-slate-400">{item.month.slice(5)}月</span></div>)}
          </div>}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-sky-600">History</p><h2 className="mt-1 text-xl font-black">最近の閲覧履歴</h2></div><span className="text-xs font-semibold text-slate-400">最新20件</span></div>
          {recentAccesses.length === 0 ? <p className="py-10 text-center text-sm text-slate-400">閲覧履歴はまだありません。</p> : <div className="max-h-56 space-y-2 overflow-y-auto pr-1">{recentAccesses.map((access) => <div key={access.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5"><span className="truncate text-xs font-semibold text-slate-700">{access.path}</span><time className="shrink-0 text-[10px] text-slate-400">{new Date(access.createdAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time></div>)}</div>}
        </section>
      </div>

      {/* 以下、クイックアクションと最近のアクティビティ（既存コードの構成） */}
      {/* ... (既存のクイックアクション・アクティビティ部分はそのままお使いいただけます) */}
      
    </AdminShell>
  );
}