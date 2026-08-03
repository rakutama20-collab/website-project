"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PostDeleteButtonProps = {
  postId: number;
};

export function PostDeleteButton({ postId }: PostDeleteButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("この投稿を削除しますか？")) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/posts?id=${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("削除に失敗しました。");
      }

      router.refresh();
      window.dispatchEvent(new Event("posts:updated"));
    } catch (error) {
      console.error("[PostDeleteButton] failed to delete", error);
      window.alert(error instanceof Error ? error.message : "削除に失敗しました。");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {deleting ? "削除中..." : "Delete"}
    </button>
  );
}