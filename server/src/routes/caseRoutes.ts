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

const router = Router();

// 公开接口
router.get('/', optionalAuth, getCases); // 获取案例列表
router.get('/hot', getHotCases); // 获取热门案例
router.get('/search', searchCases); // 搜索案例
router.get('/:id', optionalAuth, getCaseById); // 获取案例详情

// 商家接口（需要认证和角色检查）
router.post('/', authenticate, checkRole('merchant', 'admin'), createCase); // 创建案例
router.put('/:id', authenticate, checkRole('merchant', 'admin'), updateCase); // 更新案例
router.delete('/:id', authenticate, checkRole('merchant', 'admin'), deleteCase); // 删除案例

export default router;
