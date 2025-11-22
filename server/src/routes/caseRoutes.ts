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

// ==================== 公开接口 ====================
// 注意：具体路由（如 /hot, /search）必须放在动态路由（/:id）之前
// 否则动态路由会拦截这些请求

router.get('/', optionalAuth, getCases);           // 获取案例列表（支持筛选、排序、分页）
router.get('/hot', getHotCases);                   // 获取热门案例
router.get('/search', searchCases);                // 搜索案例（关键词搜索）
router.get('/:id', optionalAuth, getCaseById);     // 获取案例详情（记录浏览历史）⚠️ 必须放在最后

// ==================== 商家接口 ====================
// 需要 JWT 认证 + 商家/管理员角色

router.post('/', authenticate, checkRole('merchant', 'admin'), createCase);      // 创建案例
router.put('/:id', authenticate, checkRole('merchant', 'admin'), updateCase);    // 更新案例
router.delete('/:id', authenticate, checkRole('merchant', 'admin'), deleteCase); // 删除案例

export default router;
