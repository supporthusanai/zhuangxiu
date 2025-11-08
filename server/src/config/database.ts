import mongoose from 'mongoose';
import { createClient } from 'redis';

// MongoDB 连接
export const connectMongoDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zhuangxiu';

    await mongoose.connect(mongoUri);

    console.log('✅ MongoDB 连接成功');

    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB 连接错误:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB 连接断开');
    });
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error);
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
    console.log('✅ Redis 连接成功');

    redisClient.on('error', (error) => {
      console.error('❌ Redis 连接错误:', error);
    });

    redisClient.on('disconnect', () => {
      console.warn('⚠️  Redis 连接断开');
    });
  } catch (error) {
    console.error('❌ Redis 连接失败:', error);
    process.exit(1);
  }
};

// 关闭数据库连接
export const closeDatabases = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    await redisClient.quit();
    console.log('✅ 数据库连接已关闭');
  } catch (error) {
    console.error('❌ 关闭数据库连接失败:', error);
  }
};
