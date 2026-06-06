import { NextRequest, NextResponse } from "next/server";
import { extractToken, getAdminFromToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { unauthorized } from "@/lib/api-error";

/**
 * 获取当前登录管理员信息
 * GET /api/auth/me
 * 从请求头提取 token，验证并返回管理员信息
 */
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request as unknown as Request);

    if (!token) {
      return NextResponse.json(unauthorized("未提供认证令牌").toJSON(), { status: 401 });
    }

    const admin = await getAdminFromToken(token);

    if (!admin) {
      return NextResponse.json(unauthorized("认证令牌无效或用户不存在").toJSON(), { status: 401 });
    }

    return NextResponse.json(successResponse({ user: admin }));
  } catch (error) {
    console.error("获取用户信息失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}