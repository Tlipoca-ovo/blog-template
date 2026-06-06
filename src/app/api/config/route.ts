import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractToken, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { badRequest, unauthorized } from "@/lib/api-error";

/**
 * GET /api/config - 获取配置值
 * Query: key (required)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(badRequest("key 参数不能为空").toJSON(), { status: 400 });
    }

    const config = await prisma.config.findUnique({ where: { key } });
    return NextResponse.json(successResponse({ key, value: config?.value ?? "" }));
  } catch (error) {
    console.error("获取配置失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}

/**
 * POST /api/config - 设置配置值
 * Body: { key, value }
 */
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request as unknown as Request);
    if (!token) {
      return NextResponse.json(unauthorized("未提供认证令牌").toJSON(), { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(unauthorized("认证令牌无效").toJSON(), { status: 401 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json(badRequest("key 参数不能为空").toJSON(), { status: 400 });
    }

    const config = await prisma.config.upsert({
      where: { key },
      update: { value: value ?? "" },
      create: { key, value: value ?? "" },
    });

    return NextResponse.json(successResponse({ key: config.key, value: config.value }));
  } catch (error) {
    console.error("设置配置失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}