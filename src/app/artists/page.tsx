import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { artistsTable } from "@/lib/schema";

export const dynamic = "force-dynamic";

export default async function ArtistsPage() {
  const artists = await db.select().from(artistsTable).orderBy(desc(artistsTable.createdAt));

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="flex flex-col gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Link href="/" className="text-xs font-semibold text-sky-600 hover:underline">← トップページへ戻る</Link>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-600">Creators</p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">つくる人の紹介</h1>
            <p className="max-w-xl text-sm leading-7 text-slate-600">それぞれの専門性と視点で、プロジェクトに新しい輪郭をつくるクリエイターたちです。</p>
          </div>
          <Link href="/works" className="inline-flex w-fit items-center rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-sky-600">実績を見る <span className="ml-2">→</span></Link>
        </header>

        {artists.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm text-slate-500">クリエイター情報は準備中です。</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((artist) => (
              <Link
                key={artist.id}
                href={`/artists/${artist.id}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                  {artist.avatarUrl ? (
                    <img src={artist.avatarUrl} alt={artist.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400">No Image</span>
                  )}
                  </div>
                  <div className="min-w-0">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-600">{artist.role || "Creator"}</p>
                    <h2 className="truncate text-lg font-bold text-slate-900 group-hover:text-sky-600">{artist.name}</h2>
                  </div>
                </div>
                <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-600">{artist.bio || "プロフィール紹介文は準備中です。"}</p>
                <span className="mt-5 inline-block text-xs font-bold text-slate-400 group-hover:text-sky-600">プロフィールを見る →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}