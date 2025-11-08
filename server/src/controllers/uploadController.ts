import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getFileUrl, deleteFile } from '../middleware/upload';
import { AppError } from '../middleware/errorHandler';

// 上传单个图片
export const uploadImage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      throw new AppError('请选择要上传的文件', 400);
    }

    const fileUrl = getFileUrl(req, req.file.path);

    res.status(200).json({
      success: true,
      message: '上传成功',
      data: {
        filename: req.file.filename,
        path: req.file.path,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '上传失败',
    });
  }
};

// 上传多个图片
export const uploadImages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new AppError('请选择要上传的文件', 400);
    }

    const files = req.files.map((file) => ({
      filename: file.filename,
      path: file.path,
      url: getFileUrl(req, file.path),
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.status(200).json({
      success: true,
      message: `成功上传 ${files.length} 个文件`,
      data: files,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '上传失败',
    });
  }
};

// 删除文件
export const removeFile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { path: filePath } = req.body;

    if (!filePath) {
      throw new AppError('文件路径不能为空', 400);
    }

    const success = deleteFile(filePath);

    if (!success) {
      throw new AppError('文件不存在或删除失败', 404);
    }

    res.status(200).json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '删除失败',
    });
  }
};
