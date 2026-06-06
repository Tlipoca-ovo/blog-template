import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { BlogLayout } from "@/components/blog/BlogLayout";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { Comments } from "@/components/blog/Comments";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { parseThemeColors, generateThemeCSS } from "@/lib/theme";
import type { Metadata } from "next";
import styles from "./page.module.css";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug, status: "published" },
    select: { title: true, excerpt: true, coverImage: true },
  });
  if (!post) return { title: "文章未找到" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  let post: Awaited<ReturnType<typeof prisma.post.findUnique>> = null;
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  let tagsWithCount: { id: number; name: string; slug: string; color: string; postCount: number }[] = [];
  let siteConfig: Awaited<ReturnType<typeof prisma.siteSettings.findFirst>> = null;

  try {
    post = await prisma.post.findUnique({
      where: { slug, status: "published" },
      include: {
        author: { select: { id: true, username: true, nickname: true, avatar: true } },
        categories: { select: { id: true, name: true, slug: true } },
        tags: { select: { id: true, name: true, slug: true, color: true } },
      },
    });
  } catch (error) {
    console.error("文章数据加载失败:", error instanceof Error ? error.message : error);
  }

  if (!post) notFound();

  // 增加浏览量（独立处理，避免阻塞页面渲染）
  try {
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });
  } catch (error) {
    console.error("浏览量更新失败:", error instanceof Error ? error.message : error);
  }

  try {
    const [fetchedCategories, fetchedTags, fetchedConfig] = await Promise.all([
      prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.tag.findMany({
        include: { _count: { select: { postTags: true } } },
        orderBy: { name: "asc" },
      }),
      prisma.siteSettings.findFirst(),
    ]);
    categories = fetchedCategories;
    tagsWithCount = fetchedTags.map((t) => ({ ...t, postCount: t._count.postTags }));
    siteConfig = fetchedConfig;
  } catch (error) {
    console.error("侧边栏数据加载失败:", error instanceof Error ? error.message : error);
  }

  const themeColors = parseThemeColors(siteConfig?.themeColors || "");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: generateThemeCSS(themeColors, {}) }} />
      <ReadingProgress />
      <BlogLayout
        siteConfig={siteConfig || {}}
        categories={categories}
        tags={tagsWithCount}
        showSidebar={false}
      >
        <article className={styles.article}>
          {/* 封面图 */}
          {post.coverImage && (
            <img src={post.coverImage} alt={post.title} className={styles.coverImage} />
          )}

          {/* 元信息 */}
          <header className={styles.header}>
            <div className={styles.categories}>
              {post.categories.map((cat) => (
                <a key={cat.id} href={`/categories/${cat.slug}`} className={styles.category}>
                  {cat.name}
                </a>
              ))}
            </div>
            <h1 className={styles.title}>{post.title}</h1>
            <div className={styles.meta}>
              <span>{post.author.nickname}</span>
              <span>·</span>
              <span>
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : new Date(post.createdAt).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
              </span>
              <span>·</span>
              <span>{post.viewCount} 阅读</span>
            </div>
            {post.tags.length > 0 && (
              <div className={styles.tags}>
                {post.tags.map((tag) => (
                  <a
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className={styles.tag}
                    style={{ "--tag-color": tag.color } as React.CSSProperties}
                  >
                    {tag.name}
                  </a>
                ))}
              </div>
            )}
          </header>

          {/* 内容 */}
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* 目录 */}
          <aside className={styles.tocContainer}>
            <TableOfContents content={post.content} />
          </aside>
        </article>

        {/* 评论 */}
        <Comments postId={post.id.toString()} />
      </BlogLayout>
    </>
  );
}