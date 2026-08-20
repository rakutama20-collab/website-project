import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { artistsTable, worksTable } from "@/lib/schema";

export const dynamic = "force-dynamic";

export default async function WorksPage() {
  const [works, artists] = await Promise.all([
    db.select().from(worksTable).orderBy(desc(worksTable.createdAt)),
    db.select().from(artistsTable),
  ]);
  const artistById = new Map(artists.map((artist) => [artist.id, artist]));
  const publishedWorks = works.filter((work) => work.status === "公開" || work.status === "published");

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-col gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Link href="/" className="text-xs font-semibold text-sky-600 hover:underline">← トップページへ戻る</Link>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-600">Works</p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">制作実績</h1>
            <p className="max-w-xl text-sm leading-7 text-slate-600">企画から仕上げまで、チームの視点と技術が形になったプロジェクトをご紹介します。</p>
          </div>
          <Link href="/artists" className="inline-flex w-fit items-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-sky-300 hover:text-sky-600">クリエイターを見る →</Link>
        </header>

        {publishedWorks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm text-slate-500">公開中の実績はまだありません。</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {publishedWorks.map((work) => {
              const artist = work.creatorId ? artistById.get(work.creatorId) : undefined;
              return (
                <article key={work.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  {work.imageUrl ? <img src={work.imageUrl} alt={work.title} className="h-64 w-full object-cover" /> : <div className="flex h-64 items-center justify-center bg-slate-100 text-xs font-semibold text-slate-400">No Image</div>}
                  <div className="space-y-4 p-6">
                    <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-600">{work.category || "Project"}</p><h2 className="mt-1 text-2xl font-black">{work.title}</h2></div>
                    <p className="text-sm leading-7 text-slate-600">{work.description || "プロジェクトの詳細は準備中です。"}</p>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      {artist ? <Link href={`/artists/${artist.id}`} className="text-xs font-bold text-sky-600 hover:underline">担当: {artist.name} →</Link> : <span className="text-xs text-slate-400">担当者未設定</span>}
                      {work.projectUrl && <a href={work.projectUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-slate-500 hover:text-sky-600">詳細サイト ↗</a>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}