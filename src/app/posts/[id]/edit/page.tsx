"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("WEB制作");
  const [imageUrl, setImageUrl] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("published"); // ★ ステータス用
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // 既存データの取得
  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts?id=${id}` as any);
        if (res.ok) {
          const data = await res.json();
          setTitle(data.title || "");
          setTags(data.tags || "WEB制作");
          setImageUrl(data.imageUrl || "");
          setBody(data.body || "");
          setStatus(data.status || "published"); // ★ 取得したステータスをセット
        }
      } catch (err) {
        console.error("Failed to fetch post", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  // 画像アップロード処理
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

  // 更新処理
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/posts" as any, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: Number(id), title, tags, imageUrl, body, status }), // ★ status を送信
    });

    if (res.ok) {
      router.push("/posts");
    } else {
      alert("更新に失敗しました。");
    }
  };

  // 削除処理
  const handleDelete = async () => {
    if (!confirm("このポートフォリオ項目を削除しますか？")) return;

    const res = await fetch(`/api/posts?id=${id}` as any, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/posts");
    } else {
      alert("削除に失敗しました。");
    }
  };

  if (loading) return <AdminShell title="Edit Portfolio" description="読み込み中..."><p>Loading...</p></AdminShell>;

  return (
    <AdminShell title="ポートフォリオ編集" description="02 PORTFOLIO の項目を編集します">
      <form onSubmit={handleUpdate} className="space-y-4 max-w-xl bg-white p-6 rounded shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1">実績タイトル / クライアント名</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 w-full rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">カテゴリ（ジャンル）</label>
          <select
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="border p-2 w-full rounded bg-white"
          >
            <option value="WEB制作">WEB制作 / バナー</option>
            <option value="動画制作">動画制作</option>
            <option value="DTP制作">DTP制作 / チラシ</option>
            <option value="イラスト・Other">イラスト・Other</option>
          </select>
        </div>

        {/* ★ 公開ステータス選択 */}
        <div>
          <label className="block text-sm font-medium mb-1">公開ステータス</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border p-2 w-full rounded bg-white"
          >
            <option value="published">公開</option>
            <option value="draft">下書き</option>
          </select>
        </div>

        {/* 画像アップロード & プレビュー */}
        <div>
          <label className="block text-sm font-medium mb-1">サムネイル画像</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="border p-2 w-full rounded text-sm bg-gray-50 cursor-pointer"
          />
          {uploading && <p className="text-xs text-blue-600 mt-1">画像をアップロード中...</p>}

          {imageUrl && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1">現在のプレビュー:</p>
              <div className="w-40 h-28 border rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                <img src={imageUrl} alt="プレビュー画像" className="object-cover w-full h-full" />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">詳細・説明文</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="border p-2 w-full h-32 rounded"
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="space-x-4">
            <button
              type="submit"
              disabled={uploading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              更新する
            </button>
            <button
              type="button"
              onClick={() => router.push("/posts")}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            >
              キャンセル
            </button>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
          >
            削除する
          </button>
        </div>
      </form>
    </AdminShell>
  );
}