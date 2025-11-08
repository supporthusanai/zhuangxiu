import { Job } from 'bull';
import { ImageJobData } from '../../config/queue';
import logger from '../../config/logger';
import path from 'path';
import fs from 'fs/promises';
import { processImage as processImageUtil } from '../../utils/image';

/**
 * 图片处理器
 *
 * 处理图片压缩、调整大小、添加水印等任务
 * 使用 Sharp 库进行高性能图片处理
 */
export const processImage = async (job: Job<ImageJobData>) => {
  const { imagePath, operations, outputPath } = job.data;

  logger.info('处理图片任务', {
    jobId: job.id,
    imagePath,
    operations,
  });

  try {
    // 检查文件是否存在
    try {
      await fs.access(imagePath);
    } catch (error) {
      throw new Error(`图片文件不存在: ${imagePath}`);
    }

    // 使用 Sharp 进行图片处理
    const output = await processImageUtil(imagePath, {
      resize: operations.resize,
      compress: operations.compress,
      watermark: operations.watermark,
      outputPath,
    });

    logger.info('图片处理成功', {
      jobId: job.id,
      imagePath,
      outputPath: output,
    });

    return {
      success: true,
      inputPath: imagePath,
      outputPath: output,
      operations,
    };
  } catch (error) {
    logger.error('图片处理失败', {
      jobId: job.id,
      imagePath,
      error,
    });
    throw error;
  }
};

export default processImage;
