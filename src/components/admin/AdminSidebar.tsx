import Link from "next/link";
import styles from "./AdminSidebar.module.css";

interface SidebarItem {
  label: string;
  href: string;
  icon?: string;
  active?: boolean;
}

interface AdminSidebarProps {
  items: SidebarItem[];
}

export function AdminSidebar({ items }: AdminSidebarProps) {
  return (
    <nav className={styles.sidebar}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${styles.item} ${item.active ? styles.active : ""}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}