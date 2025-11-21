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

// 需要登录的路由（放在公开路由之前，避免路由冲突）
router.post('/', authenticate, createReview);
router.get('/my/list', authenticate, getMyReviews);
router.post('/:id/like', authenticate, likeReview);
router.delete('/:id', authenticate, deleteReview);
router.post('/:id/reply', authenticate, requireMerchant, replyReview);

// 获取目标的评价列表（公开，放在最后）
router.get('/:targetType/:targetId', getReviews);

export default router;
