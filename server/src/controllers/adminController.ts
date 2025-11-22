import { Response } from 'express';
import User from '../models/User';
import Merchant from '../models/Merchant';
import Case from '../models/Case';
import Order from '../models/Order';
import Review from '../models/Review';
import Appointment from '../models/Appointment';
import Designer from '../models/Designer';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { escapeRegex, validatePagination } from '../utils/sanitize';

// 获取用户列表
export const getUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { role, search } = req.query;
    const { page, limit, skip } = validatePagination(req.query.page, req.query.limit);

    const query: any = {};
    if (role) query.role = role;
    if (search) {
      const escapedSearch = escapeRegex(search as string);
      query.$or = [
        { nickname: { $regex: escapedSearch, $options: 'i' } },
        { phone: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: { users, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : '获取用户列表失败' });
  }
};

// 更新用户状态
export const updateUserStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive, role } = req.body;

    const user = await User.findById(id);
    if (!user) throw new AppError('用户不存在', 404);

    if (isActive !== undefined) user.isActive = isActive;
    if (role) user.role = role;
    await user.save();

    res.status(200).json({ success: true, message: '更新成功', data: user });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({ success: false, message: error instanceof Error ? error.message : '更新失败' });
  }
};

// 获取商家列表
export const getMerchants = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, search } = req.query;
    const { page, limit, skip } = validatePagination(req.query.page, req.query.limit);

    const query: any = {};
    if (status) query.status = status;
    if (search) {
      const escapedSearch = escapeRegex(search as string);
      query.$or = [
        { companyName: { $regex: escapedSearch, $options: 'i' } },
        { contactPerson: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    const [merchants, total] = await Promise.all([
      Merchant.find(query).populate('owner', 'nickname phone').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Merchant.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: { merchants, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : '获取商家列表失败' });
  }
};

// 审核商家
export const approveMerchant = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      throw new AppError('无效的状态', 400);
    }

    const merchant = await Merchant.findById(id);
    if (!merchant) throw new AppError('商家不存在', 404);

    merchant.status = status;
    if (reason) merchant.rejectionReason = reason;
    await merchant.save();

    // 如果通过审核，更新用户角色
    if (status === 'approved') {
      await User.findByIdAndUpdate(merchant.user, { role: 'merchant', merchantId: merchant._id });
    }

    res.status(200).json({ success: true, message: '审核完成', data: merchant });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({ success: false, message: error instanceof Error ? error.message : '审核失败' });
  }
};

// 获取所有订单
export const getAllOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, search } = req.query;
    const { page, limit, skip } = validatePagination(req.query.page, req.query.limit);

    const query: any = {};
    if (status) query.status = status;
    if (search) {
      const escapedSearch = escapeRegex(search as string);
      query.$or = [
        { orderNo: { $regex: escapedSearch, $options: 'i' } },
        { projectName: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'nickname phone')
        .populate('merchant', 'companyName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: { orders, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : '获取订单列表失败' });
  }
};

// 获取仪表盘统计
export const getDashboardStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const [totalUsers, totalMerchants, totalCases, totalOrders, pendingMerchants, pendingOrders] = await Promise.all([
      User.countDocuments(),
      Merchant.countDocuments({ status: 'approved' }),
      Case.countDocuments({ status: 'published' }),
      Order.countDocuments(),
      Merchant.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'pending' }),
    ]);

    res.status(200).json({
      success: true,
      data: { totalUsers, totalMerchants, totalCases, totalOrders, pendingMerchants, pendingOrders },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : '获取统计数据失败' });
  }
};

// 更新案例状态
export const updateCaseStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const caseItem = await Case.findById(id);
    if (!caseItem) throw new AppError('案例不存在', 404);

    caseItem.status = status;
    await caseItem.save();

    res.status(200).json({ success: true, message: '状态更新成功', data: caseItem });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({ success: false, message: error instanceof Error ? error.message : '更新失败' });
  }
};

// 获取所有评价
export const getAllReviews = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { rating, search } = req.query;
    const { page, limit, skip } = validatePagination(req.query.page, req.query.limit);

    const query: any = {};
    if (rating) query.rating = Number(rating);
    if (search) {
      const escapedSearch = escapeRegex(search as string);
      query.content = { $regex: escapedSearch, $options: 'i' };
    }

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('user', 'nickname avatar')
        .populate('merchant', 'companyName')
        .populate('order', 'orderNo')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: { reviews, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : '获取评价列表失败' });
  }
};

// 删除评价
export const deleteReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) throw new AppError('评价不存在', 404);

    res.status(200).json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({ success: false, message: error instanceof Error ? error.message : '删除失败' });
  }
};

// 获取所有预约
export const getAllAppointments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, search } = req.query;
    const { page, limit, skip } = validatePagination(req.query.page, req.query.limit);

    const query: any = {};
    if (status) query.status = status;

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('user', 'nickname phone')
        .populate('merchant', 'companyName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Appointment.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: { appointments, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : '获取预约列表失败' });
  }
};

// 获取所有设计师
export const getAllDesigners = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { search } = req.query;
    const { page, limit, skip } = validatePagination(req.query.page, req.query.limit);

    const query: any = {};
    if (search) {
      const escapedSearch = escapeRegex(search as string);
      query.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { title: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    const [designers, total] = await Promise.all([
      Designer.find(query)
        .populate('merchant', 'companyName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Designer.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: { designers, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : '获取设计师列表失败' });
  }
};

// 删除设计师
export const deleteDesigner = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const designer = await Designer.findByIdAndDelete(id);
    if (!designer) throw new AppError('设计师不存在', 404);

    res.status(200).json({ success: true, message: '删除成功' });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({ success: false, message: error instanceof Error ? error.message : '删除失败' });
  }
};

// 获取详细统计数据
export const getDetailedStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // 获取最近7天的数据趋势
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalUsers,
      totalMerchants,
      totalCases,
      totalOrders,
      totalReviews,
      totalAppointments,
      totalDesigners,
      recentUsers,
      recentOrders,
      usersByRole,
      ordersByStatus,
    ] = await Promise.all([
      User.countDocuments(),
      Merchant.countDocuments({ status: 'approved' }),
      Case.countDocuments({ status: 'published' }),
      Order.countDocuments(),
      Review.countDocuments(),
      Appointment.countDocuments(),
      Designer.countDocuments(),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Order.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: { totalUsers, totalMerchants, totalCases, totalOrders, totalReviews, totalAppointments, totalDesigners },
        recent: { recentUsers, recentOrders },
        distribution: { usersByRole, ordersByStatus },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : '获取统计数据失败' });
  }
};
