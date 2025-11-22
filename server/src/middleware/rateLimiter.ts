import rateLimit from 'express-rate-limit';
import logger from '../config/logger';

/**
 * 通用 API 限流器
 * 每个 IP 15分钟内最多 100 个请求
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 最多 100 个请求
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试',
  },
  standardHeaders: true, // 返回 `RateLimit-*` 标准头
  legacyHeaders: false, // 禁用 `X-RateLimit-*` 旧头
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: '请求过于频繁，请稍后再试',
    });
  },
});

/**
 * 认证接口限流器（更严格）
 * 每个 IP 15分钟内最多 5 次登录尝试
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 5, // 最多 5 次登录尝试
  skipSuccessfulRequests: true, // 成功的请求不计入
  message: {
    success: false,
    message: '登录尝试次数过多，请 15 分钟后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}, path: ${req.path}`);
    res.status(429).json({
      success: false,
      message: '登录尝试次数过多，请 15 分钟后再试',
    });
  },
});

/**
 * 创建内容限流器（防止垃圾内容）
 * 每个用户每小时最多创建 10 个资源
 */
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小时
  max: 10, // 最多 10 次创建
  message: {
    success: false,
    message: '创建内容过于频繁，请稍后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // 使用用户 ID 作为键（如果已认证）
    return (req as any).userId || req.ip;
  },
  handler: (req, res) => {
    logger.warn(`Create rate limit exceeded for user/IP: ${(req as any).userId || req.ip}`);
    res.status(429).json({
      success: false,
      message: '创建内容过于频繁，请稍后再试',
    });
  },
});

/**
 * 文件上传限流器
 * 每个用户每小时最多上传 20 次
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小时
  max: 20, // 最多 20 次上传
  message: {
    success: false,
    message: '上传过于频繁，请稍后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return (req as any).userId || req.ip;
  },
  handler: (req, res) => {
    logger.warn(`Upload rate limit exceeded for user/IP: ${(req as any).userId || req.ip}`);
    res.status(429).json({
      success: false,
      message: '上传过于频繁，请稍后再试',
    });
  },
});

/**
 * 搜索限流器
 * 每个 IP 每分钟最多 10 次搜索
 */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 10, // 最多 10 次搜索
  message: {
    success: false,
    message: '搜索过于频繁，请稍后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Search rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: '搜索过于频繁，请稍后再试',
    });
  },
});

/**
 * 验证码限流器（短信、邮件等）
 * 每个手机号每小时最多 3 次
 */
export const verificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小时
  max: 3, // 最多 3 次
  message: {
    success: false,
    message: '验证码发送过于频繁，请稍后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // 使用手机号作为键
    return req.body.phone || req.ip;
  },
  handler: (req, res) => {
    logger.warn(`Verification rate limit exceeded for phone/IP: ${req.body.phone || req.ip}`);
    res.status(429).json({
      success: false,
      message: '验证码发送过于频繁，请 1 小时后再试',
    });
  },
});
