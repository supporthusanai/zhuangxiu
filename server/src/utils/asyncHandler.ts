import { Request, Response, NextFunction } from 'express';

/**
 * 异步路由处理器包装器
 * 自动捕获异步函数中的错误并传递给错误处理中间件
 *
 * 使用方式：
 * router.get('/path', asyncHandler(async (req, res) => {
 *   const data = await someAsyncOperation();
 *   res.json({ success: true, data });
 * }));
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 标准成功响应
 */
export const successResponse = (
  res: Response,
  data: any,
  message: string = '操作成功',
  statusCode: number = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * 分页响应
 */
export const paginatedResponse = (
  res: Response,
  data: any[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  message: string = '查询成功'
) => {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: pagination.page,
      pageSize: pagination.limit,
      totalItems: pagination.total,
      totalPages: pagination.totalPages,
      hasNext: pagination.page < pagination.totalPages,
      hasPrev: pagination.page > 1,
    },
  });
};

/**
 * 错误响应（已弃用，使用 throw new AppError() 代替）
 */
export const errorResponse = (
  res: Response,
  message: string = '操作失败',
  statusCode: number = 500,
  error?: any
) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && error && {
      error: error.message || error,
      stack: error.stack,
    }),
  });
};
