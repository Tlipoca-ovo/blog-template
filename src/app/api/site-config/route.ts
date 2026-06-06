import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { unauthorized, notFound } from "@/lib/api-error";
import { extractToken, verifyToken } from "@/lib/auth";

/**
 * GET /api/site-config - 获取站点配置
 * 公开接口，无需认证
 */
export async function GET() {
  try {
    const config = await prisma.siteSettings.findFirst();
    if (!config) {
      return NextResponse.json(notFound("站点配置不存在").toJSON(), { status: 404 });
    }
    return NextResponse.json(successResponse(config));
  } catch (error) {
    console.error("获取站点配置失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}

/**
 * PUT /api/site-config - 更新站点配置
 * 需要管理员认证
 */
export async function PUT(request: NextRequest) {
  try {
    const token = extractToken(request as unknown as Request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json(unauthorized("认证失败").toJSON(), { status: 401 });
    }

    const body = await request.json();

    // 解析可能包含 JSON 字符串的字段
    const jsonFields = [
      "themeColors", "fonts", "layout", "homepageModules",
      "seoConfig", "navConfig", "commentConfig", "socialLinks"
    ];

    const data: Record<string, unknown> = {};

    // 处理普通字符串字段
    const stringFields = [
      "siteName", "siteUrl", "siteLogo", "siteFavicon",
      "siteDescription", "themeMode", "headCustom", "footerCustom", "customCSS"
    ];

    for (const field of stringFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    // 处理 JSON 字段
    for (const field of jsonFields) {
      if (body[field] !== undefined) {
        if (typeof body[field] === "string") {
          // 验证 JSON 格式是否有效
          try {
            JSON.parse(body[field]);
            data[field] = body[field];
          } catch {
            // 如果不是有效 JSON，尝试作为字符串保存
            data[field] = body[field];
          }
        } else if (typeof body[field] === "object" && body[field] !== null) {
          // 如果是对象，序列化为 JSON 字符串
          data[field] = JSON.stringify(body[field]);
        } else {
          data[field] = body[field];
        }
      }
    }

    // 使用 upsert 确保只有一条配置记录
    const existing = await prisma.siteSettings.findFirst();
    if (existing) {
      const config = await prisma.siteSettings.update({
        where: { id: existing.id },
        data,
      });
      return NextResponse.json(successResponse(config));
    } else {
      const config = await prisma.siteSettings.create({
        data: {
          ...data,
          siteName: data.siteName as string || "我的博客",
          siteUrl: data.siteUrl as string || "",
        },
      });
      return NextResponse.json(successResponse(config));
    }
  } catch (error) {
    console.error("更新站点配置失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}