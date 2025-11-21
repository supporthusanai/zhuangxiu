import { Router } from 'express';
import {
  wechatLogin,
  phoneLogin,
  sendVerifyCode,
  getCurrentUser,
  updateProfile,
  getWechatPhone,
  register,
  passwordLogin,
  changePassword,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter, smsLimiter } from '../middleware/rateLimit';

const router = Router();

// 微信登录
router.post('/wechat-login', authLimiter, wechatLogin);

// 发送短信验证码
router.post('/send-code', smsLimiter, sendVerifyCode);

// 手机号验证码登录
router.post('/phone-login', authLimiter, phoneLogin);

// 账号密码注册
router.post('/register', authLimiter, register);

// 账号密码登录
router.post('/login', authLimiter, passwordLogin);

// 获取当前用户信息（需要认证）
router.get('/me', authenticate, getCurrentUser);

// 更新用户资料（需要认证）
router.put('/profile', authenticate, updateProfile);

// 修改密码（需要认证）
router.put('/password', authenticate, changePassword);

// 获取微信手机号（需要认证）
router.post('/wechat-phone', authenticate, getWechatPhone);

export default router;
