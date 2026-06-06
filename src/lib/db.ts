import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

// 创建 libsql 适配器，支持本地开发和生产环境
function createPrismaClient() {
  // 如果存在 DATABASE_URL 环境变量（生产环境/D1），使用它
  // 否则使用本地文件路径（本地开发）
  const databaseUrl = process.env.DATABASE_URL || "file:dev.db";

  // 对于 D1 URL (libsql://...) 使用 authToken
  // 对于本地文件路径不需要 authToken
  const authToken = databaseUrl.startsWith("libsql://")
    ? process.env.DATABASE_AUTH_TOKEN
    : undefined;

  const client = createClient({
    url: databaseUrl,
    authToken: authToken,
  });

  const adapter = new PrismaLibSQL(client);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 在开发环境中使用全局变量防止热重载时重复创建连接
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}