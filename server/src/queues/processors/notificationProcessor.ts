import { Job } from 'bull';
import { NotificationJobData } from '../../config/queue';
import { sendSubscribeMessage } from '../../utils/wechat';
import logger from '../../config/logger';
import User from '../../models/User';

/**
 * 通知处理器
 *
 * 处理微信订阅消息、模板消息等通知任务
 */
export const processNotification = async (job: Job<NotificationJobData>) => {
  const { userId, type, templateId, data, page } = job.data;

  logger.info('处理通知任务', {
    jobId: job.id,
    userId,
    type,
    templateId,
  });

  try {
    // 获取用户信息
    const user = await User.findById(userId);

    if (!user || !user.openid) {
      throw new Error('用户不存在或未绑定微信');
    }

    if (type === 'subscribe_message') {
      // 发送订阅消息
      const result = await sendSubscribeMessage(user.openid, templateId, data, page);

      logger.info('订阅消息发送成功', {
        jobId: job.id,
        userId,
        openid: user.openid,
        templateId,
        result,
      });

      return { success: true, userId, type, result };
    } else if (type === 'template_message') {
      // TODO: 发送模板消息（如果需要）
      // 模板消息已被订阅消息替代，这里保留接口以备扩展

      logger.info('模板消息发送（待实现）', {
        jobId: job.id,
        userId,
        templateId,
      });

      return { success: true, userId, type, message: '待实现' };
    } else {
      throw new Error(`不支持的通知类型: ${type}`);
    }
  } catch (error) {
    logger.error('通知发送失败', {
      jobId: job.id,
      userId,
      type,
      error,
    });
    throw error;
  }
};

export default processNotification;
