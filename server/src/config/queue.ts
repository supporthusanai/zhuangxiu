import Bull, { Queue, Job } from 'bull';
import logger from './logger';

// Redis 连接配置
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
};

// ============ 队列定义 ============

// 邮件队列
export const emailQueue: Queue = new Bull('email', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3, // 失败后重试 3 次
    backoff: {
      type: 'exponential',
      delay: 2000, // 指数退避，初始延迟 2 秒
    },
    removeOnComplete: 100, // 只保留最近 100 个完成的任务
    removeOnFail: 50, // 只保留最近 50 个失败的任务
  },
});

// 通知队列（微信订阅消息、模板消息等）
export const notificationQueue: Queue = new Bull('notification', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

// 图片处理队列
export const imageQueue: Queue = new Bull('image', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 3000,
    },
    removeOnComplete: 50,
    removeOnFail: 20,
  },
});

// 数据同步队列
export const syncQueue: Queue = new Bull('sync', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 20,
    removeOnFail: 10,
  },
});

// ============ 任务数据类型 ============

export interface EmailJobData {
  to: string;
  subject: string;
  content: string;
  type?: 'text' | 'html';
}

export interface NotificationJobData {
  userId: string;
  type: 'subscribe_message' | 'template_message';
  templateId: string;
  data: Record<string, any>;
  page?: string;
}

export interface ImageJobData {
  imagePath: string;
  operations: {
    resize?: { width?: number; height?: number };
    compress?: { quality?: number };
    watermark?: { text?: string; imagePath?: string };
  };
  outputPath?: string;
}

export interface SyncJobData {
  type: 'user' | 'case' | 'order';
  action: 'create' | 'update' | 'delete';
  data: Record<string, any>;
}

// ============ 队列事件监听 ============

const setupQueueListeners = (queue: Queue, queueName: string) => {
  queue.on('completed', (job: Job) => {
    logger.info(`[${queueName}] 任务完成`, {
      jobId: job.id,
      data: job.data,
    });
  });

  queue.on('failed', (job: Job, err: Error) => {
    logger.error(`[${queueName}] 任务失败`, {
      jobId: job.id,
      data: job.data,
      error: err.message,
      stack: err.stack,
    });
  });

  queue.on('stalled', (job: Job) => {
    logger.warn(`[${queueName}] 任务停滞`, {
      jobId: job.id,
      data: job.data,
    });
  });

  queue.on('error', (error: Error) => {
    logger.error(`[${queueName}] 队列错误`, {
      error: error.message,
      stack: error.stack,
    });
  });
};

// 为所有队列设置监听器
setupQueueListeners(emailQueue, 'email');
setupQueueListeners(notificationQueue, 'notification');
setupQueueListeners(imageQueue, 'image');
setupQueueListeners(syncQueue, 'sync');

// ============ 便捷方法 ============

// 发送邮件
export const sendEmail = async (data: EmailJobData, options?: Bull.JobOptions) => {
  return emailQueue.add(data, options);
};

// 发送通知
export const sendNotification = async (data: NotificationJobData, options?: Bull.JobOptions) => {
  return notificationQueue.add(data, options);
};

// 处理图片
export const processImage = async (data: ImageJobData, options?: Bull.JobOptions) => {
  return imageQueue.add(data, options);
};

// 同步数据
export const syncData = async (data: SyncJobData, options?: Bull.JobOptions) => {
  return syncQueue.add(data, options);
};

// 获取队列状态
export const getQueueStats = async (queue: Queue) => {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
};

// 获取所有队列状态
export const getAllQueuesStats = async () => {
  const [emailStats, notificationStats, imageStats, syncStats] = await Promise.all([
    getQueueStats(emailQueue),
    getQueueStats(notificationQueue),
    getQueueStats(imageQueue),
    getQueueStats(syncQueue),
  ]);

  return {
    email: emailStats,
    notification: notificationStats,
    image: imageStats,
    sync: syncStats,
  };
};

// 清理队列
export const cleanQueue = async (queue: Queue, grace: number = 0) => {
  await queue.clean(grace, 'completed');
  await queue.clean(grace, 'failed');
  logger.info(`队列已清理: ${queue.name}`);
};

// 关闭所有队列
export const closeQueues = async () => {
  await Promise.all([
    emailQueue.close(),
    notificationQueue.close(),
    imageQueue.close(),
    syncQueue.close(),
  ]);
  logger.info('所有队列已关闭');
};

// 导出所有队列
export const queues = {
  email: emailQueue,
  notification: notificationQueue,
  image: imageQueue,
  sync: syncQueue,
};

export default queues;
