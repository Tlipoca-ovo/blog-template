import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { NavigationEditor } from "./components/NavigationEditor";

export default async function NavigationPage() {
  const navItems = await prisma.config.findMany({
    where: { key: { startsWith: "nav_" } },
    orderBy: { key: "asc" },
  });

  const items = navItems
    .map((c) => {
      const parts = c.key.split("_");
      const index = parseInt(parts[1]);
      return {
        index,
        label: c.value,
        url: navItems.find((n) => n.key === `nav_url_${index}`)?.value || "",
      };
    })
    .filter((item) => item.label);

  return (
    <div>
      <AdminHeader title="导航定制" description="管理顶部和底部导航菜单" />
      <NavigationEditor initialItems={items} />
    </div>
  );
}