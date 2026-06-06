import { prisma } from "./db";

export interface SiteConfig {
  siteName: string;
  siteUrl: string;
  siteLogo: string;
  siteFavicon: string;
  siteDescription: string;
  themeMode: "light" | "dark" | "auto";
  themeColors: Record<string, string>;
  fonts: Record<string, string>;
  layout: Record<string, unknown>;
  homepageModules: HomepageModule[];
  seoConfig: Record<string, unknown>;
  headCustom: string;
  footerCustom: string;
  customCSS: string;
  navConfig: NavItem[];
  commentConfig: Record<string, unknown>;
  socialLinks: SocialLink[];
}

export interface HomepageModule {
  name: string;
  label: string;
  enabled: boolean;
  sort: number;
}

export interface NavItem {
  label: string;
  url: string;
  icon?: string;
  newTab?: boolean;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

// 默认配置
const defaultConfig: SiteConfig = {
  siteName: "我的博客",
  siteUrl: "",
  siteLogo: "",
  siteFavicon: "",
  siteDescription: "",
  themeMode: "light",
  themeColors: {},
  fonts: {},
  layout: {},
  homepageModules: [],
  seoConfig: {},
  headCustom: "",
  footerCustom: "",
  customCSS: "",
  navConfig: [],
  commentConfig: {},
  socialLinks: [],
};

// 缓存配置
let cachedConfig: SiteConfig | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟缓存

/**
 * 获取站点配置（带缓存）
 */
export async function getSiteConfig(): Promise<SiteConfig> {
  const now = Date.now();

  // 缓存有效时直接返回
  if (cachedConfig && now - cacheTime < CACHE_TTL) {
    return cachedConfig;
  }

  try {
    const settings = await prisma.siteSettings.findFirst({
      orderBy: { updatedAt: "desc" },
    });

    if (!settings) {
      cachedConfig = defaultConfig;
      cacheTime = now;
      return defaultConfig;
    }

    cachedConfig = {
      siteName: settings.siteName,
      siteUrl: settings.siteUrl,
      siteLogo: settings.siteLogo,
      siteFavicon: settings.siteFavicon,
      siteDescription: settings.siteDescription,
      themeMode: (settings.themeMode as "light" | "dark" | "auto") || "light",
      themeColors: JSON.parse(settings.themeColors || "{}"),
      fonts: JSON.parse(settings.fonts || "{}"),
      layout: JSON.parse(settings.layout || "{}"),
      homepageModules: JSON.parse(settings.homepageModules || "[]"),
      seoConfig: JSON.parse(settings.seoConfig || "{}"),
      headCustom: settings.headCustom,
      footerCustom: settings.footerCustom,
      customCSS: settings.customCSS,
      navConfig: JSON.parse(settings.navConfig || "[]"),
      commentConfig: JSON.parse(settings.commentConfig || "{}"),
      socialLinks: JSON.parse(settings.socialLinks || "[]"),
    };
    cacheTime = now;
    return cachedConfig;
  } catch {
    cachedConfig = null;
    cacheTime = 0;
    return defaultConfig;
  }
}

/**
 * 更新站点配置（清除缓存）
 */
export async function updateSiteConfig(data: Partial<SiteConfig>): Promise<void> {
  const jsonFields = [
    "themeColors",
    "fonts",
    "layout",
    "homepageModules",
    "seoConfig",
    "navConfig",
    "commentConfig",
    "socialLinks",
  ];

  const updateData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (jsonFields.includes(key)) {
      // 如果已经是字符串（从 getSiteConfig 获取的），直接使用
      // 否则 stringify
      updateData[key] = typeof value === "string" ? value : JSON.stringify(value);
    } else {
      updateData[key] = value;
    }
  }

  // 查找已有记录
  const existing = await prisma.siteSettings.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  if (existing) {
    // 更新已有记录
    await prisma.siteSettings.update({
      where: { id: existing.id },
      data: updateData,
    });
  } else {
    // 创建新记录
    await prisma.siteSettings.create({
      data: updateData as never,
    });
  }

  // 清除缓存
  cachedConfig = null;
  cacheTime = 0;
}