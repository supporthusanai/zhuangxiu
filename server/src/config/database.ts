import mongoose from 'mongoose';
import { createClient } from 'redis';
import logger from './logger';

// MongoDB 连接
export const connectMongoDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zhuangxiu';

    await mongoose.connect(mongoUri);

    logger.info('✅ MongoDB 连接成功');

    mongoose.connection.on('error', (error) => {
      logger.error('❌ MongoDB 连接错误', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB 连接断开');
    });
  } catch (error) {
    logger.error('❌ MongoDB 连接失败', error);
    process.exit(1);
  }
};

// Redis 连接
export const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  password: process.env.REDIS_PASSWORD || undefined,
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    logger.info('✅ Redis 连接成功');

    redisClient.on('error', (error) => {
      logger.error('❌ Redis 连接错误', error);
    });

    redisClient.on('disconnect', () => {
      logger.warn('⚠️  Redis 连接断开');
    });
  } catch (error) {
    logger.error('❌ Redis 连接失败', error);
    process.exit(1);
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
