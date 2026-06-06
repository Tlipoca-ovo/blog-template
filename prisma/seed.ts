import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

// 创建 better-sqlite3 适配器，配置 URL 字符串
const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("开始播种数据库...");

  // ============================================
  // 1. 初始化管理员账户
  // ============================================
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (!process.env.ADMIN_PASSWORD) {
    console.warn("⚠️ 警告: 未设置 ADMIN_PASSWORD 环境变量，使用默认密码 'admin123'");
  }

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { username: "admin" },
  });

  let admin;
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    admin = await prisma.adminUser.create({
      data: {
        username: "admin",
        password: hashedPassword,
        nickname: "博主",
      },
    });
  } else {
    admin = existingAdmin;
  }
  console.log(`管理员账户已创建: admin / ${adminPassword}`);

  // ============================================
  // 2. 初始化默认分类
  // ============================================
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "tech" },
      update: {},
      create: { name: "技术", slug: "tech", description: "技术文章", sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: "life" },
      update: {},
      create: { name: "生活", slug: "life", description: "生活随笔", sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: "notes" },
      update: {},
      create: { name: "笔记", slug: "notes", description: "学习笔记", sortOrder: 3 },
    }),
  ]);
  console.log(`已创建 ${categories.length} 个分类`);

  // ============================================
  // 3. 初始化默认标签
  // ============================================
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: "javascript" },
      update: {},
      create: { name: "JavaScript", slug: "javascript", color: "#F7DF1E" },
    }),
    prisma.tag.upsert({
      where: { slug: "typescript" },
      update: {},
      create: { name: "TypeScript", slug: "typescript", color: "#3178C6" },
    }),
    prisma.tag.upsert({
      where: { slug: "nextjs" },
      update: {},
      create: { name: "Next.js", slug: "nextjs", color: "#000000" },
    }),
  ]);
  console.log(`已创建 ${tags.length} 个标签`);

  // ============================================
  // 4. 创建示例文章
  // ============================================
  const post = await prisma.post.upsert({
    where: { slug: "welcome-to-my-blog" },
    update: {},
    create: {
      title: "欢迎来到我的博客",
      slug: "welcome-to-my-blog",
      content: "# 欢迎\n\n这是一个高度可自定义的博客模版。\n\n## 特性\n\n- 高度可自定义\n- 管理后台\n- 主题定制",
      description: "欢迎来到我的博客！这是一个高度可自定义的博客模版。",
      status: "published",
      views: 42,
      isPage: false,
      authorId: admin.id,
    },
  });
  console.log(`已创建示例文章: ${post.title}`);

  // 关联分类
  await prisma.postCategory.upsert({
    where: { postId_categoryId: { postId: post.id, categoryId: categories[0].id } },
    update: {},
    create: { postId: post.id, categoryId: categories[0].id },
  });

  // 关联标签
  await prisma.postTag.upsert({
    where: { postId_tagId: { postId: post.id, tagId: tags[2].id } },
    update: {},
    create: { postId: post.id, tagId: tags[2].id },
  });

  // ============================================
  // 5. 创建默认页面
  // ============================================
  const pages = await Promise.all([
    prisma.page.upsert({
      where: { slug: "about" },
      update: {},
      create: {
        title: "关于",
        slug: "about",
        content: "# 关于\n\n这是关于页面。",
        isDefault: true,
        sortOrder: 1,
      },
    }),
    prisma.page.upsert({
      where: { slug: "links" },
      update: {},
      create: {
        title: "友链",
        slug: "links",
        content: "# 友链\n\n这里是友链页面。",
        isDefault: true,
        sortOrder: 2,
      },
    }),
  ]);
  console.log(`已创建 ${pages.length} 个默认页面`);

  // ============================================
  // 6. 创建示例友链
  // ============================================
  const existingLink = await prisma.friendLink.findFirst({
    where: { name: "示例友链" },
  });
  if (!existingLink) {
    await prisma.friendLink.create({
      data: {
        name: "示例友链",
        url: "https://example.com",
        description: "这是一个示例友链",
        sortOrder: 1,
        isActive: true,
      },
    });
  }
  console.log("已创建示例友链");

  // ============================================
  // 7. 初始化站点配置（单例）
  // ============================================
  const existingSettings = await prisma.siteSettings.findFirst();
  if (!existingSettings) {
    await prisma.siteSettings.create({
      data: {
        siteName: "我的博客",
        siteDescription: "一个高度可自定义的博客模版",
        themeMode: "light",
      },
    });
  }
  console.log("已初始化站点配置");

  console.log("\n数据库播种完成!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("播种失败:", e);
    await prisma.$disconnect();
    process.exit(1);
  });