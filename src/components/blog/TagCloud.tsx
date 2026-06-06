import Link from "next/link";
import type { Tag } from "@/types/blog";
import styles from "./TagCloud.module.css";

interface TagCloudProps {
  tags: Tag[];
  maxTags?: number;
}

export function TagCloud({ tags, maxTags }: TagCloudProps) {
  if (tags.length === 0) {
    return <p className={styles.empty}>暂无标签</p>;
  }

  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;

  // 计算相对权重（基于 postCount）
  const counts = displayTags.map((t) => t.postCount || 0);
  const maxCount = Math.max(...counts, 1);

  return (
    <div className={styles.tagCloud}>
      {displayTags.map((tag) => {
        const weight = (tag.postCount || 0) / maxCount;
        const fontSize = 0.75 + weight * 0.5; // 0.75rem 到 1.25rem

        return (
          <Link
            key={tag.id}
            href={`/tags/${tag.slug}`}
            className={styles.tag}
            style={{
              fontSize: `${fontSize}rem`,
              "--tag-color": tag.color,
            } as React.CSSProperties}
          >
            {tag.name}
            {tag.postCount !== undefined && (
              <span className={styles.count}>{tag.postCount}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}