import jwt, { SignOptions } from 'jsonwebtoken';
import logger from '../config/logger';

// 默认开发环境密钥
const DEV_SECRET = 'dev-secret-key-zhuangxiu-2024';

/**
 * 获取 JWT 密钥（统一的密钥获取函数）
 * 生产环境必须配置 JWT_SECRET
 */
export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret === 'secret') {
    if (process.env.NODE_ENV === 'production') {
      logger.error('JWT_SECRET 未配置或使用了默认值，生产环境不允许启动！');
      throw new Error('JWT_SECRET must be configured in production');
    }
    logger.warn('警告：JWT_SECRET 使用了默认值，仅限开发环境使用！');
    return DEV_SECRET;
  }

  return secret;
};

/**
 * 生成 JWT Token
 */
export const generateToken = (userId: string): string => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    { userId },
    getJwtSecret(),
    { expiresIn } as SignOptions
  );
};

/**
 * 验证 JWT Token
 */
export const verifyToken = (token: string): { userId: string } => {
  return jwt.verify(token, getJwtSecret()) as { userId: string };
};

export default {
  getJwtSecret,
  generateToken,
  verifyToken,
};
