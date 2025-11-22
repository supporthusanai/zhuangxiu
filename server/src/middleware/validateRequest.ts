import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import logger from '../config/logger';

/**
 * 验证请求中间件
 * 检查 express-validator 的验证结果，如果有错误则返回 400
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error: ValidationError) => {
      if (error.type === 'field') {
        return {
          field: error.path,
          message: error.msg,
          value: error.value,
        };
      }
      return {
        message: error.msg,
      };
    });

    // 记录验证失败日志
    logger.warn('Request validation failed', {
      correlationId: (req as any).correlationId,
      method: req.method,
      url: req.originalUrl,
      errors: errorMessages,
    });

    res.status(400).json({
      success: false,
      message: '请求参数验证失败',
      errors: errorMessages,
    });

    return;
  }

  next();
};
