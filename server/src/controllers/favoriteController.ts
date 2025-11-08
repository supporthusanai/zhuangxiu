import { Response } from 'express';
import Favorite from '../models/Favorite';
import Case from '../models/Case';
import Designer from '../models/Designer';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

// 添加收藏
export const addFavorite = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { targetType, targetId } = req.body;

    if (!targetType || !targetId) {
      throw new AppError('参数不完整', 400);
    }

    // 检查是否已收藏
    const existing = await Favorite.findOne({
      user: req.userId,
      targetType,
      targetId,
    });

    if (existing) {
      throw new AppError('已经收藏过了', 400);
    }

    // 验证目标是否存在
    if (targetType === 'case') {
      const caseExists = await Case.findById(targetId);
      if (!caseExists) {
        throw new AppError('案例不存在', 404);
      }
      // 更新收藏数
      caseExists.favoriteCount += 1;
      await caseExists.save();
    } else if (targetType === 'designer') {
      const designerExists = await Designer.findById(targetId);
      if (!designerExists) {
        throw new AppError('设计师不存在', 404);
      }
    }

    // 创建收藏
    const favorite = await Favorite.create({
      user: req.userId,
      targetType,
      targetId,
    });

    res.status(201).json({
      success: true,
      message: '收藏成功',
      data: favorite,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '收藏失败',
    });
  }
};

// 取消收藏
export const removeFavorite = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { targetType, targetId } = req.params;

    const favorite = await Favorite.findOne({
      user: req.userId,
      targetType,
      targetId,
    });

    if (!favorite) {
      throw new AppError('收藏记录不存在', 404);
    }

    // 更新收藏数
    if (targetType === 'case') {
      const caseItem = await Case.findById(targetId);
      if (caseItem && caseItem.favoriteCount > 0) {
        caseItem.favoriteCount -= 1;
        await caseItem.save();
      }
    }

    await favorite.deleteOne();

    res.status(200).json({
      success: true,
      message: '取消收藏成功',
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '取消收藏失败',
    });
  }
};

// 获取我的收藏列表
export const getMyFavorites = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { targetType, page = 1, limit = 20 } = req.query;

    const query: any = { user: req.userId };
    if (targetType) {
      query.targetType = targetType;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [favorites, total] = await Promise.all([
      Favorite.find(query)
        .populate({
          path: 'targetId',
          select: targetType === 'case'
            ? 'title style area price images designer'
            : 'name avatar title experience specialties rating caseCount',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Favorite.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        favorites,
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
      message: error instanceof Error ? error.message : '获取收藏列表失败',
    });
  }
};

// 检查是否已收藏
export const checkFavorite = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { targetType, targetId } = req.params;

    const favorite = await Favorite.findOne({
      user: req.userId,
      targetType,
      targetId,
    });

    res.status(200).json({
      success: true,
      data: {
        isFavorited: !!favorite,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '检查收藏状态失败',
    });
  }
};
