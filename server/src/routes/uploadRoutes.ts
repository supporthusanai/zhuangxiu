import { Router } from 'express';
import {
  uploadImage,
  uploadImages,
  removeFile,
} from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';
import { uploadSingleImage, uploadMultipleImages } from '../middleware/upload';

const router = Router();

// 所有上传接口都需要认证
router.use(authenticate);

// 上传单个图片
router.post('/image', uploadSingleImage, uploadImage);

// 上传多个图片
router.post('/images', uploadMultipleImages, uploadImages);

// 删除文件
router.delete('/file', removeFile);

export default router;
