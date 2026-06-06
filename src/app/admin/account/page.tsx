import { AdminHeader } from "@/components/admin/AdminHeader";
import { AccountEditor } from "./components/AccountEditor";

export default async function AccountPage() {
  return (
    <div>
      <AdminHeader title="账号管理" description="修改管理员密码" />
      <AccountEditor />
    </div>
  );
}
