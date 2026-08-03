"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin-shell";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // カテゴリ一覧の取得
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // カテゴリの追加
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });

      if (res.ok) {
        setNewCategoryName("");
        fetchCategories();
      } else {
        alert("カテゴリの追加に失敗しました。");
      }
    } catch (err) {
      console.error("Failed to create category", err);
    } finally {
      setSubmitting(false);
    }
  };

  // カテゴリの削除
  const handleDelete = async (id: number) => {
    if (!confirm("本当にこのカテゴリを削除しますか？")) return;

    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCategories(categories.filter((cat) => cat.id !== id));
      } else {
        alert("削除に失敗しました。");
      }
    } catch (err) {
      console.error("Failed to delete category", err);
    }
  };

  return (
    <AdminShell title="カテゴリー管理" description="作品や記事の分類に使用するカテゴリを追加・削除します。">
      <div className="max-w-xl space-y-6">
        {/* 新規追加フォーム */}
        <form onSubmit={handleAddCategory} className="flex gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="新しいカテゴリ名（例: UI/UXデザイン）"
            required
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-sky-500 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-400 disabled:opacity-50"
          >
            {submitting ? "追加中..." : "追加"}
          </button>
        </form>

        {/* カテゴリ一覧 */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-400">読み込み中...</div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">カテゴリが登録されていません。</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between px-6 py-4">
                  <span className="text-sm font-bold text-slate-800">{cat.name}</span>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}