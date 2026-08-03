"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AdminShell } from "@/components/admin-shell";

type FormState = {
  title: string;
  slug: string;
  body: string;
  status: string;
  publishDate: string;
  tags: string;
};

const initialFormState: FormState = {
  title: "",
  slug: "",
  body: "",
  status: "Draft",
  publishDate: "",
  tags: "",
};

export default function NewPostForm() {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const updateField = (field: keyof FormState, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const submitPost = async (statusOverride?: string) => {
    if (isSubmitting) {
      return;
    }

    const selectedStatus = statusOverride ?? formState.status ?? "Draft";
    const payload = {
      ...formState,
      status: selectedStatus,
      title: formState.title.trim(),
      slug: formState.slug.trim(),
      body: formState.body.trim(),
      publishDate: formState.publishDate.trim(),
      tags: formState.tags.trim(),
    };

    if (!payload.title) {
      setFeedback({ type: "error", message: "タイトルを入力してください。" });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    console.info("[submitPost] sending payload", payload);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const rawBody = await response.text();
      let data: { error?: string; message?: string } | null = null;

      if (rawBody) {
        try {
          data = JSON.parse(rawBody) as { error?: string; message?: string };
        } catch (parseError) {
          console.warn("[submitPost] response body is not valid JSON", parseError);
          data = { error: rawBody };
        }
      }

      console.info("[submitPost] response", { status: response.status, body: rawBody });

      if (!response.ok) {
        throw new Error(data?.error ?? `保存に失敗しました。status: ${response.status}`);
      }

      setFeedback({
        type: "success",
        message: selectedStatus === "Draft" ? "下書きを保存しました。" : "記事を作成しました。",
      });
      setFormState({ ...initialFormState, status: "Draft" });
    } catch (error) {
      console.error("[submitPost] failed", error);
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "通信エラーが発生しました。",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }
    void submitPost(formState.status);
  };

  return (
    <AdminShell
      title="Create new post"
      description="Draft a new article with the fields below. The form now submits to a working draft-save endpoint."
    >
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Recommended fields</h3>
          <p className="mt-2 text-sm text-slate-600">
            These inputs cover the basics for a beginner-friendly editorial workflow.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Title</p>
            <p className="mt-1 text-sm text-slate-600">Clear and simple headline for the article.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Slug</p>
            <p className="mt-1 text-sm text-slate-600">URL-friendly identifier such as summer-campaign.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Body</p>
            <p className="mt-1 text-sm text-slate-600">Main content area for article text and formatting.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Status</p>
            <p className="mt-1 text-sm text-slate-600">Choose Draft, Published, or Scheduled.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Publish date</p>
            <p className="mt-1 text-sm text-slate-600">Set a date when the article should go live.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Tags</p>
            <p className="mt-1 text-sm text-slate-600">Useful for grouping content by topic or campaign.</p>
          </div>
        </div>

        <form className="mt-6 rounded-xl border border-slate-200 bg-white p-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                name="title"
                value={formState.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="Enter a title"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-0"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="slug">
                Slug
              </label>
              <input
                id="slug"
                name="slug"
                value={formState.slug}
                onChange={(event) => updateField("slug", event.target.value)}
                placeholder="example-post"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-0"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="body">
              Body
            </label>
            <textarea
              id="body"
              name="body"
              rows={8}
              value={formState.body}
              onChange={(event) => updateField("body", event.target.value)}
              placeholder="Write your article here..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-0"
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formState.status}
                onChange={(event) => updateField("status", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-0"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Scheduled">Scheduled</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="publishDate">
                Publish date
              </label>
              <input
                id="publishDate"
                name="publishDate"
                type="date"
                value={formState.publishDate}
                onChange={(event) => updateField("publishDate", event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-0"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="tags">
                Tags
              </label>
              <input
                id="tags"
                name="tags"
                value={formState.tags}
                onChange={(event) => updateField("tags", event.target.value)}
                placeholder="news, campaign"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-0"
              />
            </div>
          </div>

          {feedback ? (
            <p className={`mt-4 text-sm ${feedback.type === "success" ? "text-emerald-600" : "text-rose-600"}`}>
              {feedback.message}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                if (isSubmitting) {
                  return;
                }
                void submitPost("Draft");
              }}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save draft"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Create post"}
            </button>
            <Link
              href="/posts"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
