"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ArtistsPage() {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/artists")
      .then((res) => res.json())
      .then((data) => {
        setArtists(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch artists", err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">クリエイター一覧</h1>

        {loading ? (
          <p className="text-sm text-slate-500">読み込み中...</p>
        ) : artists.length === 0 ? (
          <p className="text-sm text-slate-500">クリエイターはまだ登録されていません。</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {artists.map((artist) => (
              <Link 
                key={artist.id} 
                href={`/artists/${artist.id}`}
                className="block bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-sky-500 hover:shadow-md transition flex items-center space-x-4"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border">
                  {artist.avatarUrl ? (
                    <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-slate-400">No Img</span>
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-sm text-slate-900">{artist.name}</h2>
                  <p className="text-xs text-slate-500">{artist.role || "専門分野未設定"}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}