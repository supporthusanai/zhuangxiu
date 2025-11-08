import { emailQueue, notificationQueue, imageQueue, syncQueue } from '../config/queue';
import processEmail from './processors/emailProcessor';
import processNotification from './processors/notificationProcessor';
import processImage from './processors/imageProcessor';
import processSync from './processors/syncProcessor';
import logger from '../config/logger';

/**
 * 初始化所有队列处理器
 */
export const initQueueProcessors = () => {
  // 邮件队列处理器
  emailQueue.process(async (job) => {
    return processEmail(job);
  });

  // 通知队列处理器
  notificationQueue.process(async (job) => {
    return processNotification(job);
  });

  // 图片队列处理器（并发数设为 5）
  imageQueue.process(5, async (job) => {
    return processImage(job);
  });

  // 同步队列处理器
  syncQueue.process(async (job) => {
    return processSync(job);
  });

  logger.info('✅ 队列处理器已初始化');
};

export default initQueueProcessors;
