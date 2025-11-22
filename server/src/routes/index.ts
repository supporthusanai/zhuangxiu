import { Router } from 'express';
import authRoutes from './authRoutes';
import caseRoutes from './caseRoutes';
import diaryRoutes from './diaryRoutes';
import favoriteRoutes from './favoriteRoutes';
import recommendRoutes from './recommendRoutes';
import uploadRoutes from './uploadRoutes';
import merchantRoutes from './merchantRoutes';
import chatRoutes from './chatRoutes';
import healthRoutes from './healthRoutes';

const router = Router();

// 业务路由
router.use('/auth', authRoutes);
router.use('/cases', caseRoutes);
router.use('/diaries', diaryRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/recommend', recommendRoutes);
router.use('/upload', uploadRoutes);
router.use('/merchants', merchantRoutes);
router.use('/chat', chatRoutes);

// 健康检查和监控路由（不需要 /api/v1 前缀）
router.use('/', healthRoutes);

export default router;
