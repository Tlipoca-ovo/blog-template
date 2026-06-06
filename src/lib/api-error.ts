/**
 * API 错误处理
 */

// ============================================
// 错误类型枚举
// ============================================

export enum ApiErrorCode {
  BAD_REQUEST = "BAD_REQUEST",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  METHOD_NOT_ALLOWED = "METHOD_NOT_ALLOWED",
  CONFLICT = "CONFLICT",
  UNPROCESSABLE_ENTITY = "UNPROCESSABLE_ENTITY",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}

// ============================================
// 自定义错误类
// ============================================

export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: ApiErrorCode,
    message: string,
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: this.message,
      code: this.code,
      ...(this.details && { details: this.details }),
      timestamp: new Date().toISOString(),
    };
  }
}

// ============================================
// 快捷错误构造器
// ============================================

export const badRequest = (message: string, details?: Record<string, unknown>) =>
  new ApiError(ApiErrorCode.BAD_REQUEST, message, 400, details);

export const unauthorized = (message: string = "未授权") =>
  new ApiError(ApiErrorCode.UNAUTHORIZED, message, 401);

export const forbidden = (message: string = "禁止访问") =>
  new ApiError(ApiErrorCode.FORBIDDEN, message, 403);

export const notFound = (message: string = "资源不存在") =>
  new ApiError(ApiErrorCode.NOT_FOUND, message, 404);

export const methodNotAllowed = (message: string = "不允许的请求方法") =>
  new ApiError(ApiErrorCode.METHOD_NOT_ALLOWED, message, 405);

export const conflict = (message: string, details?: Record<string, unknown>) =>
  new ApiError(ApiErrorCode.CONFLICT, message, 409, details);

export const unprocessableEntity = (message: string, details?: Record<string, unknown>) =>
  new ApiError(ApiErrorCode.UNPROCESSABLE_ENTITY, message, 422, details);

export const internalError = (message: string = "服务器内部错误") =>
  new ApiError(ApiErrorCode.INTERNAL_ERROR, message, 500);

export const serviceUnavailable = (message: string = "服务不可用") =>
  new ApiError(ApiErrorCode.SERVICE_UNAVAILABLE, message, 503);

// ============================================
// 错误处理工具
// ============================================

/**
 * 处理 API 错误，返回统一的错误响应
 */
export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return error.toJSON();
  }

  if (error instanceof Error) {
    console.error("未预期的错误:", error.message);
    return internalError("服务器内部错误").toJSON();
  }

  console.error("未知错误:", error);
  return internalError("服务器内部错误").toJSON();
}

/**
 * 异步错误处理包装器
 */
export function asyncHandler<T>(
  handler: (req: NextRequest) => Promise<T>
): (req: NextRequest) => Promise<Response> {
  return async (req: NextRequest) => {
    try {
      const result = await handler(req);
      return NextResponse.json(successResponse(result));
    } catch (error) {
      return NextResponse.json(handleApiError(error), { status: (error as ApiError).statusCode || 500 });
    }
  };
}

// ============================================
// 响应工具
// ============================================

function successResponse<T>(data: T) {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

import { NextRequest } from "next/server";
import { NextResponse } from "next/server";