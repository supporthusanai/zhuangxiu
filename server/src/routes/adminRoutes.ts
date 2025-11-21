import { Router } from 'express';
import {
  getUsers,
  updateUserStatus,
  getMerchants,
  approveMerchant,
  getAllOrders,
  getDashboardStats,
  updateCaseStatus,
} from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// 所有管理员路由都需要认证和管理员权限
router.use(authenticate, requireAdmin);

// 仪表盘
router.get('/stats/dashboard', getDashboardStats);

// 用户管理
router.get('/users', getUsers);
router.put('/users/:id', updateUserStatus);

// 商家管理
router.get('/merchants', getMerchants);
router.put('/merchants/:id/approve', approveMerchant);

// 订单管理
router.get('/orders', getAllOrders);

// 案例管理
router.put('/cases/:id/status', updateCaseStatus);

export default router;
