import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import logger from '../config/logger';

export interface ResizeOptions {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: string;
}

export interface CompressOptions {
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface WatermarkOptions {
  text?: string;
  imagePath?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity?: number;
}

export interface ImageProcessOptions {
  resize?: ResizeOptions;
  compress?: CompressOptions;
  watermark?: WatermarkOptions;
  outputPath?: string;
  outputFormat?: 'jpeg' | 'png' | 'webp';
}

/**
 * 调整图片大小
 */
export const resizeImage = async (
  inputPath: string,
  outputPath: string,
  options: ResizeOptions
): Promise<void> => {
  try {
    const { width, height, fit = 'inside', position } = options;

    await sharp(inputPath)
      .resize(width, height, {
        fit,
        position,
        withoutEnlargement: true,
      })
      .toFile(outputPath);

    logger.debug('图片调整大小成功', { inputPath, outputPath, options });
  } catch (error) {
    logger.error('图片调整大小失败', { inputPath, error });
    throw error;
  }
};

/**
 * 压缩图片
 */
export const compressImage = async (
  inputPath: string,
  outputPath: string,
  options: CompressOptions = {}
): Promise<void> => {
  try {
    const { quality = 80, format = 'jpeg' } = options;

    let image = sharp(inputPath);

    if (format === 'jpeg') {
      image = image.jpeg({ quality, mozjpeg: true });
    } else if (format === 'png') {
      image = image.png({ quality, compressionLevel: 9 });
    } else if (format === 'webp') {
      image = image.webp({ quality });
    }

    await image.toFile(outputPath);

    logger.debug('图片压缩成功', { inputPath, outputPath, options });
  } catch (error) {
    logger.error('图片压缩失败', { inputPath, error });
    throw error;
  }
};

/**
 * 添加文字水印
 */
export const addTextWatermark = async (
  inputPath: string,
  outputPath: string,
  text: string,
  options: WatermarkOptions = {}
): Promise<void> => {
  try {
    const { position = 'bottom-right', opacity = 0.5 } = options;

    // 获取图片信息
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 600;

    // 创建 SVG 文字水印
    const fontSize = Math.floor(width / 20);
    const padding = fontSize;

    let x: number, y: number;
    switch (position) {
      case 'top-left':
        x = padding;
        y = fontSize + padding;
        break;
      case 'top-right':
        x = width - padding;
        y = fontSize + padding;
        break;
      case 'bottom-left':
        x = padding;
        y = height - padding;
        break;
      case 'bottom-right':
        x = width - padding;
        y = height - padding;
        break;
      case 'center':
      default:
        x = width / 2;
        y = height / 2;
    }

    const svgText = `
      <svg width="${width}" height="${height}">
        <text
          x="${x}"
          y="${y}"
          font-family="Arial"
          font-size="${fontSize}"
          fill="white"
          fill-opacity="${opacity}"
          text-anchor="${position.includes('right') ? 'end' : position === 'center' ? 'middle' : 'start'}"
        >${text}</text>
      </svg>
    `;

    const svgBuffer = Buffer.from(svgText);

    await image
      .composite([
        {
          input: svgBuffer,
          top: 0,
          left: 0,
        },
      ])
      .toFile(outputPath);

    logger.debug('添加文字水印成功', { inputPath, outputPath, text });
  } catch (error) {
    logger.error('添加文字水印失败', { inputPath, error });
    throw error;
  }
};

/**
 * 添加图片水印
 */
export const addImageWatermark = async (
  inputPath: string,
  outputPath: string,
  watermarkPath: string,
  options: WatermarkOptions = {}
): Promise<void> => {
  try {
    const { position = 'bottom-right', opacity = 0.5 } = options;

    // 获取原图信息
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 600;

    // 读取水印图片并调整大小
    const watermarkSize = Math.floor(width / 5);
    const watermarkBuffer = await sharp(watermarkPath)
      .resize(watermarkSize, watermarkSize, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .png()
      .toBuffer();

    // 获取水印信息
    const watermarkMeta = await sharp(watermarkBuffer).metadata();
    const wmWidth = watermarkMeta.width || watermarkSize;
    const wmHeight = watermarkMeta.height || watermarkSize;

    // 计算位置
    const padding = 20;
    let left: number, top: number;

    switch (position) {
      case 'top-left':
        left = padding;
        top = padding;
        break;
      case 'top-right':
        left = width - wmWidth - padding;
        top = padding;
        break;
      case 'bottom-left':
        left = padding;
        top = height - wmHeight - padding;
        break;
      case 'bottom-right':
        left = width - wmWidth - padding;
        top = height - wmHeight - padding;
        break;
      case 'center':
      default:
        left = (width - wmWidth) / 2;
        top = (height - wmHeight) / 2;
    }

    // 应用透明度
    const compositeBuffer = await sharp(watermarkBuffer)
      .composite([
        {
          input: Buffer.from([255, 255, 255, Math.floor(opacity * 255)]),
          raw: {
            width: 1,
            height: 1,
            channels: 4,
          },
          tile: true,
          blend: 'dest-in',
        },
      ])
      .toBuffer();

    await image
      .composite([
        {
          input: compositeBuffer,
          top: Math.floor(top),
          left: Math.floor(left),
        },
      ])
      .toFile(outputPath);

    logger.debug('添加图片水印成功', { inputPath, outputPath, watermarkPath });
  } catch (error) {
    logger.error('添加图片水印失败', { inputPath, error });
    throw error;
  }
};

/**
 * 综合处理图片（调整大小、压缩、水印）
 */
export const processImage = async (
  inputPath: string,
  options: ImageProcessOptions
): Promise<string> => {
  try {
    const { resize, compress, watermark, outputPath, outputFormat } = options;

    // 生成输出路径
    const parsedPath = path.parse(inputPath);
    const defaultOutputPath = path.join(
      parsedPath.dir,
      `${parsedPath.name}_processed${parsedPath.ext}`
    );
    const finalOutputPath = outputPath || defaultOutputPath;

    let image = sharp(inputPath);

    // 调整大小
    if (resize) {
      const { width, height, fit = 'inside' } = resize;
      image = image.resize(width, height, {
        fit,
        withoutEnlargement: true,
      });
    }

    // 设置输出格式和压缩
    const format = outputFormat || compress?.format || 'jpeg';
    const quality = compress?.quality || 80;

    if (format === 'jpeg') {
      image = image.jpeg({ quality, mozjpeg: true });
    } else if (format === 'png') {
      image = image.png({ quality, compressionLevel: 9 });
    } else if (format === 'webp') {
      image = image.webp({ quality });
    }

    // 保存临时文件
    const tempPath = path.join(parsedPath.dir, `${parsedPath.name}_temp.${format}`);
    await image.toFile(tempPath);

    // 添加水印
    if (watermark) {
      if (watermark.text) {
        await addTextWatermark(tempPath, finalOutputPath, watermark.text, watermark);
      } else if (watermark.imagePath) {
        await addImageWatermark(tempPath, finalOutputPath, watermark.imagePath, watermark);
      } else {
        // 没有水印，重命名临时文件
        await fs.rename(tempPath, finalOutputPath);
      }
      // 删除临时文件
      try {
        await fs.unlink(tempPath);
      } catch (error) {
        // 忽略删除错误
      }
    } else {
      // 没有水印，重命名临时文件
      await fs.rename(tempPath, finalOutputPath);
    }

    logger.info('图片处理成功', { inputPath, outputPath: finalOutputPath, options });

    return finalOutputPath;
  } catch (error) {
    logger.error('图片处理失败', { inputPath, error });
    throw error;
  }
};

/**
 * 生成缩略图
 */
export const generateThumbnail = async (
  inputPath: string,
  outputPath: string,
  width: number = 200,
  height: number = 200
): Promise<void> => {
  try {
    await sharp(inputPath)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    logger.debug('缩略图生成成功', { inputPath, outputPath, width, height });
  } catch (error) {
    logger.error('缩略图生成失败', { inputPath, error });
    throw error;
  }
};

/**
 * 获取图片信息
 */
export const getImageMetadata = async (imagePath: string) => {
  try {
    const metadata = await sharp(imagePath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      channels: metadata.channels,
      hasAlpha: metadata.hasAlpha,
    };
  } catch (error) {
    logger.error('获取图片信息失败', { imagePath, error });
    throw error;
  }
};

/**
 * 转换图片格式
 */
export const convertFormat = async (
  inputPath: string,
  outputPath: string,
  format: 'jpeg' | 'png' | 'webp',
  quality: number = 80
): Promise<void> => {
  try {
    let image = sharp(inputPath);

    if (format === 'jpeg') {
      image = image.jpeg({ quality });
    } else if (format === 'png') {
      image = image.png({ quality, compressionLevel: 9 });
    } else if (format === 'webp') {
      image = image.webp({ quality });
    }

    await image.toFile(outputPath);

    logger.debug('图片格式转换成功', { inputPath, outputPath, format });
  } catch (error) {
    logger.error('图片格式转换失败', { inputPath, error });
    throw error;
  }
};

export default {
  resizeImage,
  compressImage,
  addTextWatermark,
  addImageWatermark,
  processImage,
  generateThumbnail,
  getImageMetadata,
  convertFormat,
};
