import { Response } from 'express';
import Diary from '../models/Diary';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

// 获取我的日记列表
export const getMyDiaries = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [diaries, total] = await Promise.all([
      Diary.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Diary.countDocuments({ user: req.userId }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        diaries,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取日记列表失败',
    });
  }
};

// 获取日记详情
export const getDiaryById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const diary = await Diary.findById(id);

    if (!diary) {
      throw new AppError('日记不存在', 404);
    }

    // 检查权限
    if (diary.user.toString() !== req.userId) {
      throw new AppError('无权查看此日记', 403);
    }

    res.status(200).json({
      success: true,
      data: diary,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取日记详情失败',
    });
  }
};

// 创建日记
export const createDiary = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, content, images, tags, progress } = req.body;

    const diary = await Diary.create({
      user: req.userId,
      title,
      content,
      images: images || [],
      tags: tags || [],
      progress: progress || 0,
    });

    res.status(201).json({
      success: true,
      message: '创建成功',
      data: diary,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '创建日记失败',
    });
  }
};

// 更新日记
export const updateDiary = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content, images, tags, progress } = req.body;

    const diary = await Diary.findById(id);

    if (!diary) {
      throw new AppError('日记不存在', 404);
    }

    // 检查权限
    if (diary.user.toString() !== req.userId) {
      throw new AppError('无权修改此日记', 403);
    }

    // 更新字段
    if (title !== undefined) diary.title = title;
    if (content !== undefined) diary.content = content;
    if (images !== undefined) diary.images = images;
    if (tags !== undefined) diary.tags = tags;
    if (progress !== undefined) diary.progress = progress;

    await diary.save();

    res.status(200).json({
      success: true,
      message: '更新成功',
      data: diary,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '更新日记失败',
    });
  }
};

// 删除日记
export const deleteDiary = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const diary = await Diary.findById(id);

    if (!diary) {
      throw new AppError('日记不存在', 404);
    }

    // 检查权限
    if (diary.user.toString() !== req.userId) {
      throw new AppError('无权删除此日记', 403);
    }

    await diary.deleteOne();

    res.status(200).json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '删除日记失败',
    });
  }
};

// 获取装修进度统计
export const getDiaryStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const diaries = await Diary.find({ user: req.userId });

    const totalDiaries = diaries.length;
    const maxProgress = diaries.length > 0 ? Math.max(...diaries.map(d => d.progress)) : 0;

    // 按标签统计
    const tagStats: { [key: string]: number } = {};
    diaries.forEach(diary => {
      diary.tags.forEach(tag => {
        tagStats[tag] = (tagStats[tag] || 0) + 1;
      });
    });

    res.status(200).json({
      success: true,
      data: {
        totalDiaries,
        maxProgress,
        tagStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取统计信息失败',
    });
  }
};
