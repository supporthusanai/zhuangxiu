import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import logger from '../config/logger';
import { envConfig } from '../config/env';

/**
 * 允许的文件类型配置
 */
const ALLOWED_MIME_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  videos: ['video/mp4', 'video/mpeg', 'video/quicktime'],
};

/**
 * 允许的文件扩展名（小写）
 */
const ALLOWED_EXTENSIONS = {
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  documents: ['.pdf', '.doc', '.docx'],
  videos: ['.mp4', '.mpeg', '.mov'],
};

/**
 * 危险文件扩展名黑名单
 */
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.app', '.deb', '.rpm', '.sh', '.bash', '.ps1', '.msi', '.apk',
];

// 确保上传目录存在
const uploadDir = envConfig.UPLOAD_DIR;
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
    // 生成安全的唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();

    // 清理文件名，只保留字母、数字、连字符和下划线
    const sanitizedBasename = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .substring(0, 50); // 限制长度

    const filename = `${sanitizedBasename}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

/**
 * 增强的文件过滤器
 * 包含多层安全检查
 */
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  try {
    // 1. 检查文件扩展名
    const ext = path.extname(file.originalname).toLowerCase();

    // 检查是否在危险扩展名黑名单中
    if (DANGEROUS_EXTENSIONS.includes(ext)) {
      logger.warn('Dangerous file extension detected', {
        filename: file.originalname,
        ext,
        mimetype: file.mimetype,
      });
      return cb(new Error(`禁止上传的文件类型: ${ext}`));
    }

    // 检查扩展名是否在白名单中
    const allAllowedExtensions = [
      ...ALLOWED_EXTENSIONS.images,
      ...ALLOWED_EXTENSIONS.documents,
      ...ALLOWED_EXTENSIONS.videos,
    ];

    if (!allAllowedExtensions.includes(ext)) {
      logger.warn('File extension not in whitelist', {
        filename: file.originalname,
        ext,
      });
      return cb(new Error(`不支持的文件扩展名: ${ext}`));
    }

    // 2. 检查 MIME 类型
    const allAllowedMimeTypes = [
      ...ALLOWED_MIME_TYPES.images,
      ...ALLOWED_MIME_TYPES.documents,
      ...ALLOWED_MIME_TYPES.videos,
    ];

    if (!allAllowedMimeTypes.includes(file.mimetype)) {
      logger.warn('MIME type not in whitelist', {
        filename: file.originalname,
        mimetype: file.mimetype,
      });
      return cb(new Error(`不支持的文件类型: ${file.mimetype}`));
    }

    // 3. 验证 MIME 类型和扩展名是否匹配
    const isImageExt = ALLOWED_EXTENSIONS.images.includes(ext);
    const isImageMime = ALLOWED_MIME_TYPES.images.includes(file.mimetype);
    const isDocExt = ALLOWED_EXTENSIONS.documents.includes(ext);
    const isDocMime = ALLOWED_MIME_TYPES.documents.includes(file.mimetype);
    const isVideoExt = ALLOWED_EXTENSIONS.videos.includes(ext);
    const isVideoMime = ALLOWED_MIME_TYPES.videos.includes(file.mimetype);

    const mimeExtMatch =
      (isImageExt && isImageMime) ||
      (isDocExt && isDocMime) ||
      (isVideoExt && isVideoMime);

    if (!mimeExtMatch) {
      logger.warn('MIME type and extension mismatch', {
        filename: file.originalname,
        ext,
        mimetype: file.mimetype,
      });
      return cb(new Error('文件类型与扩展名不匹配，可能存在安全风险'));
    }

    // 4. 检查文件名长度
    if (file.originalname.length > 255) {
      logger.warn('File name too long', {
        filename: file.originalname,
        length: file.originalname.length,
      });
      return cb(new Error('文件名过长，最多 255 个字符'));
    }

    // 5. 检查文件名中的特殊字符（防止路径遍历攻击）
    if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
      logger.warn('Suspicious file name detected', {
        filename: file.originalname,
      });
      return cb(new Error('文件名包含非法字符'));
    }

    // 所有检查通过
    logger.debug('File validation passed', {
      filename: file.originalname,
      mimetype: file.mimetype,
      ext,
    });

    cb(null, true);

  } catch (error) {
    logger.error('File filter error', {
      filename: file.originalname,
      error,
    });
    cb(new Error('文件验证失败'));
  }
};

// 配置 multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: envConfig.MAX_FILE_SIZE, // 从环境配置读取
    files: 10, // 最多 10 个文件
    fields: 10, // 最多 10 个字段
    fieldNameSize: 100, // 字段名最大长度
    fieldSize: 1024 * 1024, // 字段值最大 1MB
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
    logger.error('删除文件失败', { filePath, error });
    return false;
  }
};

// 获取文件 URL
export const getFileUrl = (req: Request, filePath: string): string => {
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/${filePath.replace(/\\/g, '/')}`;
};
