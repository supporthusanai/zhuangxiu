import { Response } from 'express';
import User from '../models/User';
import Merchant from '../models/Merchant';
import Case from '../models/Case';
import Order from '../models/Order';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

// 获取用户列表
export const getUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { nickname: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
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
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
      ];
    }

    const [merchants, total] = await Promise.all([
      Merchant.find(query).populate('owner', 'nickname phone').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
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
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { orderNo: { $regex: search, $options: 'i' } },
        { projectName: { $regex: search, $options: 'i' } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'nickname phone')
        .populate('merchant', 'companyName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
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
