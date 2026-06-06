import { prisma } from "./db";

/**
 * 获取配置值（从 Config 表中读取 key-value 配置）
 */
export async function getConfig(key: string, defaultValue: string = ""): Promise<string> {
  try {
    const config = await prisma.config.findUnique({
      where: { key },
    });
    return config?.value ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * 设置配置值（upsert 到 Config 表）
 */
export async function setConfig(key: string, value: string): Promise<void> {
  await prisma.config.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}