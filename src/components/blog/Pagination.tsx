import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Pagination.module.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams?: Record<string, string>;
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams }: PaginationProps) {
  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams || {});
    params.set("page", String(page));
    const query = params.toString();
    return `${baseUrl}${query ? `?${query}` : ""}`;
  };

  const getVisiblePages = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <nav className={styles.pagination} aria-label="分页">
      {currentPage > 1 ? (
        <Link href={buildUrl(currentPage - 1)} className={styles.pageLink}>
          <ChevronLeft size={18} />
        </Link>
      ) : (
        <span className={`${styles.pageLink} ${styles.disabled}`}>
          <ChevronLeft size={18} />
        </span>
      )}

      {getVisiblePages().map((page, idx) =>
        page === "..." ? (
          <span key={`ellipsis-${idx}`} className={styles.ellipsis}>…</span>
        ) : (
          <Link
            key={page}
            href={buildUrl(page)}
            className={`${styles.pageLink} ${page === currentPage ? styles.active : ""}`}
          >
            {page}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link href={buildUrl(currentPage + 1)} className={styles.pageLink}>
          <ChevronRight size={18} />
        </Link>
      ) : (
        <span className={`${styles.pageLink} ${styles.disabled}`}>
          <ChevronRight size={18} />
        </span>
      )}
    </nav>
  );
}