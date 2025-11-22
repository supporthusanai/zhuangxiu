import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { redisClient } from '../config/database';
import logger from '../config/logger';

/**
 * 健康检查端点
 * 返回服务和依赖项的健康状态
 */
export const healthCheck = async (
  req: Request,
  res: Response
): Promise<void> => {
  const startTime = Date.now();

  try {
    // 检查 MongoDB 连接状态
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const mongoHealth = mongoStatus === 'connected';

    // 检查 Redis 连接状态
    let redisStatus = 'unknown';
    let redisHealth = false;

    try {
      if (redisClient.isOpen) {
        await redisClient.ping();
        redisStatus = 'connected';
        redisHealth = true;
      } else {
        redisStatus = 'disconnected';
      }
    } catch (error) {
      redisStatus = 'error';
      logger.error('Redis health check failed', error);
    }

    // 计算响应时间
    const responseTime = Date.now() - startTime;

    // 整体健康状态
    const isHealthy = mongoHealth && redisHealth;
    const status = isHealthy ? 'healthy' : 'unhealthy';

    // 构建响应
    const healthStatus = {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      services: {
        mongodb: {
          status: mongoStatus,
          healthy: mongoHealth,
        },
        redis: {
          status: redisStatus,
          healthy: redisHealth,
        },
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: {
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
          external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB',
        },
        cpu: process.cpuUsage(),
      },
    };

    // 如果不健康，返回 503
    const statusCode = isHealthy ? 200 : 503;

    res.status(statusCode).json(healthStatus);

  } catch (error) {
    logger.error('Health check failed', error);

    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * 简单的 ping 端点
 * 快速检查服务是否运行
 */
export const ping = (req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'pong',
  });
};

/**
 * 就绪检查端点（用于 Kubernetes）
 * 检查服务是否准备好接收流量
 */
export const readiness = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // 检查关键依赖
    const mongoReady = mongoose.connection.readyState === 1;

    let redisReady = false;
    try {
      redisReady = redisClient.isOpen;
    } catch (error) {
      // Redis 检查失败
    }

    const isReady = mongoReady && redisReady;

    if (isReady) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        details: {
          mongodb: mongoReady ? 'ready' : 'not ready',
          redis: redisReady ? 'ready' : 'not ready',
        },
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * 存活检查端点（用于 Kubernetes）
 * 检查服务进程是否存活
 */
export const liveness = (req: Request, res: Response): void => {
  // 简单返回 200，表示进程存活
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
};
