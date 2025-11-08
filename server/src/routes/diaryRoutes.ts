import { Router } from 'express';
import {
  getMyDiaries,
  getDiaryById,
  createDiary,
  updateDiary,
  deleteDiary,
  getDiaryStats,
} from '../controllers/diaryController';
import { authenticate } from '../middleware/auth';

const router = Router();

// 所有日记接口都需要认证
router.use(authenticate);

// 日记相关接口
router.get('/', getMyDiaries); // 获取我的日记列表
router.get('/stats', getDiaryStats); // 获取统计信息
router.get('/:id', getDiaryById); // 获取日记详情
router.post('/', createDiary); // 创建日记
router.put('/:id', updateDiary); // 更新日记
router.delete('/:id', deleteDiary); // 删除日记

export default router;
