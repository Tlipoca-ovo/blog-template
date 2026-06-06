import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { unauthorized, notFound, conflict, badRequest } from "@/lib/api-error";
import { extractToken, verifyToken } from "@/lib/auth";
import { generateSlug, isValidColor } from "@/lib/slug";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) return NextResponse.json(notFound("标签不存在").toJSON(), { status: 404 });
    return NextResponse.json(successResponse(tag));
  } catch (error) {
    console.error("获取标签失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const token = extractToken(request as unknown as Request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json(unauthorized("认证失败").toJSON(), { status: 401 });
    }
    const { id } = await context.params;
    const body = await request.json();
    const { name, slug, color } = body;

    const existing = await prisma.tag.findUnique({ where: { id } });
    if (!existing) return NextResponse.json(notFound("标签不存在").toJSON(), { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (color !== undefined && color !== existing.color) {
      if (color && !isValidColor(color)) {
        return NextResponse.json(badRequest("颜色格式应为 #RRGGBB").toJSON(), { status: 400 });
      }
      updateData.color = color;
    }
    if (slug !== undefined && slug !== existing.slug) {
      const slugExists = await prisma.tag.findUnique({ where: { slug } });
      if (slugExists) return NextResponse.json(conflict("Slug 已存在").toJSON(), { status: 409 });
      updateData.slug = slug;
    }

    const tag = await prisma.tag.update({ where: { id }, data: updateData });
    return NextResponse.json(successResponse(tag));
  } catch (error) {
    console.error("更新标签失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const token = extractToken(request as unknown as Request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json(unauthorized("认证失败").toJSON(), { status: 401 });
    }
    const { id } = await context.params;

    const postCount = await prisma.postTag.count({ where: { tagId: id } });
    if (postCount > 0) {
      return NextResponse.json(
        conflict(`该标签下有 ${postCount} 篇文章，请先移除关联后再删除`).toJSON(),
        { status: 409 }
      );
    }

    const existing = await prisma.tag.findUnique({ where: { id } });
    if (!existing) return NextResponse.json(notFound("标签不存在").toJSON(), { status: 404 });
    await prisma.tag.delete({ where: { id } });
    return NextResponse.json(successResponse({ message: "标签已删除" }));
  } catch (error) {
    console.error("删除标签失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}