import { Router } from 'express';
import {
  getRecommendedCases,
  getRecommendedDesigners,
  getSimilarCases,
} from '../controllers/recommendController';
import { authenticate } from '../middleware/auth';

const router = Router();

// 推荐接口需要认证
router.use(authenticate);

// 推荐相关接口
router.get('/cases', getRecommendedCases); // 获取推荐案例
router.get('/designers', getRecommendedDesigners); // 获取推荐设计师
router.get('/similar/:id', getSimilarCases); // 获取相似案例

export default router;
