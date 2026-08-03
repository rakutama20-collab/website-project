"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";

export default function ArtistsAdminPage() {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArtists = async () => {
    try {
      const response = await fetch("/api/artists");
      const data = await response.json();
      setArtists(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch artists", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("本当にこのクリエイターを削除しますか？")) return;

    try {
      const res = await fetch(`/api/artists?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setArtists(artists.filter((artist) => artist.id !== id));
      } else {
        alert("削除に失敗しました。");
      }
    } catch (err) {
      console.error("Failed to delete artist", err);
      alert("削除処理中にエラーが発生しました。");
    }
  };

  return (
    <AdminShell title="クリエイター管理" description="登録されているクリエイターの一覧・追加・編集を行います。">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Link
            href="/artists/admin/new"
            className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-sky-400"
          >
            + 新規クリエイターを追加
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">読み込み中...</div>
        ) : artists.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
            登録されているクリエイターがいません。
          </div>
        ) : (
          <div className="grid gap-3">
            {artists.map((artist) => (
              <div 
                key={artist.id} 
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {artist.avatarUrl ? (
                      <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-400">No Img</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{artist.name}</h3>
                    <p className="text-xs text-slate-500">{artist.role || "専門分野未設定"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* 編集ボタンを追加 */}
                  <Link
                    href={`/artists/admin/${artist.id}/edit`}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => handleDelete(artist.id)}
                    className="rounded-xl bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}