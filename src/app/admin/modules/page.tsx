import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ModuleEditor } from "./components/ModuleEditor";

export default async function ModulesPage() {
  const modules = await prisma.config.findMany({
    where: { key: { startsWith: "module_" } },
    orderBy: { key: "asc" },
  });

  const modulesData = MODULE_DEFINITIONS.map((def) => {
    const config = modules.find((m) => m.key === def.configKey);
    return {
      id: def.id,
      name: def.name,
      description: def.description,
      enabled: config?.value === "true",
    };
  });

  return (
    <div>
      <AdminHeader title="模块定制" description="管理首页模块的显示和排序" />
      <ModuleEditor initialModules={modulesData} />
    </div>
  );
}

const MODULE_DEFINITIONS = [
  { id: "hero", name: "英雄区域", description: "首页顶部大图/标语区域", configKey: "module_hero" },
  { id: "featured", name: "精选文章", description: "首页推荐文章展示", configKey: "module_featured" },
  { id: "recent", name: "最新文章", description: "首页文章列表", configKey: "module_recent" },
  { id: "categories", name: "分类导航", description: "分类快捷入口", configKey: "module_categories" },
  { id: "tags", name: "标签云", description: "热门标签展示", configKey: "module_tags" },
  { id: "friends", name: "友情链接", description: "友链展示区域", configKey: "module_friends" },
  { id: "about", name: "关于博主", description: "博主介绍区域", configKey: "module_about" },
];