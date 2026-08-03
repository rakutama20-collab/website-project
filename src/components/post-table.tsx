"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // 1. 追加

export function PostTable({ posts }: { posts: any[] }) {
  const router = useRouter();

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`「${title}」を本当に削除しますか？\nこの操作は取り消せません。`)) {
      return;
    }

    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      
      if (res.ok) {
        toast.success("削除が完了しました"); // 2. 成功通知に変更
        router.refresh();
        // window.location.reload() は toast 通知を見せるために不要であれば削除してもOKです
      } else {
        const data = await res.json();
        toast.error(`削除に失敗しました: ${data.error || "エラーが発生しました"}`); // 3. エラー通知に変更
      }
    } catch (e) {
      toast.error("通信エラーが発生しました"); // 4. エラー通知に変更
    }
  };

  if (!Array.isArray(posts)) {
    return <p className="p-4 text-slate-500">データが取得できませんでした。</p>;
  }

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm text-left">
        <tbody className="divide-y divide-slate-100">
          {posts.map((post) => (
            <tr key={post.id} className="hover:bg-slate-50 transition-colors"><td className="px-6 py-4">
                <Link href={`/posts/${post.id}/edit`} className="text-blue-600 hover:underline">
                  {post.title}
                </Link>
              </td><td className="px-6 py-4">{post.status}</td><td className="px-6 py-4 text-right">
                <button 
                  onClick={() => handleDelete(post.id, post.title)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  削除
                </button>
              </td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}