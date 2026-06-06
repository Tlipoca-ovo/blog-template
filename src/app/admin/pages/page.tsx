import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { PageManager } from "./components/PageManager";

export default async function PagesPage() {
  const pages = await prisma.page.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <AdminHeader title="页面管理" description="管理博客自定义页面" />
      <PageManager initialPages={pages} />
    </div>
  );
}