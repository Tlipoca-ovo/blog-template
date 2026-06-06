import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CategoryManager } from "./components/CategoryManager";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <AdminHeader title="分类管理" description="管理博客文章分类" />
      <CategoryManager initialCategories={categories} />
    </div>
  );
}