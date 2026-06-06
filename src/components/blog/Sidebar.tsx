import { SearchBar } from "./SearchBar";
import { CategoryList } from "./CategoryList";
import { TagCloud } from "./TagCloud";
import type { Category, Tag } from "@/types/blog";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  categories?: Category[];
  tags?: Tag[];
  recentPosts?: { title: string; slug: string; date: string }[];
  showSearch?: boolean;
  showCategories?: boolean;
  showTags?: boolean;
  showRecentPosts?: boolean;
  onSearch?: (query: string) => void;
}

export function Sidebar({
  categories,
  tags,
  recentPosts,
  showSearch = true,
  showCategories = true,
  showTags = true,
  showRecentPosts = false,
  onSearch,
}: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      {showSearch && <SearchBar onSearch={onSearch} />}

      {showCategories && categories && categories.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>分类</h3>
          <CategoryList categories={categories} />
        </section>
      )}

      {showTags && tags && tags.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>标签</h3>
          <TagCloud tags={tags} />
        </section>
      )}

      {showRecentPosts && recentPosts && recentPosts.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>最新文章</h3>
          <div className={styles.recentPosts}>
            {recentPosts.map((post) => (
              <a key={post.slug} href={`/posts/${post.slug}`} className={styles.recentPost}>
                <span className={styles.recentPostTitle}>{post.title}</span>
                <span className={styles.recentPostDate}>{post.date}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}