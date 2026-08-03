import { AdminShell } from "@/components/admin-shell";

// 表示テスト用のダミーデータ
const mockContacts = [
  {
    id: 1,
    name: "山田 太郎",
    email: "yamada@example.com",
    subject: "お見積りについて",
    date: "2026-07-28",
    status: "未対応",
  },
  {
    id: 2,
    name: "佐藤 花子",
    email: "sato@example.com",
    subject: "サービスに関するご質問",
    date: "2026-07-27",
    status: "対応済",
  },
];

export default function ContactsAdminPage() {
  return (
    <AdminShell
      title="お問合せ管理"
      description="サイトから送信されたお問合せの一覧を確認・管理します。"
    >
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-900 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">お名前</th>
                <th className="px-6 py-4 font-medium">メールアドレス</th>
                <th className="px-6 py-4 font-medium">件名</th>
                <th className="px-6 py-4 font-medium">受信日</th>
                <th className="px-6 py-4 font-medium">ステータス</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">{contact.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{contact.email}</td>
                  <td className="px-6 py-4">{contact.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{contact.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        contact.status === "未対応"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-green-50 text-green-700 border border-green-200"
                      }`}
                    >
                      {contact.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}