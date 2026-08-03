"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";

export default function NewWorkPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(""); // カテゴリID
  const [categories, setCategories] = useState<any[]>([]); // カテゴリ一覧
  
  // ▼ 1. クエイター選択用の状態を追加しました
  const [creatorId, setCreatorId] = useState(""); // クリエイターID
  const [artists, setArtists] = useState<any[]>([]); // クリエイター一覧

  const [projectUrl, setProjectUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // カテゴリ一覧をAPIから取得
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error("Failed to fetch categories", err));
  }, []);

  // ▼ 2. クリエイター一覧をAPIから取得する処理を追加しました
  useEffect(() => {
    fetch("/api/artists") // ※APIのエンドポイントに合わせています
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setArtists(data);
      })
      .catch((err) => console.error("Failed to fetch artists", err));
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("作品タイトルを入力してください。");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ▼ 3. 送信データに creatorId を追加しました
        body: JSON.stringify({ title, description, categoryId, creatorId, projectUrl, imageUrl }),
      });

      if (res.ok) {
        router.push("/works/admin");
        router.refresh();
      } else {
        alert("登録に失敗しました。");
      }
    } catch (err) {
      console.error("Failed to create work", err);
      alert("エラーが発生しました。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell title="新規成果物追加" description="ポートフォリオの新しい作品を登録します。">
      <form onSubmit={handleSubmit} className="max-w-xl space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">作品タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: コーポレートサイトリニューアル"
            required
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none"
          />
        </div>

        {/* カテゴリ選択 */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">カテゴリー</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 bg-white focus:border-sky-500 focus:outline-none"
          >
            <option value="">カテゴリを選択してください</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* ▼ 4. クリエイター選択のセレクトボックスを追加しました */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">担当クリエイター</label>
          <select
            value={creatorId}
            onChange={(e) => setCreatorId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 bg-white focus:border-sky-500 focus:outline-none"
          >
            <option value="">クリエイターを選択してください</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>
                {artist.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">説明文</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="例: 担当範囲、使用技術、工夫した点など"
            rows={4}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">成果物リンクURL（任意）</label>
          <input
            type="text"
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">作品画像（ファイル選択）</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-600 hover:file:bg-sky-100"
          />
          {imageUrl && (
            <div className="mt-2 flex items-center gap-3">
              <img src={imageUrl} alt="プレビュー" className="w-16 h-12 rounded-lg object-cover border border-slate-200" />
              <span className="text-xs text-slate-400">プレビュー画像</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-400 disabled:opacity-50"
          >
            {submitting ? "登録中..." : "登録する"}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}