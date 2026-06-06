import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { BlogLayout } from "@/components/blog/BlogLayout";
import { PostCard } from "@/components/blog/PostCard";
import { Pagination } from "@/components/blog/Pagination";
import type { Metadata } from "next";
import styles from "./page.module.css";

interface CategoryPostPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: CategoryPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  return { title: category ? `${category.name} 分类` : "分类" };
}

export default async function CategoryPostPage({ params, searchParams }: CategoryPostPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const currentPage = Math.max(1, parseInt(sp.page || "1", 10));
  const pageSize = 9;

  let category: Awaited<ReturnType<typeof prisma.category.findUnique>> = null;
  let posts: Awaited<ReturnType<typeof prisma.post.findMany>> = [];
  let total = 0;
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  let tagsWithCount: { id: number; name: string; slug: string; color: string; postCount: number }[] = [];
  let siteConfig: Awaited<ReturnType<typeof prisma.siteSettings.findFirst>> = null;

  try {
    category = await prisma.category.findUnique({ where: { slug } });
  } catch (error) {
    console.error("分类数据加载失败:", error instanceof Error ? error.message : error);
  }
  if (!category) notFound();

  try {
    const [fetchedPosts, fetchedTotal, fetchedCategories, fetchedTags, fetchedConfig] = await Promise.all([
      prisma.post.findMany({
        where: { status: "published", categories: { some: { id: category.id } } },
        include: {
          author: { select: { id: true, username: true, nickname: true, avatar: true } },
          categories: { select: { id: true, name: true, slug: true } },
          tags: { select: { id: true, name: true, slug: true, color: true } },
        },
        orderBy: { publishedAt: "desc" },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
      }),
      prisma.post.count({ where: { status: "published", categories: { some: { id: category.id } } } }),
      prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.tag.findMany({
        include: { _count: { select: { postTags: true } } },
        orderBy: { name: "asc" },
      }),
      prisma.siteSettings.findFirst(),
    ]);
    posts = fetchedPosts;
    total = fetchedTotal;
    categories = fetchedCategories;
    tagsWithCount = fetchedTags.map((t) => ({ ...t, postCount: t._count.postTags }));
    siteConfig = fetchedConfig;
  } catch (error) {
    console.error("分类文章页数据加载失败:", error instanceof Error ? error.message : error);
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <BlogLayout siteConfig={siteConfig || {}} categories={categories} tags={tagsWithCount}>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>{category.name}</h1>
          {category.description && (
            <p className={styles.description}>{category.description}</p>
          )}
          <span className={styles.count}>{total} 篇文章</span>
        </div>

        {posts.length > 0 ? (
          <>
            <div className={styles.grid}>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={{
                    ...post,
                    createdAt: post.createdAt.toISOString(),
                    updatedAt: post.updatedAt.toISOString(),
                    publishedAt: post.publishedAt?.toISOString(),
                  }}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl={`/categories/${slug}`} />
            )}
          </>
        ) : (
          <p className={styles.empty}>该分类下暂无文章</p>
        )}
      </div>
    </BlogLayout>
  );
}