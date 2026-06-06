import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { TagManager } from "./components/TagManager";

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <AdminHeader title="标签管理" description="管理博客文章标签" />
      <TagManager initialTags={tags} />
    </div>
  );
}