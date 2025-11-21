import { Router } from 'express';
import {
  createAppointment,
  getMyAppointments,
  getAppointmentDetail,
  cancelAppointment,
  getMerchantAppointments,
  updateAppointmentStatus,
  getAvailableSlots,
} from '../controllers/appointmentController';
import { authenticate, requireMerchant } from '../middleware/auth';

const router = Router();

// 获取可用时间槽（公开）
router.get('/slots', getAvailableSlots);

// 需要登录的路由
router.use(authenticate);

// 用户路由
router.post('/', createAppointment);
router.get('/my', getMyAppointments);
router.get('/:id', getAppointmentDetail);
router.post('/:id/cancel', cancelAppointment);

// 商家路由
router.get('/merchant/list', requireMerchant, getMerchantAppointments);
router.put('/:id/status', requireMerchant, updateAppointmentStatus);

export default router;
