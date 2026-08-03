"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";

export default function EditWorkPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [creatorId, setCreatorId] = useState("");
  const [artists, setArtists] = useState<any[]>([]);
  const [projectUrl, setProjectUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // 画面を開いたときに、カテゴリ、クリエイター、対象の作品データを取得する
  useEffect(() => {
    const fetchData = async () => {
      try {
        // カテゴリ一覧取得
        const catRes = await fetch("/api/categories");
        const catData = await catRes.json();
        if (Array.isArray(catData)) setCategories(catData);

        // クリエイター一覧取得
        const artRes = await fetch("/api/artists");
        const artData = await artRes.json();
        if (Array.isArray(artData)) setArtists(artData);

        // 成果物一覧から、編集対象のデータを探してフォームにセットする
        const workRes = await fetch("/api/works");
        const workData = await workRes.json();
        if (Array.isArray(workData)) {
          const currentWork = workData.find((w: any) => String(w.id) === String(id));
          if (currentWork) {
            setTitle(currentWork.title || "");
            setDescription(currentWork.description || "");
            setCategoryId(currentWork.categoryId || "");
            setCreatorId(currentWork.creatorId || "");
            setProjectUrl(currentWork.projectUrl || "");
            setImageUrl(currentWork.imageUrl || "");
          }
        }
      } catch (err) {
        console.error("Failed to fetch edit data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
      const res = await fetch(`/api/works?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, categoryId, creatorId, projectUrl, imageUrl }),
      });

      if (res.ok) {
        router.push("/works/admin");
        router.refresh();
      } else {
        alert("更新に失敗しました。");
      }
    } catch (err) {
      console.error("Failed to update work", err);
      alert("エラーが発生しました。");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminShell title="成果物編集" description="作品情報を読み込んでいます。">
        <div className="py-12 text-center text-sm text-slate-400">読み込み中...</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="成果物編集" description="ポートフォリオの作品情報を編集します。">
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

        {/* クリエイター選択 */}
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
            {submitting ? "更新中..." : "更新する"}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}