import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// 确保上传目录存在
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const uploadPath = path.join(process.cwd(), uploadDir);

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 根据文件类型创建不同的子目录
    let subDir = 'others';

    if (file.mimetype.startsWith('image/')) {
      subDir = 'images';
    } else if (file.mimetype.startsWith('video/')) {
      subDir = 'videos';
    } else if (file.mimetype.startsWith('application/pdf')) {
      subDir = 'documents';
    }

    const destPath = path.join(uploadPath, subDir);

    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }

    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名: 时间戳-随机数-原始文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const filename = `${basename}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

// 文件过滤
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 允许的图片类型
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  // 允许的文档类型
  const allowedDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  // 允许的视频类型
  const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime'];

  const allowedTypes = [...allowedImageTypes, ...allowedDocTypes, ...allowedVideoTypes];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${file.mimetype}`));
  }
};

// 配置 multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 默认 5MB
    files: 10, // 最多 10 个文件
  },
});

// 单个图片上传
export const uploadSingleImage = upload.single('image');

// 多个图片上传（最多9张）
export const uploadMultipleImages = upload.array('images', 9);

// 单个文件上传
export const uploadSingleFile = upload.single('file');

// 删除文件
export const deleteFile = (filePath: string): boolean => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('删除文件失败:', error);
    return false;
  }
};

// 获取文件 URL
export const getFileUrl = (req: Request, filePath: string): string => {
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/${filePath.replace(/\\/g, '/')}`;
};
