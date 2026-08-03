"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ArtistsPage() {
  const [artists, setArtists] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // クリエイター一覧とカテゴリ一覧を同時に取得
    Promise.all([
      fetch("/api/artists").then((res) => res.json()),
      fetch("/api/categories").then((res) => res.json()),
    ])
      .then(([artistsData, categoriesData]) => {
        if (Array.isArray(artistsData)) setArtists(artistsData);
        if (Array.isArray(categoriesData)) setCategories(categoriesData);
      })
      .catch((err) => console.error("Failed to fetch data", err))
      .finally(() => setLoading(false));
  }, []);

  // 選択されたカテゴリでクリエイターをフィルタリング
  const filteredArtists = selectedCategory === "すべて"
    ? artists
    : artists.filter((artist) => artist.role === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ヘッダーエリア */}
        <div className="space-y-2">
          <Link href="/" className="text-xs font-semibold text-sky-600 hover:underline">
            ← トップページに戻る
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">CREATOR</h1>
          <p className="text-sm text-slate-600">
            多彩なクリエイターのプロフィールや実績をご覧ください。
          </p>
        </div>

        {/* カテゴリタブ */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => setSelectedCategory("すべて")}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              selectedCategory === "すべて"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            }`}
          >
            すべて
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                selectedCategory === cat.name
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* クリエイターカード一覧 */}
        {loading ? (
          <div className="py-20 text-center text-sm text-slate-400">読み込み中...</div>
        ) : filteredArtists.length === 0 ? (
          <div className="py-20 text-center text-sm text-slate-400 bg-white rounded-2xl border border-slate-200">
            該当するクリエイターはまだいません。
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtists.map((artist) => (
              <Link
                key={artist.id}
                href={`/artists/${artist.id}`}
                className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition hover:shadow-md hover:border-slate-300 flex flex-col justify-between"
              >
                <div className="flex items-center gap-4">
                  {artist.avatarUrl ? (
                    <img
                      src={artist.avatarUrl}
                      alt={artist.name}
                      className="w-16 h-16 rounded-full object-cover border border-slate-100 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                      No Image
                    </div>
                  )}
                  <div className="space-y-1 min-w-0">
                    <span className="inline-block rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-semibold text-sky-600 border border-sky-100 truncate">
                      {artist.role || "未設定"}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition truncate">
                      {artist.name}
                    </h2>
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-600 line-clamp-2 bg-slate-50 p-3 rounded-xl">
                  {artist.bio || "自己紹介文が登録されていません。"}
                </p>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}