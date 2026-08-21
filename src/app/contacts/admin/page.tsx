import { AdminShell } from "@/components/admin-shell";
import { ContactsAdminTable } from "@/components/contacts-admin-table";
import Link from "next/link";

export default function ContactsAdminPage() {
  return (
    <AdminShell
      title="お問合せ管理"
      description="サイトから送信されたお問合せの一覧を確認・管理します。"
    >
      <div className="mb-5 flex justify-end"><Link href="/contacts/admin/fields" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:border-sky-300 hover:text-sky-600">フォーム項目を設定</Link></div>
      <ContactsAdminTable />
    </AdminShell>
  );
}