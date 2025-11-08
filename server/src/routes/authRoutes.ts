import { Router } from 'express';
import {
  wechatLogin,
  phoneLogin,
  getCurrentUser,
  updateProfile,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// 微信登录
router.post('/wechat-login', wechatLogin);

// 手机号登录
router.post('/phone-login', phoneLogin);

// 获取当前用户信息（需要认证）
router.get('/me', authenticate, getCurrentUser);

// 更新用户资料（需要认证）
router.put('/profile', authenticate, updateProfile);

export default router;
