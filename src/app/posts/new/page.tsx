"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("WEB制作");
  const [imageUrl, setImageUrl] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("published");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // ファイルアップロード処理
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setImageUrl(data.imageUrl);
      } else {
        alert(data.error || "アップロードに失敗しました");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("通信エラーが発生しました");
    } finally {
      setUploading(false);
    }
  };

  // 登録処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/posts" as any, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, tags, imageUrl, body, status }),
      });

      if (res.ok) {
        router.push("/posts");
      } else {
        const data = await res.json();
        alert(data.error || "作成に失敗しました。");
      }
    } catch (err) {
      console.error("Failed to create post", err);
      alert("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminShell title="ポートフォリオ追加" description="新規のポートフォリオ実績や制作物を追加します。">
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm">
          {/* 実績タイトル */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              実績タイトル / クライアント名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-all focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10"
              placeholder="例: Harenowa コーポレートサイト"
              required
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* カテゴリ */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                カテゴリ（ジャンル）
              </label>
              <select
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 transition-all focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10"
              >
                <option value="WEB制作">WEB制作 / バナー</option>
                <option value="動画制作">動画制作</option>
                <option value="DTP制作">DTP制作 / チラシ</option>
                <option value="イラスト・Other">イラスト・Other</option>
              </select>
            </div>

            {/* 公開ステータス */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                公開ステータス
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 transition-all focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10"
              >
                <option value="published">公開</option>
                <option value="draft">下書き</option>
              </select>
            </div>
          </div>

          {/* サムネイル画像 */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              サムネイル画像
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer border border-slate-200 rounded-xl p-2 bg-slate-50/50"
              />
            </div>
            {uploading && <p className="text-xs text-sky-600 mt-2 font-medium">画像をアップロード中...</p>}

            {imageUrl && (
              <div className="mt-3">
                <p className="text-xs font-medium text-slate-400 mb-1.5">プレビュー:</p>
                <div className="w-44 h-28 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shadow-sm">
                  <img src={imageUrl} alt="プレビュー画像" className="object-cover w-full h-full" />
                </div>
              </div>
            )}
          </div>

          {/* 詳細・説明文 */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              詳細・説明文
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 h-36 transition-all focus:bg-white focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/10 resize-y"
              placeholder="制作物の詳細やこだわったポイントを入力してください"
            />
          </div>

          {/* ボタン類 */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.push("/posts")}
              className="rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="rounded-xl bg-sky-500 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-sky-400 hover:shadow-sky-500/25 disabled:opacity-50"
            >
              {loading ? "保存中..." : "追加する"}
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}