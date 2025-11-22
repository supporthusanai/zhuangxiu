import { redisClient } from '../config/database';
import logger from '../config/logger';

// 验证码配置
const SMS_CODE_EXPIRE = 300; // 5分钟过期
const SMS_CODE_LENGTH = 6;
const SMS_RATE_LIMIT = 60; // 60秒内只能发送一次

// 生成随机验证码
const generateCode = (): string => {
  let code = '';
  for (let i = 0; i < SMS_CODE_LENGTH; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
};

// 验证手机号格式
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// 发送验证码
export const sendSmsCode = async (phone: string): Promise<{ success: boolean; message: string }> => {
  try {
    // 验证手机号格式
    if (!validatePhone(phone)) {
      return { success: false, message: '手机号格式不正确' };
    }

    // 检查发送频率限制
    const rateLimitKey = `sms:rate:${phone}`;
    const isLimited = await redisClient.get(rateLimitKey);
    if (isLimited) {
      const ttl = await redisClient.ttl(rateLimitKey);
      return { success: false, message: `请${ttl}秒后再试` };
    }

    // 生成验证码
    const code = generateCode();
    const codeKey = `sms:code:${phone}`;

    // 存储验证码到 Redis
    await redisClient.setEx(codeKey, SMS_CODE_EXPIRE, code);

    // 设置发送频率限制
    await redisClient.setEx(rateLimitKey, SMS_RATE_LIMIT, '1');

    // TODO: 接入真实短信服务商 (阿里云、腾讯云等)
    // 开发环境下直接打印验证码
    if (process.env.NODE_ENV === 'development') {
      logger.info(`[SMS] 验证码已发送到 ${phone}: ${code}`);
    } else {
      // 生产环境调用短信 API
      // await sendSmsViaProvider(phone, code);
      logger.info(`[SMS] 验证码已发送到 ${phone}`);
    }

    return { success: true, message: '验证码已发送' };
  } catch (error) {
    logger.error('发送验证码失败', { phone, error });
    return { success: false, message: '发送验证码失败，请稍后重试' };
  }
};

// 验证验证码
export const verifySmsCode = async (phone: string, code: string): Promise<boolean> => {
  try {
    if (!validatePhone(phone) || !code) {
      return false;
    }

    const codeKey = `sms:code:${phone}`;
    const storedCode = await redisClient.get(codeKey);

    if (!storedCode) {
      return false;
    }

    // 验证成功后删除验证码（一次性使用）
    if (storedCode === code) {
      await redisClient.del(codeKey);
      return true;
    }

    return false;
  } catch (error) {
    logger.error('验证验证码失败', { phone, error });
    return false;
  }
};

// 获取验证码（仅开发环境，用于调试）
export const getDebugCode = async (phone: string): Promise<string | null> => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  const codeKey = `sms:code:${phone}`;
  return redisClient.get(codeKey);
};
