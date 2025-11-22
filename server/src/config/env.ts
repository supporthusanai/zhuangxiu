import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';
import logger from './logger';

// 加载环境变量
dotenv.config();

/**
 * 环境变量配置接口
 */
export interface EnvConfig {
  // 服务器配置
  PORT: number;
  NODE_ENV: string;

  // MongoDB 配置
  MONGODB_URI: string;
  MONGODB_USER?: string;
  MONGODB_PASSWORD?: string;

  // Redis 配置
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;

  // JWT 配置
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;

  // 文件上传配置
  UPLOAD_DIR: string;
  MAX_FILE_SIZE: number;

  // 微信小程序配置
  WECHAT_APP_ID: string;
  WECHAT_APP_SECRET: string;

  // CORS 配置
  ALLOWED_ORIGINS: string[];

  // 日志配置
  LOG_DIR: string;
}

/**
 * 必需的环境变量列表
 */
const REQUIRED_ENV_VARS = [
  'JWT_SECRET',
  'WECHAT_APP_ID',
  'WECHAT_APP_SECRET',
];

/**
 * 验证环境变量
 */
const validateEnv = (): void => {
  const missing: string[] = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    const errorMessage = `
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   ❌ 环境变量配置错误                                      ║
║                                                            ║
║   缺少必需的环境变量:                                      ║
${missing.map(v => `║   - ${v}`.padEnd(61) + '║').join('\n')}
║                                                            ║
║   请检查以下文件:                                          ║
║   1. 复制 .env.example 为 .env                             ║
║   2. 填写所有必需的配置项                                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `;
    console.error(errorMessage);
    process.exit(1);
  }

  // 验证 JWT_SECRET 强度
  const jwtSecret = process.env.JWT_SECRET!;
  if (jwtSecret.length < 32) {
    logger.warn('⚠️  JWT_SECRET 长度过短，建议至少 32 个字符');
  }

  if (jwtSecret === 'your-secret-key-here' || jwtSecret === 'secret') {
    const errorMessage = `
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   ❌ JWT_SECRET 配置不安全                                 ║
║                                                            ║
║   请勿使用默认值，这会导致严重的安全风险！                 ║
║                                                            ║
║   建议使用以下命令生成安全的密钥:                          ║
║   node -e "console.log(require('crypto')                   ║
║     .randomBytes(64).toString('hex'))"                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `;
    console.error(errorMessage);
    process.exit(1);
  }

  // 检查 .env 文件是否存在
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath) && process.env.NODE_ENV !== 'production') {
    logger.warn(`⚠️  未找到 .env 文件: ${envPath}`);
    logger.warn('⚠️  建议复制 .env.example 为 .env 并填写配置');
  }
};

/**
 * 获取环境配置
 */
export const getEnvConfig = (): EnvConfig => {
  // 先验证环境变量
  validateEnv();

  return {
    // 服务器配置
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',

    // MongoDB 配置
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/zhuangxiu',
    MONGODB_USER: process.env.MONGODB_USER,
    MONGODB_PASSWORD: process.env.MONGODB_PASSWORD,

    // Redis 配置
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,

    // JWT 配置（已验证存在）
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

    // 文件上传配置
    UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),

    // 微信小程序配置（已验证存在）
    WECHAT_APP_ID: process.env.WECHAT_APP_ID!,
    WECHAT_APP_SECRET: process.env.WECHAT_APP_SECRET!,

    // CORS 配置
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],

    // 日志配置
    LOG_DIR: process.env.LOG_DIR || 'logs',
  };
};

// 导出配置实例
export const envConfig = getEnvConfig();

// 开发环境打印配置（隐藏敏感信息）
if (process.env.NODE_ENV === 'development') {
  logger.info('📋 环境配置加载成功');
  logger.debug('配置详情（部分）:', {
    NODE_ENV: envConfig.NODE_ENV,
    PORT: envConfig.PORT,
    MONGODB_URI: envConfig.MONGODB_URI.replace(/\/\/.*@/, '//***@'), // 隐藏密码
    REDIS_HOST: envConfig.REDIS_HOST,
    JWT_SECRET: '***' + envConfig.JWT_SECRET.slice(-4), // 只显示后4位
    WECHAT_APP_ID: envConfig.WECHAT_APP_ID,
    UPLOAD_DIR: envConfig.UPLOAD_DIR,
  });
}
