import rateLimit from 'express-rate-limit';

// 通用速率限制配置
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100个请求
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 认证相关接口的速率限制（更严格）
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 10, // 每个IP最多10次登录尝试
  message: {
    success: false,
    message: '登录尝试次数过多，请1小时后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 上传接口的速率限制
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 50, // 每个IP最多50次上传
  message: {
    success: false,
    message: '上传次数过多，请稍后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 搜索接口的速率限制
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 30, // 每个IP每分钟最多30次搜索
  message: {
    success: false,
    message: '搜索过于频繁，请稍后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API 速率限制（整体）
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 60, // 每个IP每分钟最多60个请求
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
