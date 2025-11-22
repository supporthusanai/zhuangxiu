import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger';

/**
 * 请求追踪 ID 中间件
 * 为每个请求生成唯一的 correlation-id 用于日志追踪
 */
export const correlationId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 从请求头获取或生成新的 correlation-id
  const id = (req.headers['x-correlation-id'] as string) || uuidv4();

  // 将 ID 附加到请求对象
  (req as any).correlationId = id;

  // 在响应头中返回 correlation-id
  res.setHeader('X-Correlation-ID', id);

  next();
};

/**
 * API 响应时间监控中间件
 * 记录每个请求的响应时间并添加到响应头
 */
export const responseTime = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  // 监听响应完成事件
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const correlationId = (req as any).correlationId || 'unknown';

    // 添加响应时间头
    res.setHeader('X-Response-Time', `${duration}ms`);

    // 记录慢请求（超过 1 秒）
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        correlationId,
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
      });
    }

    // 记录所有请求的响应时间（debug 级别）
    logger.debug('Request completed', {
      correlationId,
      method: req.method,
      url: req.originalUrl,
      duration: `${duration}ms`,
      statusCode: res.statusCode,
    });
  });

  next();
};

/**
 * 请求日志增强中间件
 * 在日志中包含 correlation-id
 */
export const enhancedLogging = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const correlationId = (req as any).correlationId || 'unknown';

  // 记录请求开始
  logger.info('Incoming request', {
    correlationId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  next();
};
