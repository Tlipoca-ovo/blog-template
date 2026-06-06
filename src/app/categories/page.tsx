import { prisma } from "@/lib/db";
import { BlogLayout } from "@/components/blog/BlogLayout";
import { CategoryList } from "@/components/blog/CategoryList";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "分类" };

export default async function CategoriesPage() {
  const [categories, siteConfig] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { postCategories: true } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.siteSettings.findFirst(),
  ]);

  const categoriesWithCount = categories.map((c) => ({
    ...c,
    postCount: c._count.postCategories,
  }));

  return (
    <BlogLayout siteConfig={siteConfig || {}} showSidebar={false}>
      <div className={styles.page}>
        <h1 className={styles.title}>分类</h1>
        <p className={styles.description}>按分类浏览所有文章</p>
        <CategoryList categories={categoriesWithCount} showCount={true} />
      </div>
    </BlogLayout>
  );
}