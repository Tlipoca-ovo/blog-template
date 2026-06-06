import { AdminHeader } from "@/components/admin/AdminHeader";
import { getConfig } from "@/lib/config";
import { SettingsEditor } from "./components/SettingsEditor";

export default async function SettingsPage() {
  const siteName = await getConfig("site_name", "");
  const siteDescription = await getConfig("site_description", "");
  const siteLogo = await getConfig("site_logo", "");
  const siteFavicon = await getConfig("site_favicon", "");
  const siteUrl = await getConfig("site_url", "");
  const analyticCode = await getConfig("analytic_code", "");
  const customCss = await getConfig("custom_css", "");
  const customHead = await getConfig("custom_head", "");
  const footerText = await getConfig("footer_text", "");

  return (
    <div>
      <AdminHeader title="全局设置" description="配置站点基本信息" />
      <SettingsEditor
        initialSiteName={siteName}
        initialSiteDescription={siteDescription}
        initialSiteLogo={siteLogo}
        initialSiteFavicon={siteFavicon}
        initialSiteUrl={siteUrl}
        initialAnalyticCode={analyticCode}
        initialCustomCss={customCss}
        initialCustomHead={customHead}
        initialFooterText={footerText}
      />
    </div>
  );
}
