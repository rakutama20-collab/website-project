"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ArtistDetailPage() {
  const params = useParams();
  const artistId = Number(params.id);

  const [artist, setArtist] = useState<any>(null);
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!artistId) return;

    // クリエイター情報と作品一覧を同時に取得して紐づける
    Promise.all([
      fetch("/api/artists").then((res) => res.json()),
      fetch("/api/works").then((res) => res.json()),
    ])
      .then(([artistsData, worksData]) => {
        // 該当するクリエイターを探す
        const foundArtist = Array.isArray(artistsData)
          ? artistsData.find((a: any) => Number(a.id) === artistId)
          : null;
        setArtist(foundArtist);

        // 該当するクリエイターが担当した作品をフィルタリングする
        const filteredWorks = Array.isArray(worksData)
          ? worksData.filter((w: any) => Number(w.creatorId) === artistId)
          : [];
        setWorks(filteredWorks);

        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch artist details", err);
        setLoading(false);
      });
  }, [artistId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-slate-500">読み込み中...</p>
        </div>
      </main>
    );
  }

  if (!artist) {
    return (
      <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-slate-500">クリエイターが見つかりませんでした。</p>
          <Link href="/artists" className="text-sky-600 hover:underline text-sm mt-4 inline-block">
            &larr; クリエイター一覧へ戻る
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/artists" className="text-sm text-sky-600 hover:underline">
            &larr; クリエイター一覧に戻る
          </Link>
        </div>

        {/* クリエイタープロフィール */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border">
            {artist.avatarUrl ? (
              <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-slate-400">No Img</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{artist.name}</h1>
            <p className="text-sm text-slate-500 mt-1">{artist.role || "専門分野未設定"}</p>
            {artist.bio && <p className="text-sm text-slate-600 mt-2">{artist.bio}</p>}
          </div>
        </div>

        {/* 担当作品一覧 */}
        <h2 className="text-xl font-bold text-slate-900 mb-4">担当した作品一覧 ({works.length}件)</h2>
        {works.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
            このクリエイターが担当した作品はまだ登録されていません。
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {works.map((work) => (
              <div key={work.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  {work.imageUrl && (
                    <div className="w-full h-36 bg-slate-100 rounded-xl overflow-hidden mb-3 border">
                      <img src={work.imageUrl} alt={work.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h3 className="font-bold text-base text-slate-900">{work.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{work.description}</p>
                </div>
                {work.projectUrl && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <a 
                      href={work.projectUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-sky-600 font-semibold hover:underline"
                    >
                      サイトを見る &rarr;
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}