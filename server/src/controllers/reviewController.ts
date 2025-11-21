import { Response } from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review';
import Order from '../models/Order';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { validatePagination, isValidObjectId } from '../utils/sanitize';

// 创建评价
export const createReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { targetType, targetId, orderId, rating, content, images, tags, isAnonymous } = req.body;
    const userId = req.user!._id;

    // 验证必填字段
    if (!targetType || !targetId || !rating) {
      throw new AppError('缺少必填参数', 400);
    }

    // 验证评分范围
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      throw new AppError('评分必须在1-5之间', 400);
    }

    // 验证目标类型
    if (!['merchant', 'designer', 'case'].includes(targetType)) {
      throw new AppError('无效的评价目标类型', 400);
    }

    // 验证ObjectId格式
    if (!isValidObjectId(targetId)) {
      throw new AppError('无效的目标ID', 400);
    }

    if (orderId && !isValidObjectId(orderId)) {
      throw new AppError('无效的订单ID', 400);
    }

    // 检查是否已评价
    const existingReview = await Review.findOne({
      user: userId,
      targetType,
      targetId,
    });
    if (existingReview) {
      throw new AppError('您已经评价过了', 400);
    }

    // 如果是订单评价，验证订单属于用户且已完成
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) throw new AppError('订单不存在', 404);
      if (order.user.toString() !== userId.toString()) {
        throw new AppError('无权评价此订单', 403);
      }
      if (order.status !== 'completed') {
        throw new AppError('订单未完成，无法评价', 400);
      }
      if (order.isReviewed) {
        throw new AppError('该订单已评价', 400);
      }
    }

    const review = await Review.create({
      user: userId,
      targetType,
      targetId,
      order: orderId,
      rating: numRating,
      content: content || '',
      images: Array.isArray(images) ? images.slice(0, 9) : [],
      tags: Array.isArray(tags) ? tags.slice(0, 10) : [],
      isAnonymous: isAnonymous || false,
    });

    // 如果是订单评价，更新订单状态
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { isReviewed: true });
    }

    res.status(201).json({
      success: true,
      message: '评价成功',
      data: review,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '评价失败',
    });
  }
};

// 获取目标的评价列表
export const getReviews = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { targetType, targetId } = req.params;
    const { sort = 'newest' } = req.query;
    const { page, limit, skip } = validatePagination(req.query.page, req.query.limit);

    // 验证参数
    if (!isValidObjectId(targetId)) {
      throw new AppError('无效的目标ID', 400);
    }

    const allowedSorts = ['newest', 'oldest', 'highest', 'lowest', 'popular'];
    const sortKey = allowedSorts.includes(sort as string) ? sort as string : 'newest';

    const sortOptions: Record<string, any> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      highest: { rating: -1 },
      lowest: { rating: 1 },
      popular: { likes: -1 },
    };

    const objectId = new mongoose.Types.ObjectId(targetId);

    const [reviews, total, stats] = await Promise.all([
      Review.find({ targetType, targetId, status: 'approved' })
        .populate('user', 'nickname avatar')
        .sort(sortOptions[sortKey])
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ targetType, targetId, status: 'approved' }),
      Review.aggregate([
        { $match: { targetType, targetId: objectId, status: 'approved' } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
            rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
            rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
            rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
            rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          },
        },
      ]),
    ]);

    // 处理匿名评价
    const processedReviews = reviews.map((review) => {
      const r = review.toObject() as any;
      if (r.isAnonymous) {
        r.user = { nickname: '匿名用户', avatar: '' };
      }
      return r;
    });

    res.status(200).json({
      success: true,
      data: {
        reviews: processedReviews,
        stats: stats[0] || {
          averageRating: 0,
          rating5: 0,
          rating4: 0,
          rating3: 0,
          rating2: 0,
          rating1: 0,
        },
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
      message: error instanceof Error ? error.message : '获取评价失败',
    });
  }
};

// 获取用户的评价列表
export const getMyReviews = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments({ user: userId }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        reviews,
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
      message: error instanceof Error ? error.message : '获取评价失败',
    });
  }
};

// 商家回复评价
export const replyReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const review = await Review.findById(id);
    if (!review) throw new AppError('评价不存在', 404);

    if (review.reply) {
      throw new AppError('已经回复过了', 400);
    }

    review.reply = {
      content,
      createdAt: new Date(),
    };
    await review.save();

    res.status(200).json({
      success: true,
      message: '回复成功',
      data: review,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '回复失败',
    });
  }
};

// 点赞评价
export const likeReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!review) throw new AppError('评价不存在', 404);

    res.status(200).json({
      success: true,
      data: { likes: review.likes },
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '操作失败',
    });
  }
};

// 删除评价
export const deleteReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const review = await Review.findById(id);
    if (!review) throw new AppError('评价不存在', 404);

    if (review.user.toString() !== userId.toString() && req.user!.role !== 'admin') {
      throw new AppError('无权删除此评价', 403);
    }

    await review.deleteOne();

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
