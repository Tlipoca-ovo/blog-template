import { prisma } from "@/lib/db";
import { BlogLayout } from "@/components/blog/BlogLayout";
import { PostCard } from "@/components/blog/PostCard";
import { Pagination } from "@/components/blog/Pagination";
import { parseThemeColors, generateThemeCSS } from "@/lib/theme";
import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "首页",
};

interface HomePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const pageSize = 9;

  let posts: Awaited<ReturnType<typeof prisma.post.findMany>> = [];
  let total = 0;
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  let tagsWithCount: { id: number; name: string; slug: string; color: string; postCount: number }[] = [];
  let siteConfig: Awaited<ReturnType<typeof prisma.siteSettings.findFirst>> = null;

  try {
    const [fetchedPosts, fetchedTotal, fetchedCategories, fetchedTags, fetchedConfig] = await Promise.all([
      prisma.post.findMany({
        where: { status: "published" },
        include: {
          author: { select: { id: true, username: true, nickname: true, avatar: true } },
          categories: { select: { id: true, name: true, slug: true } },
          tags: { select: { id: true, name: true, slug: true, color: true } },
        },
        orderBy: { publishedAt: "desc" },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
      }),
      prisma.post.count({ where: { status: "published" } }),
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
    console.error("首页数据加载失败:", error instanceof Error ? error.message : error);
  }

  const tagsWithCountFinal = tagsWithCount;
  const siteConfigFinal = siteConfig;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      {/* 动态主题样式 */}
      <style dangerouslySetInnerHTML={{ __html: generateThemeCSS(parseThemeColors(siteConfigFinal?.themeColors || ""), {}) }} />

      <BlogLayout
        siteConfig={siteConfigFinal || {}}
        categories={categories}
        tags={tagsWithCountFinal}
        showSidebar={true}
      >
        {/* Hero 区域 */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>{siteConfig?.siteName || "我的博客"}</h1>
          <p className={styles.heroDescription}>
            {siteConfig?.siteDescription || "欢迎来到我的博客，分享技术与生活"}
          </p>
        </section>

        {/* 文章列表 */}
        {posts.length > 0 ? (
          <>
            <div className={styles.postGrid}>
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
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl="/"
              />
            )}
          </>
        ) : (
          <div className={styles.empty}>
            <p>暂无文章</p>
          </div>
        )}
      </BlogLayout>
    </>
  );
}