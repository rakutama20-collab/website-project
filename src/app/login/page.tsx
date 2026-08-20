"use client";

import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

// フォーム本体のコンポーネント
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRedirect = searchParams.get("redirect") || "/";
  const redirect = requestedRedirect.startsWith("/") && !requestedRedirect.startsWith("//") ? requestedRedirect : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("メールアドレスまたはパスワードが正しくありません。");
        setLoading(false);
        return;
      }

      router.push(redirect);
    } catch {
      setError("通信エラーが発生しました。");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
            Besmile CMS
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">管理画面へログイン</h1>
          <p className="mt-2 text-sm text-slate-600">メールアドレスとパスワードを入力してください</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@besmile.jp"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 px-4 py-2 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 disabled:bg-slate-400 transition"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600 mb-3">
            テストアカウント
          </p>
          <div className="space-y-2 text-xs">
            <div className="bg-slate-50 rounded p-2">
              <p className="text-slate-600">
                <strong>管理者:</strong> admin@besmile.jp
              </p>
            </div>
            <div className="bg-slate-50 rounded p-2">
              <p className="text-slate-600">
                <strong>編集者:</strong> editor@besmile.jp
              </p>
            </div>
            <div className="bg-slate-50 rounded p-2">
              <p className="text-slate-600">
                <strong>閲覧者:</strong> viewer@besmile.jp
              </p>
            </div>
            <p className="text-slate-500 mt-2">
              <strong>パスワード:</strong> すべてのアカウントで besmile7011
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ページのエントリーポイント（これを default export する）
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-sm text-slate-500">読み込み中...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}