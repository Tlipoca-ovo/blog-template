/**
 * 统一 API 响应格式
 */

// ============================================
// 类型定义
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// 响应工厂函数
// ============================================

/**
 * 成功响应
 */
export function successResponse<T>(data?: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
    timestamp: new Date().toISOString(),
  };
}

/**
 * 错误响应
 */
export function errorResponse(error: string): ApiResponse {
  return {
    success: false,
    error,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 分页响应
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number
): PaginatedResponse<T[]> {
  return {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * 消息响应（用于不需要返回数据的操作）
 */
export function messageResponse(message: string): ApiResponse {
  return {
    success: true,
    message,
    timestamp: new Date().toISOString(),
  };
}