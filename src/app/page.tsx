"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    published: 0,
    drafts: 0,
    scheduled: 0,
  });
  const [worksCount, setWorksCount] = useState(0);
  const [artistsCount, setArtistsCount] = useState(0);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const postsRes = await fetch("/api/posts", { cache: "no-store" });
        const postsData = await postsRes.json();

        if (Array.isArray(postsData)) {
          const publishedCount = postsData.filter((post: any) => post.status === "published" || !post.status).length;
          const draftCount = postsData.filter((post: any) => post.status === "draft").length;
          const scheduledCount = postsData.filter((post: any) => post.status === "scheduled").length;

          setStats({
            published: publishedCount,
            drafts: draftCount,
            scheduled: scheduledCount,
          });

          setRecentPosts(postsData.slice(0, 5));
        }

        try {
          const worksRes = await fetch("/api/works", { cache: "no-store" });
          const worksData = await worksRes.json();
          if (Array.isArray(worksData)) {
            setWorksCount(worksData.length);
          }
        } catch (e) {
          // API未実装時のフォールバック
        }

        try {
          const artistsRes = await fetch("/api/artists", { cache: "no-store" });
          const artistsData = await artistsRes.json();
          if (Array.isArray(artistsData)) {
            setArtistsCount(artistsData.length);
          }
        } catch (e) {
          // API未実装時のフォールバック
        }

      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statItems = [
    { 
      label: "公開済み", 
      sub: "Published", 
      value: loading ? "-" : stats.published, 
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      dotColor: "bg-emerald-500"
    },
    { 
      label: "下書き", 
      sub: "Drafts", 
      value: loading ? "-" : stats.drafts, 
      color: "text-amber-600 bg-amber-50 border-amber-100",
      dotColor: "bg-amber-500"
    },
    { 
      label: "予約済み", 
      sub: "Scheduled", 
      value: loading ? "-" : stats.scheduled, 
      color: "text-sky-600 bg-sky-50 border-sky-100",
      dotColor: "bg-sky-500"
    },
  ];

  return (
    <AdminShell
      title="ダッシュボード"
      description="コンテンツの運用状況と最近のアクティビティの概要です。"
    >
      {/* 作品管理・クリエイター管理へのショートカットカード */}
      <div className="grid gap-5 md:grid-cols-2 mb-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">登録済み作品</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{loading ? "-" : `${worksCount} 件`}</p>
          </div>
          <Link
            href="/works/admin"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 px-3 py-2 rounded-xl transition hover:bg-sky-100"
          >
            ワークス管理へ →
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">登録クリエイター数</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{loading ? "-" : `${artistsCount} 名`}</p>
          </div>
          <Link
            href="/artists/admin"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 px-3 py-2 rounded-xl transition hover:bg-sky-100"
          >
            クリエイター管理へ →
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {statItems.map((stat) => (
          <div 
            key={stat.label} 
            className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{stat.sub}</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{stat.label}</p>
              </div>
              <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border ${stat.color} shadow-sm`}>
                <span className={`w-2 h-2 rounded-full ${stat.dotColor}`} />
              </span>
            </div>
            <p className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-2.5 py-1 mb-2 text-xs font-semibold tracking-wide uppercase bg-sky-500/20 text-sky-300 rounded-md border border-sky-500/30">
              Quick Action
            </span>
            <h3 className="text-xl font-bold tracking-tight">クイックアクション</h3>
            <p className="mt-1 text-sm text-slate-300">
              コンテンツ管理のワークフローに素早くアクセスできます。
            </p>
          </div>
          <Link
            href="/posts/new"
            className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-400 hover:shadow-sky-500/25"
          >
            + 新規投稿を作成
          </Link>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">最近のアクティビティ</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              直近に作成・更新されたポートフォリオ項目
            </p>
          </div>
          <Link
            href="/posts"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 transition"
          >
            すべて見る →
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-slate-400">読み込み中...</div>
        ) : recentPosts.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">まだ投稿がありません。</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentPosts.map((post) => (
              <div key={post.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 px-3 rounded-xl transition">
                <div className="flex items-center space-x-3.5 min-w-0">
                  {post.status === "draft" ? (
                    <span className="inline-flex items-center shrink-0 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 border border-amber-200/60">
                      下書き
                    </span>
                  ) : (
                    <span className="inline-flex items-center shrink-0 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200/60">
                      公開
                    </span>
                  )}

                  {post.tags && (
                    <span className="hidden sm:inline-flex items-center shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 border border-slate-200">
                      {post.tags}
                    </span>
                  )}

                  <Link href={`/posts/${post.id}/edit`} className="font-medium text-sm text-slate-800 hover:text-sky-600 truncate transition">
                    {post.title}
                  </Link>
                </div>

                <div className="text-xs font-medium text-slate-400 shrink-0 pl-4">
                  {post.updatedAt}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}