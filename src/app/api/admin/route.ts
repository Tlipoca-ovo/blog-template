import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { badRequest, unauthorized, notFound } from "@/lib/api-error";
import { extractToken, verifyToken, hashPassword } from "@/lib/auth";

/**
 * GET /api/admin - 获取当前管理员信息
 * 需要管理员认证
 */
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request as unknown as Request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json(unauthorized("认证失败").toJSON(), { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(unauthorized("认证令牌无效").toJSON(), { status: 401 });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        nickname: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      return NextResponse.json(notFound("管理员不存在").toJSON(), { status: 404 });
    }

    return NextResponse.json(successResponse(admin));
  } catch (error) {
    console.error("获取管理员信息失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}

/**
 * PUT /api/admin - 更新当前管理员信息
 * 需要管理员认证
 */
export async function PUT(request: NextRequest) {
  try {
    const token = extractToken(request as unknown as Request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json(unauthorized("认证失败").toJSON(), { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(unauthorized("认证令牌无效").toJSON(), { status: 401 });
    }

    const body = await request.json();
    const { nickname, avatar, password } = body;

    const updateData: Record<string, unknown> = {};

    // 更新昵称
    if (nickname !== undefined) {
      if (typeof nickname !== "string" || nickname.length === 0) {
        return NextResponse.json(badRequest("昵称不能为空").toJSON(), { status: 400 });
      }
      if (nickname.length > 50) {
        return NextResponse.json(badRequest("昵称长度不能超过 50 个字符").toJSON(), { status: 400 });
      }
      updateData.nickname = nickname;
    }

    // 更新头像
    if (avatar !== undefined) {
      updateData.avatar = avatar || "";
    }

    // 更新密码
    if (password !== undefined) {
      if (typeof password !== "string" || password.length < 6) {
        return NextResponse.json(badRequest("密码长度不能少于 6 个字符").toJSON(), { status: 400 });
      }
      if (password.length > 128) {
        return NextResponse.json(badRequest("密码长度不能超过 128 个字符").toJSON(), { status: 400 });
      }
      updateData.password = await hashPassword(password);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(badRequest("没有要更新的字段").toJSON(), { status: 400 });
    }

    const admin = await prisma.adminUser.update({
      where: { id: payload.userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        nickname: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(successResponse(admin));
  } catch (error) {
    console.error("更新管理员信息失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}