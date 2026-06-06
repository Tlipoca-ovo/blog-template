import Link from "next/link";
import type { Category } from "@/types/blog";
import styles from "./CategoryList.module.css";

interface CategoryListProps {
  categories: Category[];
  showCount?: boolean;
}

export function CategoryList({ categories, showCount = true }: CategoryListProps) {
  if (categories.length === 0) {
    return <p className={styles.empty}>暂无分类</p>;
  }

  return (
    <ul className={styles.list}>
      {categories.map((cat) => (
        <li key={cat.id}>
          <Link href={`/categories/${cat.slug}`} className={styles.item}>
            <span className={styles.name}>{cat.name}</span>
            {showCount && cat.postCount !== undefined && (
              <span className={styles.count}>{cat.postCount}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}