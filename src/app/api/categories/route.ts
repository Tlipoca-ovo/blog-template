import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { badRequest, unauthorized, conflict } from "@/lib/api-error";
import { extractToken, verifyToken } from "@/lib/auth";
import { generateSlug } from "@/lib/slug";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(successResponse(categories));
  } catch (error) {
    console.error("获取分类列表失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request as unknown as Request);
    if (!token) {
      return NextResponse.json(unauthorized("未提供认证令牌").toJSON(), { status: 401 });
    }
    if (!verifyToken(token)) {
      return NextResponse.json(unauthorized("认证令牌无效").toJSON(), { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, sortOrder } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(badRequest("分类名称不能为空").toJSON(), { status: 400 });
    }

    const finalSlug = generateSlug(name, slug);

    const existing = await prisma.category.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return NextResponse.json(conflict("Slug 已存在").toJSON(), { status: 409 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        description: description || "",
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(successResponse(category));
  } catch (error) {
    console.error("创建分类失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}