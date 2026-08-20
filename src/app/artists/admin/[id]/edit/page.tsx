"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";

type ArtistRecord = {
    id: number;
    name?: string | null;
    role?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
};

export default function EditArtistPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;

    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [bio, setBio] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetchArtist = async () => {
            try {
                const res = await fetch(`/api/artists?id=${id}`);
                const data = await res.json();
                const artist = Array.isArray(data) ? data.find((item: ArtistRecord) => item.id === Number(id)) : data as ArtistRecord;
                
                if (artist) {
                    setName(artist.name || "");
                    setRole(artist.role || "");
                    setBio(artist.bio || "");
                    setCurrentAvatarUrl(artist.avatarUrl || "");
                    setPreviewUrl(artist.avatarUrl || "");
                }
            } catch (err) {
                console.error("Failed to fetch artist", err);
            } finally {
                setLoading(false);
            }
        };
        fetchArtist();
    }, [id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            alert("名前を入力してください。");
            return;
        }
        setSubmitting(true);

        const executeSave = async (imageUrl: string) => {
            try {
                const res = await fetch("/api/artists", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: Number(id),
                        name,
                        role,
                        bio,
                        avatarUrl: imageUrl || currentAvatarUrl,
                    }),
                });
                if (res.ok) {
                    router.push("/artists/admin");
                } else {
                    alert("更新に失敗しました。");
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
            executeSave(currentAvatarUrl);
        }
    };

    if (loading) {
        return (
            <AdminShell title="クリエイター編集" description="読み込み中...">
                <p className="text-sm text-slate-400">読み込み中...</p>
            </AdminShell>
        );
    }

    return (
        <AdminShell title="クリエイター編集" description="クリエイターの情報を編集します。">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">名前</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="例: 山田 太郎"
                            required
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                        />
                    </div>

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

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">プロフィール紹介文</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="プロフィールを入力してください"
                            rows={3}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-sky-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">アバター画像</label>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="プレビュー" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[10px] text-slate-400">No Image</span>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-600 hover:file:bg-sky-100 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-400 disabled:opacity-50"
                        >
                            {submitting ? "保存中..." : "変更を保存する"}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/artists/admin")}
                            className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                        >
                            キャンセル
                        </button>
                    </div>
                </form>
            </div>
        </AdminShell>
    );
}