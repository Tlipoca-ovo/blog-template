import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { badRequest, unauthorized } from "@/lib/api-error";
import { extractToken, verifyToken } from "@/lib/auth";
import { isValidUrl } from "@/lib/slug";

export async function GET() {
  try {
    const links = await prisma.friendLink.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(successResponse(links));
  } catch (error) {
    console.error("获取友链列表失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request as unknown as Request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json(unauthorized("认证失败").toJSON(), { status: 401 });
    }

    const body = await request.json();
    const { name, url, description, logo, sortOrder, isActive } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(badRequest("友链名称不能为空").toJSON(), { status: 400 });
    }

    if (!url || typeof url !== "string") {
      return NextResponse.json(badRequest("友链 URL 不能为空").toJSON(), { status: 400 });
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(badRequest("请输入合法的 URL").toJSON(), { status: 400 });
    }

    const link = await prisma.friendLink.create({
      data: {
        name,
        url,
        description: description || "",
        logo: logo || "",
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(successResponse(link));
  } catch (error) {
    console.error("创建友链失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}