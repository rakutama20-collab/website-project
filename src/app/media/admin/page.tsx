"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin-shell";

export default function MediaAdminPage() {
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchMedia = async () => {
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      setMediaList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch media", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name);
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("ファイルを選択してください。");
      return;
    }
    setSubmitting(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Url = reader.result as string;

      try {
        const res = await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: base64Url, name: name || file.name }),
        });

        if (res.ok) {
          setFile(null);
          setName("");
          // ファイル入力欄をクリアするためにフォーム等を再取得
          const fileInput = document.getElementById("media-file-input") as HTMLInputElement;
          if (fileInput) fileInput.value = "";
          fetchMedia();
        } else {
          alert("メディアの追加に失敗しました。");
        }
      } catch (err) {
        console.error(err);
        alert("エラーが発生しました。");
      } finally {
        setSubmitting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("本当にこのメディアを削除しますか？")) return;

    try {
      const res = await fetch(`/api/media?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMediaList(mediaList.filter((item) => item.id !== id));
      } else {
        alert("削除に失敗しました。");
      }
    } catch (err) {
      console.error(err);
      alert("エラーが発生しました。");
    }
  };

  return (
    <AdminShell title="メディア管理" description="パソコンから画像を選択してアップロード・管理します。">
      <div className="space-y-6">
        {/* 新規メディア追加フォーム（ファイル選択） */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl">
          <h2 className="font-bold text-sm text-slate-900 mb-4">画像ファイルをアップロード</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">画像ファイルを選択</label>
              <input
                id="media-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-600 hover:file:bg-sky-100 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ファイル名（任意）</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: sample-image.jpg"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-400 disabled:opacity-50"
            >
              {submitting ? "アップロード中..." : "アップロードする"}
            </button>
          </form>
        </div>

        {/* メディア一覧グリッド */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="font-bold text-sm text-slate-900 mb-4">メディアライブラリ</h2>
          {loading ? (
            <p className="text-sm text-slate-400">読み込み中...</p>
          ) : mediaList.length === 0 ? (
            <p className="text-sm text-slate-400">メディアが登録されていません。</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {mediaList.map((item) => (
                <div key={item.id} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col justify-between">
                  <div className="w-full h-32 bg-slate-100 relative overflow-hidden">
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="mt-3 w-full rounded-lg bg-red-50 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}