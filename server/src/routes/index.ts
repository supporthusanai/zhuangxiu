import { Router } from 'express';
import authRoutes from './authRoutes';
import caseRoutes from './caseRoutes';
import diaryRoutes from './diaryRoutes';
import favoriteRoutes from './favoriteRoutes';
import recommendRoutes from './recommendRoutes';

const router = Router();

// API 版本前缀
router.use('/auth', authRoutes);
router.use('/cases', caseRoutes);
router.use('/diaries', diaryRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/recommend', recommendRoutes);

// 健康检查
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
