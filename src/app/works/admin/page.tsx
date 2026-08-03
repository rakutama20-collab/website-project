"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin-shell";

export default function WorksAdminPage() {
  const [works, setWorks] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("公開");
  const [projectUrl, setProjectUrl] = useState("");
  const [creator, setCreator] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [worksRes, artistsRes] = await Promise.all([
        fetch("/api/works"),
        fetch("/api/artists"),
      ]);
      const worksData = await worksRes.json();
      const artistsData = await artistsRes.json();
      setWorks(Array.isArray(worksData) ? worksData : []);
      setArtists(Array.isArray(artistsData) ? artistsData : []);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleEditClick = (work: any) => {
    setEditingId(work.id);
    setTitle(work.title);
    setDescription(work.description);
    setRole(work.role || "");
    setStatus(work.status || "公開");
    setProjectUrl(work.projectUrl || "");
    setCreator(work.creator || "");
    setCurrentUrl(work.url);
    setFile(null);
    const fileInput = document.getElementById("work-file-input") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setRole("");
    setStatus("公開");
    setProjectUrl("");
    setCreator("");
    setCurrentUrl("");
    setFile(null);
    const fileInput = document.getElementById("work-file-input") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert("作品タイトルを入力してください。");
      return;
    }
    setSubmitting(true);

    const executeSave = async (imageUrl: string) => {
      try {
        if (editingId) {
          const res = await fetch("/api/works", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: editingId,
              title,
              description,
              role,
              status,
              projectUrl,
              creator,
              url: imageUrl || currentUrl,
            }),
          });
          if (res.ok) {
            handleCancelEdit();
            fetchData();
          } else {
            alert("作品の更新に失敗しました。");
          }
        } else {
          const res = await fetch("/api/works", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description, role, status, projectUrl, creator, url: imageUrl }),
          });
          if (res.ok) {
            handleCancelEdit();
            fetchData();
          } else {
            alert("作品の追加に失敗しました。");
          }
        }
      } catch (err) {
        console.error(err);
        alert("エラーが発生しました。");
      } finally {
        setSubmitting(false);
      }
    };

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        executeSave(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      executeSave(currentUrl);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("本当にこの作品を削除しますか？")) return;

    try {
      const res = await fetch(`/api/works?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        if (editingId === id) handleCancelEdit();
        setWorks(works.filter((item) => item.id !== id));
      } else {
        alert("削除に失敗しました。");
      }
    } catch (err) {
      console.error(err);
      alert("エラーが発生しました。");
    }
  };

  return (
    <AdminShell title="ワークス管理" description="ポートフォリオや制作実績の追加・編集・削除を行います。">
      <div className="space-y-6">
        {/* 追加・編集フォーム */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-slate-900">
              {editingId ? "作品を編集" : "新規作品を追加"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                編集をキャンセル
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">作品タイトル</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: オーダースーツ特設サイト"
                required
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
            
            {/* 専門分野・ロール */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">専門分野・ロール</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-white"
              >
                <option value="">選択してください</option>
                <option value="WEB制作">WEB制作</option>
                <option value="動画">動画</option>
                <option value="DTP">DTP</option>
                <option value="イラスト">イラスト</option>
                <option value="Other（3D、ゲーム、音源など）">Other（3D、ゲーム、音源など）</option>
              </select>
            </div>

            {/* 担当クリエイター選択 */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">担当クリエイター</label>
              <select
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-white"
              >
                <option value="">選択してください</option>
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.name}>
                    {artist.name} ({artist.role || "役割未設定"})
                  </option>
                ))}
              </select>
            </div>

            {/* 公開ステータス */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">公開ステータス</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-sky-500 bg-white"
              >
                <option value="公開">公開</option>
                <option value="非公開">非公開</option>
              </select>
            </div>

            {/* 制作物URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">制作物URL（デモサイト・GitHubなど）</label>
              <input
                type="url"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">説明</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="例: 3Dボディスキャナー対応の予約フォーム実装"
                rows={2}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">画像ファイルを選択</label>
              {currentUrl && !file && (
                <div className="mb-2 flex items-center space-x-2">
                  <img src={currentUrl} alt="Current" className="w-10 h-10 rounded object-cover border" />
                  <span className="text-xs text-slate-500">現在の画像が設定されています（変更する場合のみ選択）</span>
                </div>
              )}
              <input
                id="work-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-600 hover:file:bg-sky-100 cursor-pointer"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-400 disabled:opacity-50"
              >
                {submitting ? "保存中..." : editingId ? "変更を保存する" : "作品を追加する"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                >
                  キャンセル
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 登録済み作品一覧 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="font-bold text-sm text-slate-900 mb-4">登録済み作品一覧</h2>
          {loading ? (
            <p className="text-sm text-slate-400">読み込み中...</p>
          ) : works.length === 0 ? (
            <p className="text-sm text-slate-400">作品が登録されていません。</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {works.map((work) => (
                <div key={work.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {work.url && work.url.startsWith("data:") ? (
                      <img src={work.url} alt={work.title} className="w-12 h-12 rounded-lg object-cover border" />
                    ) : work.url && !work.url.startsWith("data:") && work.url.length > 0 ? (
                      <img src={work.url} alt={work.title} className="w-12 h-12 rounded-lg object-cover border" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400">No Image</div>
                    )}
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="text-sm font-bold text-slate-900">{work.title}</h3>
                        {work.role && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-600 border border-sky-100">
                            {work.role}
                          </span>
                        )}
                        {work.creator && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-600 border border-purple-100">
                            担当: {work.creator}
                          </span>
                        )}
                        {work.status === "非公開" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                            非公開
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                            公開
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{work.description}</p>
                      {work.projectUrl && (
                        <a
                          href={work.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-sky-600 hover:underline inline-block mt-1"
                        >
                          🔗 {work.projectUrl}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditClick(work)}
                      className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(work.id)}
                      className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}