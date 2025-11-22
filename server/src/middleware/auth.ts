import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { envConfig } from '../config/env';

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

// JWT 认证中间件
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 从请求头获取 token
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        message: '请先登录',
      });
      return;
    }

    // 验证 token
    const decoded = jwt.verify(token, envConfig.JWT_SECRET) as {
      userId: string;
    };

    // 查找用户
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: '用户不存在或已被禁用',
      });
      return;
    }

    // 将用户信息附加到请求对象
    req.user = user;
    req.userId = user._id.toString();

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '认证失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
};

// 角色检查中间件
export const checkRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: '未认证',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: '权限不足',
      });
      return;
    }

    next();
  };
};

// 可选认证中间件（用于公开但可增强的接口）
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, envConfig.JWT_SECRET) as {
        userId: string;
      };

      const user = await User.findById(decoded.userId);

      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id.toString();
      }
    }

    next();
  } catch (error) {
    // 认证失败时不阻止请求，继续执行
    next();
  }
};
