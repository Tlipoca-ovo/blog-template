import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { badRequest, unauthorized, conflict } from "@/lib/api-error";
import { extractToken, verifyToken } from "@/lib/auth";
import { generateSlug, isValidColor } from "@/lib/slug";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(successResponse(tags));
  } catch (error) {
    console.error("获取标签列表失败:", error instanceof Error ? error.message : error);
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
    const { name, slug, color } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(badRequest("标签名称不能为空").toJSON(), { status: 400 });
    }

    const finalSlug = generateSlug(name, slug);

    if (color && !isValidColor(color)) {
      return NextResponse.json(badRequest("颜色格式应为 #RRGGBB").toJSON(), { status: 400 });
    }

    const existing = await prisma.tag.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return NextResponse.json(conflict("Slug 已存在").toJSON(), { status: 409 });
    }

    const tag = await prisma.tag.create({
      data: { name, slug: finalSlug, color: color || "#3B82F6" },
    });

    return NextResponse.json(successResponse(tag));
  } catch (error) {
    console.error("创建标签失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}