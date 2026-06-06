import { AdminHeader } from "@/components/admin/AdminHeader";
import { PostEditor } from "../components/PostEditor";
import { prisma } from "@/lib/db";

export default async function NewPostPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { sortOrder: "asc" },
  });

  const tags = await prisma.tag.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <AdminHeader title="写文章" description="创建新的博客文章" />
      <PostEditor
        mode="create"
        categories={categories}
        tags={tags}
      />
    </div>
  );
}