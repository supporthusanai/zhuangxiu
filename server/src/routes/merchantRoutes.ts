import { Router } from 'express';
import {
  applyMerchant,
  getMyMerchant,
  updateMerchant,
  getMerchants,
  reviewMerchant,
  addDesigner,
  getMyDesigners,
  updateDesigner,
  deleteDesigner,
} from '../controllers/merchantController';
import { authenticate, checkRole } from '../middleware/auth';

const router = Router();

// 商家申请和管理（需要认证）
router.post('/apply', authenticate, applyMerchant); // 申请成为商家
router.get('/me', authenticate, getMyMerchant); // 获取我的商家信息
router.put('/me', authenticate, checkRole('merchant'), updateMerchant); // 更新商家信息

// 设计师管理（商家）
router.post('/designers', authenticate, checkRole('merchant'), addDesigner); // 添加设计师
router.get('/designers', authenticate, checkRole('merchant'), getMyDesigners); // 获取设计师列表
router.put('/designers/:id', authenticate, checkRole('merchant'), updateDesigner); // 更新设计师
router.delete('/designers/:id', authenticate, checkRole('merchant'), deleteDesigner); // 删除设计师

// 管理员接口
router.get('/list', authenticate, checkRole('admin'), getMerchants); // 获取商家列表
router.put('/:id/review', authenticate, checkRole('admin'), reviewMerchant); // 审核商家

export default router;
