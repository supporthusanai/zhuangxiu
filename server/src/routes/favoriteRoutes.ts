import { Router } from 'express';
import {
  addFavorite,
  removeFavorite,
  getMyFavorites,
  checkFavorite,
} from '../controllers/favoriteController';
import { authenticate } from '../middleware/auth';

const router = Router();

// 所有收藏接口都需要认证
router.use(authenticate);

// 收藏相关接口
router.get('/', getMyFavorites); // 获取我的收藏列表
router.post('/', addFavorite); // 添加收藏
router.delete('/:targetType/:targetId', removeFavorite); // 取消收藏
router.get('/check/:targetType/:targetId', checkFavorite); // 检查是否已收藏

export default router;
