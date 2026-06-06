import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { badRequest, unauthorized, conflict } from "@/lib/api-error";
import { extractToken, verifyToken } from "@/lib/auth";
import { generateSlug } from "@/lib/slug";

export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(successResponse(pages));
  } catch (error) {
    console.error("获取页面列表失败:", error instanceof Error ? error.message : error);
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
    const { title, slug, content, isDefault, sortOrder } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json(badRequest("页面标题不能为空").toJSON(), { status: 400 });
    }

    const finalSlug = generateSlug(title, slug);

    const existing = await prisma.page.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return NextResponse.json(conflict("Slug 已存在").toJSON(), { status: 409 });
    }

    const page = await prisma.page.create({
      data: {
        title,
        slug: finalSlug,
        content: content || "",
        isDefault: isDefault || false,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(successResponse(page));
  } catch (error) {
    console.error("创建页面失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}