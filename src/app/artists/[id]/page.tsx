import Link from "next/link";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { artistsTable, worksTable } from "@/lib/schema";

export const dynamic = "force-dynamic";

export default async function ArtistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artistId = Number(id);
  if (!Number.isInteger(artistId)) notFound();

  const [artist] = await db.select().from(artistsTable).where(eq(artistsTable.id, artistId));
  if (!artist) notFound();

  const works = await db.select().from(worksTable).where(eq(worksTable.creatorId, artistId)).orderBy(desc(worksTable.createdAt));
  const publishedWorks = works.filter((work) => work.status === "公開" || work.status === "published");

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/artists" className="text-xs font-semibold text-sky-600 hover:underline">← クリエイター一覧へ</Link>
          <Link href="/works" className="text-xs font-semibold text-slate-500 hover:text-sky-600">実績一覧 →</Link>
        </div>
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="h-32 bg-slate-900 sm:h-44" />
          <div className="px-6 pb-8 sm:px-10">
            <div className="-mt-14 flex flex-col gap-5 sm:-mt-20 sm:flex-row sm:items-end">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md sm:h-36 sm:w-36">
                {artist.avatarUrl ? <img src={artist.avatarUrl} alt={artist.name} className="h-full w-full object-cover" /> : <span className="text-xs font-semibold text-slate-400">No Image</span>}
              </div>
              <div className="pb-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">Creator Profile</p>
                <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">{artist.name}</h1>
                <p className="mt-2 text-sm font-semibold text-slate-500">{artist.role || "専門分野未設定"}</p>
              </div>
            </div>
            <p className="mt-8 max-w-3xl whitespace-pre-wrap text-sm leading-8 text-slate-600">{artist.bio || "プロフィール紹介文は準備中です。"}</p>
          </div>
        </section>
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">Selected Works</p><h2 className="mt-1 text-2xl font-black">担当した実績</h2></div>
            <span className="text-xs font-semibold text-slate-400">{publishedWorks.length} projects</span>
          </div>
          {publishedWorks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">公開中の実績はまだありません。</div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {publishedWorks.map((work) => (
                <article key={work.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {work.imageUrl ? <img src={work.imageUrl} alt={work.title} className="h-48 w-full object-cover" /> : <div className="flex h-48 items-center justify-center bg-slate-100 text-xs font-semibold text-slate-400">No Image</div>}
                  <div className="p-5"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-600">{work.category || "Project"}</p><h3 className="mt-1 text-lg font-bold">{work.title}</h3><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{work.description || ""}</p>{work.projectUrl && <a href={work.projectUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-xs font-bold text-sky-600 hover:underline">プロジェクトを見る ↗</a>}</div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}