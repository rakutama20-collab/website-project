"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [loading, setLoading] = useState(true);

  // 投稿一覧の取得
  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts" as any);
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 削除処理
  const handleDelete = async (id: number) => {
    if (!confirm("本当にこの投稿を削除しますか？")) return;

    try {
      const res = await fetch(`/api/posts?id=${id}` as any, {
        method: "DELETE",
      });

      if (res.ok) {
        setPosts(posts.filter((post) => post.id !== id));
      } else {
        alert("削除に失敗しました。");
      }
    } catch (err) {
      console.error("Failed to delete post", err);
      alert("削除処理中にエラーが発生しました。");
    }
  };

  // 選択されたカテゴリに応じて投稿を絞り込む
  const filteredPosts = posts.filter((post) => {
    if (selectedCategory === "すべて") return true;
    return post.tags === selectedCategory;
  });

  // タブの定義
  const categories = ["すべて", "WEB制作", "動画制作", "DTP制作", "イラスト・Other"];

  return (
    <AdminShell title="投稿管理" description="ポートフォリオの投稿一覧とカテゴリごとの管理を行います。">
      <div className="space-y-6">
        {/* 上部：アクションバー（カテゴリタブ ＆ 新規作成ボタン） */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* カテゴリタブ（切り替えボタン） */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-sky-500 text-white shadow-sm shadow-sky-500/25"
                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <Link
            href="/posts/new"
            className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-sky-400 hover:shadow-sky-500/25 shrink-0"
          >
            + 新規投稿を作成
          </Link>
        </div>

        {/* 投稿リスト表示 */}
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">読み込み中...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
            該当する投稿がありません。
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredPosts.map((post) => (
              <div 
                key={post.id} 
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-center space-x-4 min-w-0">
                  {/* サムネイル画像プレビュー */}
                  <div className="w-16 h-12 rounded-lg bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">No Image</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {/* 公開 / 下書き のバッジ */}
                      {post.status === "draft" ? (
                        <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200/60">
                          下書き
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200/60">
                          公開
                        </span>
                      )}

                      {/* カテゴリ（タグ） */}
                      {post.tags && (
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
                          {post.tags}
                        </span>
                      )}
                    </div>

                    <Link 
                      href={`/posts/${post.id}/edit`} 
                      className="font-bold text-sm text-slate-900 hover:text-sky-600 transition truncate block"
                    >
                      {post.title}
                    </Link>
                    <p className="text-[11px] text-slate-400 mt-0.5">更新日: {post.updatedAt}</p>
                  </div>
                </div>
                
                {/* アクションボタン */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
                  <Link 
                    href={`/posts/${post.id}/edit`} 
                    className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="inline-flex items-center justify-center rounded-xl bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
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