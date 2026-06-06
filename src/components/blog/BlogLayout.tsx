import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Sidebar } from "./Sidebar";
import type { Category, Tag, SiteConfig } from "@/types/blog";
import styles from "./BlogLayout.module.css";

interface BlogLayoutProps {
  children: React.ReactNode;
  siteConfig?: Partial<SiteConfig>;
  categories?: Category[];
  tags?: Tag[];
  showSidebar?: boolean;
}

export function BlogLayout({
  children,
  siteConfig = {},
  categories,
  tags,
  showSidebar = true,
}: BlogLayoutProps) {
  return (
    <div className={styles.layout}>
      <Navbar
        siteName={siteConfig.siteName}
        siteLogo={siteConfig.siteLogo}
        showSearch={true}
      />
      <div className={styles.main}>
        <div className={`${styles.content} ${showSidebar ? styles.withSidebar : ""}`}>
          {children}
        </div>
        {showSidebar && (
          <Sidebar categories={categories} tags={tags} showRecentPosts={true} />
        )}
      </div>
      <Footer
        siteName={siteConfig.siteName}
        siteDescription={siteConfig.siteDescription}
        friendLinks={[]}
        socialLinks={[]}
      />
    </div>
  );
}