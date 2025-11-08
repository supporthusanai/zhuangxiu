import { Response } from 'express';
import Case from '../models/Case';
import Designer from '../models/Designer';
import Favorite from '../models/Favorite';
import BrowseHistory from '../models/BrowseHistory';
import { AuthRequest } from '../middleware/auth';
import { redisClient } from '../config/database';

// 分析用户偏好
const analyzeUserPreference = async (userId: string) => {
  // 获取用户收藏
  const favorites = await Favorite.find({ user: userId }).populate('targetId');

  // 获取浏览历史（最近30天）
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const browseHistory = await BrowseHistory.find({
    user: userId,
    createdAt: { $gte: thirtyDaysAgo },
  }).populate('targetId');

  // 提取风格偏好
  const styles = new Set<string>();
  const areas: number[] = [];
  const prices: number[] = [];

  // 从收藏中提取
  favorites.forEach((fav) => {
    if (fav.targetType === 'case' && fav.targetId) {
      const caseItem = fav.targetId as any;
      if (caseItem.style) styles.add(caseItem.style);
      if (caseItem.area) areas.push(caseItem.area);
      if (caseItem.price) prices.push(caseItem.price);
    } else if (fav.targetType === 'designer' && fav.targetId) {
      const designer = fav.targetId as any;
      if (designer.specialties) {
        designer.specialties.forEach((s: string) => styles.add(s));
      }
    }
  });

  // 从浏览历史中提取
  browseHistory.forEach((history) => {
    if (history.targetType === 'case' && history.targetId) {
      const caseItem = history.targetId as any;
      if (caseItem.style) styles.add(caseItem.style);
    }
  });

  return {
    favoriteStyles: Array.from(styles),
    areaRange: areas.length > 0 ? {
      min: Math.min(...areas),
      max: Math.max(...areas),
    } : null,
    priceRange: prices.length > 0 ? {
      min: Math.min(...prices),
      max: Math.max(...prices),
    } : null,
    hasHistory: browseHistory.length > 0 || favorites.length > 0,
  };
};

// 计算相似度得分
const calculateSimilarityScore = (
  item: any,
  preference: any,
  type: 'case' | 'designer'
): number => {
  let score = 0;

  // 风格匹配（权重最高）
  if (type === 'case' && preference.favoriteStyles.includes(item.style)) {
    score += 50;
  } else if (type === 'designer') {
    const matchedStyles = item.specialties?.filter((s: string) =>
      preference.favoriteStyles.includes(s)
    ) || [];
    score += matchedStyles.length * 25;
  }

  // 价格范围匹配
  if (type === 'case' && preference.priceRange) {
    if (item.price >= preference.priceRange.min &&
        item.price <= preference.priceRange.max) {
      score += 20;
    }
  }

  // 面积范围匹配
  if (type === 'case' && preference.areaRange) {
    if (item.area >= preference.areaRange.min &&
        item.area <= preference.areaRange.max) {
      score += 15;
    }
  }

  // 评分权重
  if (type === 'designer' && item.rating) {
    score += item.rating * 5;
  }

  // 案例数权重
  if (type === 'designer' && item.caseCount) {
    score += Math.min(item.caseCount / 10, 15);
  }

  // 热度权重
  if (type === 'case') {
    score += Math.min(item.viewCount / 100, 10);
    score += Math.min(item.favoriteCount / 10, 10);
  }

  return score;
};

// 获取推荐案例
export const getRecommendedCases = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.userId;

    // 检查缓存
    const cacheKey = `recommended_cases:${userId}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      res.status(200).json({
        success: true,
        data: JSON.parse(cached),
        fromCache: true,
      });
      return;
    }

    // 分析用户偏好
    const preference = await analyzeUserPreference(userId!);

    // 获取已浏览的案例ID
    const browsedCaseIds = await BrowseHistory.find({
      user: userId,
      targetType: 'case',
    }).distinct('targetId');

    // 查询案例
    const query: any = {
      status: 'published',
      _id: { $nin: browsedCaseIds }, // 排除已浏览的
    };

    let cases = await Case.find(query)
      .populate('designer', 'name avatar title')
      .limit(Number(limit) * 3); // 多取一些用于排序

    // 如果有偏好，按相似度排序
    if (preference.hasHistory) {
      cases = cases
        .map(c => ({
          ...c.toObject(),
          score: calculateSimilarityScore(c, preference, 'case'),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, Number(limit));
    } else {
      // 无偏好，返回热门案例
      cases = cases
        .sort((a, b) => b.viewCount + b.favoriteCount - (a.viewCount + a.favoriteCount))
        .slice(0, Number(limit));
    }

    // 缓存结果（10分钟）
    await redisClient.setEx(cacheKey, 600, JSON.stringify(cases));

    res.status(200).json({
      success: true,
      data: cases,
      fromCache: false,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取推荐案例失败',
    });
  }
};

// 获取推荐设计师
export const getRecommendedDesigners = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.userId;

    // 检查缓存
    const cacheKey = `recommended_designers:${userId}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      res.status(200).json({
        success: true,
        data: JSON.parse(cached),
        fromCache: true,
      });
      return;
    }

    // 分析用户偏好
    const preference = await analyzeUserPreference(userId!);

    // 获取已浏览的设计师ID
    const browsedDesignerIds = await BrowseHistory.find({
      user: userId,
      targetType: 'designer',
    }).distinct('targetId');

    // 查询设计师
    const query: any = {
      isActive: true,
      _id: { $nin: browsedDesignerIds },
    };

    let designers = await Designer.find(query).limit(Number(limit) * 3);

    // 如果有偏好，按相似度排序
    if (preference.hasHistory) {
      designers = designers
        .map(d => ({
          ...d.toObject(),
          score: calculateSimilarityScore(d, preference, 'designer'),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, Number(limit));
    } else {
      // 无偏好，返回热门设计师
      designers = designers
        .sort((a, b) => b.rating * b.caseCount - a.rating * a.caseCount)
        .slice(0, Number(limit));
    }

    // 缓存结果（10分钟）
    await redisClient.setEx(cacheKey, 600, JSON.stringify(designers));

    res.status(200).json({
      success: true,
      data: designers,
      fromCache: false,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取推荐设计师失败',
    });
  }
};

// 获取相似案例
export const getSimilarCases = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { limit = 5 } = req.query;

    // 获取当前案例
    const currentCase = await Case.findById(id);
    if (!currentCase) {
      res.status(404).json({
        success: false,
        message: '案例不存在',
      });
      return;
    }

    // 查找相似案例
    const similarCases = await Case.find({
      _id: { $ne: id },
      status: 'published',
      $or: [
        { style: currentCase.style }, // 相同风格
        {
          area: {
            $gte: currentCase.area - 20,
            $lte: currentCase.area + 20,
          },
        }, // 相似面积
        {
          price: {
            $gte: currentCase.price - 10,
            $lte: currentCase.price + 10,
          },
        }, // 相似价格
      ],
    })
      .populate('designer', 'name avatar title')
      .limit(Number(limit) * 2);

    // 计算相似度得分并排序
    const scoredCases = similarCases.map(c => {
      let score = 0;
      if (c.style === currentCase.style) score += 50;

      const areaDiff = Math.abs(c.area - currentCase.area);
      if (areaDiff < 20) score += 30 - areaDiff;

      const priceDiff = Math.abs(c.price - currentCase.price);
      if (priceDiff < 10) score += 20 - priceDiff * 2;

      return { ...c.toObject(), score };
    });

    const result = scoredCases
      .sort((a, b) => b.score - a.score)
      .slice(0, Number(limit));

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取相似案例失败',
    });
  }
};
