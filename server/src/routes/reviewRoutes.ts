import { Router } from 'express';
import {
  createReview,
  getReviews,
  getMyReviews,
  replyReview,
  likeReview,
  deleteReview,
} from '../controllers/reviewController';
import { authenticate, requireMerchant } from '../middleware/auth';

const router = Router();

// 获取目标的评价列表（公开）
router.get('/:targetType/:targetId', getReviews);

// 需要登录的路由
router.use(authenticate);

// 创建评价
router.post('/', createReview);

// 获取我的评价
router.get('/my/list', getMyReviews);

// 点赞评价
router.post('/:id/like', likeReview);

// 删除评价
router.delete('/:id', deleteReview);

// 商家回复评价
router.post('/:id/reply', requireMerchant, replyReview);

export default router;
