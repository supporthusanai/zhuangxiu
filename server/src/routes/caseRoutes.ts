import { Router } from 'express';
import {
  getCases,
  getCaseById,
  searchCases,
  createCase,
  updateCase,
  deleteCase,
  getHotCases,
} from '../controllers/caseController';
import { authenticate, optionalAuth, checkRole } from '../middleware/auth';
import { searchLimiter, createLimiter } from '../middleware/rateLimiter';

const router = Router();

// 公开接口
router.get('/', optionalAuth, getCases); // 获取案例列表
router.get('/hot', getHotCases); // 获取热门案例
router.get('/search', searchLimiter, searchCases); // 搜索案例（限流保护）
router.get('/:id', optionalAuth, getCaseById); // 获取案例详情

// 商家接口（需要认证和角色检查）
router.post('/', authenticate, checkRole('merchant', 'admin'), createLimiter, createCase); // 创建案例（限流保护）
router.put('/:id', authenticate, checkRole('merchant', 'admin'), updateCase); // 更新案例
router.delete('/:id', authenticate, checkRole('merchant', 'admin'), deleteCase); // 删除案例

export default router;
