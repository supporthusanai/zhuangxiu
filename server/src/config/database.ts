import mongoose from 'mongoose';
import { createClient } from 'redis';
import logger from './logger';
import { envConfig } from './env';

// MongoDB 连接配置
const MONGO_OPTIONS = {
  // 连接池配置
  maxPoolSize: 10, // 最大连接数
  minPoolSize: 2, // 最小连接数

  // 超时配置
  serverSelectionTimeoutMS: 5000, // 服务器选择超时
  socketTimeoutMS: 45000, // Socket 超时

  // 心跳检测
  heartbeatFrequencyMS: 10000, // 心跳频率

  // 自动重连
  retryWrites: true,
  retryReads: true,
};

// MongoDB 重连逻辑
let mongoReconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000; // 5秒

const handleMongoReconnect = async (): Promise<void> => {
  if (mongoReconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    logger.error(`❌ MongoDB 重连失败，已尝试 ${MAX_RECONNECT_ATTEMPTS} 次`);
    process.exit(1);
  }

  mongoReconnectAttempts++;
  logger.warn(`⚠️  MongoDB 尝试重连 (${mongoReconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);

  setTimeout(async () => {
    try {
      await mongoose.connect(envConfig.MONGODB_URI, MONGO_OPTIONS);
      logger.info('✅ MongoDB 重连成功');
      mongoReconnectAttempts = 0; // 重置重连计数
    } catch (error) {
      logger.error('❌ MongoDB 重连失败', error);
      await handleMongoReconnect();
    }
  }, RECONNECT_INTERVAL);
};

// MongoDB 连接
export const connectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.connect(envConfig.MONGODB_URI, MONGO_OPTIONS);

    logger.info('✅ MongoDB 连接成功');
    logger.debug(`MongoDB 连接池配置: maxPoolSize=${MONGO_OPTIONS.maxPoolSize}, minPoolSize=${MONGO_OPTIONS.minPoolSize}`);

    // 连接成功事件
    mongoose.connection.on('connected', () => {
      logger.info('✅ MongoDB 已连接');
      mongoReconnectAttempts = 0; // 重置重连计数
    });

    // 连接错误事件
    mongoose.connection.on('error', (error) => {
      logger.error('❌ MongoDB 连接错误', error);
    });

    // 断开连接事件
    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB 连接断开');
      // 自动重连
      if (mongoose.connection.readyState === 0) {
        handleMongoReconnect();
      }
    });

    // 重连事件
    mongoose.connection.on('reconnected', () => {
      logger.info('✅ MongoDB 已重连');
    });

  } catch (error) {
    logger.error('❌ MongoDB 初始连接失败', error);
    // 启动重连逻辑
    await handleMongoReconnect();
  }
};

// Redis 重连逻辑
let redisReconnectAttempts = 0;
const REDIS_MAX_RECONNECT_ATTEMPTS = 5;
const REDIS_RECONNECT_INTERVAL = 5000; // 5秒

// Redis 连接
export const redisClient = createClient({
  socket: {
    host: envConfig.REDIS_HOST,
    port: envConfig.REDIS_PORT,
    reconnectStrategy: (retries) => {
      // 自定义重连策略
      if (retries > REDIS_MAX_RECONNECT_ATTEMPTS) {
        logger.error(`❌ Redis 重连失败，已尝试 ${REDIS_MAX_RECONNECT_ATTEMPTS} 次`);
        return new Error('Redis 重连次数过多');
      }

      const delay = Math.min(retries * 1000, REDIS_RECONNECT_INTERVAL);
      logger.warn(`⚠️  Redis 尝试重连 (${retries}/${REDIS_MAX_RECONNECT_ATTEMPTS})，${delay}ms 后重试...`);
      return delay;
    },
  },
  password: envConfig.REDIS_PASSWORD || undefined,
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    logger.info('✅ Redis 连接成功');
    logger.debug(`Redis 配置: ${envConfig.REDIS_HOST}:${envConfig.REDIS_PORT}`);

    // 连接事件
    redisClient.on('connect', () => {
      logger.info('✅ Redis 已连接');
      redisReconnectAttempts = 0; // 重置重连计数
    });

    // 准备就绪事件
    redisClient.on('ready', () => {
      logger.info('✅ Redis 准备就绪');
    });

    // 错误事件
    redisClient.on('error', (error) => {
      logger.error('❌ Redis 连接错误', error);
      redisReconnectAttempts++;
    });

    // 重连事件
    redisClient.on('reconnecting', () => {
      logger.warn('⚠️  Redis 正在重连...');
    });

    // 断开连接事件
    redisClient.on('end', () => {
      logger.warn('⚠️  Redis 连接已关闭');
    });

  } catch (error) {
    logger.error('❌ Redis 初始连接失败', error);
    // Redis 会自动重连，不需要立即退出
    logger.warn('⚠️  Redis 将自动尝试重连');
  }
};

// 关闭数据库连接
export const closeDatabases = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    await redisClient.quit();
    logger.info('✅ 数据库连接已关闭');
  } catch (error) {
    logger.error('❌ 关闭数据库连接失败', error);
  }
};
