import { AdminHeader } from "@/components/admin/AdminHeader";
import { getConfig } from "@/lib/config";
import { SeoEditor } from "./components/SeoEditor";

export default async function SeoPage() {
  const title = await getConfig("seo_title", "");
  const description = await getConfig("seo_description", "");
  const keywords = await getConfig("seo_keywords", "");
  const ogImage = await getConfig("seo_og_image", "");
  const twitterCard = await getConfig("seo_twitter_card", "summary_large_image");
  const canonical = await getConfig("seo_canonical", "");
  const robots = await getConfig("seo_robots", "index,follow");

  return (
    <div>
      <AdminHeader title="SEO 设置" description="配置搜索引擎优化和社交分享" />
      <SeoEditor
        initialTitle={title}
        initialDescription={description}
        initialKeywords={keywords}
        initialOgImage={ogImage}
        initialTwitterCard={twitterCard}
        initialCanonical={canonical}
        initialRobots={robots}
      />
    </div>
  );
}
