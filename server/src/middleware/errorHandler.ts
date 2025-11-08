import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = '服务器内部错误';

  // 处理自定义错误
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // 处理 Mongoose 验证错误
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = '数据验证失败';
  }

  // 处理 Mongoose 重复键错误
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    statusCode = 400;
    message = '数据已存在';
  }

  // 处理 JWT 错误
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token 无效';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token 已过期';
  }

  // 记录错误日志
  logger.error('请求处理错误', {
    statusCode,
    message,
    url: req.originalUrl,
    method: req.method,
    error: err.message,
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack,
    }),
  });
};

// 404 处理
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `路由未找到 - ${req.originalUrl}`,
  });
};
