import { Response } from 'express';
import Case from '../models/Case';
import BrowseHistory from '../models/BrowseHistory';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { redisClient } from '../config/database';
import { escapeRegex, validatePagination, validateSortField } from '../utils/sanitize';

// 获取案例列表
export const getCases = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { style, minArea, maxArea, minPrice, maxPrice, order = 'desc' } = req.query;
    const { page, limit, skip } = validatePagination(req.query.page, req.query.limit);
    const allowedSortFields = ['createdAt', 'viewCount', 'favoriteCount', 'price', 'area'];
    const sortField = validateSortField(req.query.sort as string, allowedSortFields);

    // 构建查询条件
    const query: any = { status: 'published' };

    if (style) query.style = style;
    if (minArea || maxArea) {
      query.area = {};
      if (minArea) query.area.$gte = Number(minArea);
      if (maxArea) query.area.$lte = Number(maxArea);
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 构建排序
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj: any = {};
    sortObj[sortField] = sortOrder;

    // 查询
    const [cases, total] = await Promise.all([
      Case.find(query)
        .populate('designer', 'name avatar title')
        .sort(sortObj)
        .skip(skip)
        .limit(limit),
      Case.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        cases,
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
      message: error instanceof Error ? error.message : '获取案例列表失败',
    });
  }
};

// 获取案例详情
export const getCaseById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const caseDetail = await Case.findById(id)
      .populate('designer', 'name avatar title experience specialties rating')
      .populate('merchant', 'companyName logo');

    if (!caseDetail) {
      throw new AppError('案例不存在', 404);
    }

    // 增加浏览次数
    caseDetail.viewCount += 1;
    await caseDetail.save();

    // 记录浏览历史（如果用户已登录）- 使用 upsert 避免重复
    if (req.userId) {
      await BrowseHistory.findOneAndUpdate(
        {
          user: req.userId,
          targetType: 'case',
          targetId: id,
        },
        {
          $set: { createdAt: new Date() }, // 更新时间戳
        },
        {
          upsert: true,
          new: true,
        }
      );
    }

    res.status(200).json({
      success: true,
      data: caseDetail,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取案例详情失败',
    });
  }
};

// 搜索案例（支持全文搜索和正则搜索）
export const searchCases = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { keyword } = req.query;
    const { page, limit, skip } = validatePagination(req.query.page, req.query.limit);

    if (!keyword) {
      throw new AppError('搜索关键词不能为空', 400);
    }

    const searchKeyword = keyword as string;
    const escapedKeyword = escapeRegex(searchKeyword);

    let cases: any[];
    let total: number;

    try {
      // 优先尝试全文搜索（更高效）
      const textSearchQuery = {
        status: 'published',
        $text: { $search: searchKeyword },
      };

      const textSearchResults = await Case.find(textSearchQuery)
        .select({ score: { $meta: 'textScore' } })
        .populate('designer', 'name avatar title')
        .sort({ score: { $meta: 'textScore' }, viewCount: -1 })
        .skip(skip)
        .limit(limit);

      if (textSearchResults.length > 0) {
        cases = textSearchResults;
        total = await Case.countDocuments(textSearchQuery);
      } else {
        throw new Error('No text search results');
      }
    } catch {
      // 回退到正则搜索（使用转义后的关键词防止注入）
      const regexQuery = {
        status: 'published',
        $or: [
          { title: { $regex: escapedKeyword, $options: 'i' } },
          { description: { $regex: escapedKeyword, $options: 'i' } },
          { style: { $regex: escapedKeyword, $options: 'i' } },
          { tags: { $regex: escapedKeyword, $options: 'i' } },
        ],
      };

      [cases, total] = await Promise.all([
        Case.find(regexQuery)
          .populate('designer', 'name avatar title')
          .sort({ viewCount: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Case.countDocuments(regexQuery),
      ]);
    }

    res.status(200).json({
      success: true,
      data: {
        cases,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '搜索案例失败',
    });
  }
};

// 创建案例（商家）
export const createCase = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const caseData = {
      ...req.body,
      merchant: req.user.merchantId, // 从用户关联的商家获取
    };

    const newCase = await Case.create(caseData);

    res.status(201).json({
      success: true,
      message: '创建成功',
      data: newCase,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '创建案例失败',
    });
  }
};

// 更新案例（商家）
export const updateCase = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const caseDetail = await Case.findById(id);

    if (!caseDetail) {
      throw new AppError('案例不存在', 404);
    }

    // 检查权限
    if (caseDetail.merchant.toString() !== req.user.merchantId) {
      throw new AppError('无权修改此案例', 403);
    }

    Object.assign(caseDetail, req.body);
    await caseDetail.save();

    res.status(200).json({
      success: true,
      message: '更新成功',
      data: caseDetail,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '更新案例失败',
    });
  }
};

// 删除案例（商家）
export const deleteCase = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const caseDetail = await Case.findById(id);

    if (!caseDetail) {
      throw new AppError('案例不存在', 404);
    }

    // 检查权限
    if (caseDetail.merchant.toString() !== req.user.merchantId) {
      throw new AppError('无权删除此案例', 403);
    }

    await caseDetail.deleteOne();

    res.status(200).json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '删除案例失败',
    });
  }
};

// 获取热门案例（带缓存）
export const getHotCases = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 10;
    const cacheKey = `hot_cases:${limit}`;

    // 尝试从 Redis 获取缓存
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      res.status(200).json({
        success: true,
        data: JSON.parse(cached),
        fromCache: true,
      });
      return;
    }

    // 从数据库查询
    const cases = await Case.find({ status: 'published' })
      .populate('designer', 'name avatar title')
      .sort({ viewCount: -1, favoriteCount: -1 })
      .limit(limit);

    // 缓存结果（5分钟）
    await redisClient.setEx(cacheKey, 300, JSON.stringify(cases));

    res.status(200).json({
      success: true,
      data: cases,
      fromCache: false,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取热门案例失败',
    });
  }
};
