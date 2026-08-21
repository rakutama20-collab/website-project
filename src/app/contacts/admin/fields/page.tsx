import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { ContactFieldsManager } from "@/components/contact-fields-manager";

export default function ContactFieldsPage() {
  return <AdminShell title="お問い合わせフォーム項目" description="公開フォームに表示する追加項目を管理します。">
    <div className="mb-5"><Link href="/contacts/admin" className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 hover:underline"><ArrowLeft size={15} />お問い合わせ管理へ戻る</Link></div>
    <ContactFieldsManager />
  </AdminShell>;
}
