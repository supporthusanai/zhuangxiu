import { Router } from 'express';
import {
  uploadImage,
  uploadImages,
  removeFile,
} from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';
import { uploadSingleImage, uploadMultipleImages } from '../middleware/upload';
import { uploadLimiter } from '../middleware/rateLimiter';

const router = Router();

// 所有上传接口都需要认证
router.use(authenticate);

// 上传单个图片（限流保护）
router.post('/image', uploadLimiter, uploadSingleImage, uploadImage);

// 上传多个图片（限流保护）
router.post('/images', uploadLimiter, uploadMultipleImages, uploadImages);

// 删除文件
router.delete('/file', removeFile);

export default router;
