import { Router } from 'express';
import {
  createOrder,
  getUserOrders,
  getMerchantOrders,
  getOrderById,
  updateOrderStatus,
  addPayment,
  cancelOrder,
  getOrderStats,
} from '../controllers/orderController';
import { authenticate, requireMerchant } from '../middleware/auth';

const router = Router();

// 商家订单相关（放在 /:id 之前避免路由冲突）
router.get('/merchant/list', authenticate, requireMerchant, getMerchantOrders);
router.get('/merchant/stats', authenticate, requireMerchant, getOrderStats);

// 用户订单相关
router.post('/', authenticate, createOrder);
router.get('/my', authenticate, getUserOrders);
router.get('/:id', authenticate, getOrderById);
router.post('/:id/cancel', authenticate, cancelOrder);
router.put('/:id/status', authenticate, requireMerchant, updateOrderStatus);
router.post('/:id/payment', authenticate, requireMerchant, addPayment);

export default router;
