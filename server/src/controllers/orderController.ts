import { Response } from 'express';
import Order from '../models/Order';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { validatePagination } from '../utils/sanitize';

// 创建订单
export const createOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const orderData = {
      ...req.body,
      user: req.userId,
    };

    // 计算总金额
    if (orderData.items && orderData.items.length > 0) {
      orderData.totalAmount = orderData.items.reduce(
        (sum: number, item: any) => sum + item.totalPrice,
        0
      );
      orderData.finalAmount = orderData.totalAmount - (orderData.discount || 0);
    }

    const order = await Order.create(orderData);

    res.status(201).json({
      success: true,
      message: '订单创建成功',
      data: order,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '创建订单失败',
    });
  }
};

// 获取订单列表（用户）
export const getUserOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.query;
    const { page, limit, skip } = validatePagination(req.query.page, req.query.limit);

    const query: any = { user: req.userId };
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('merchant', 'companyName logo')
        .populate('designer', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders,
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
      message: error instanceof Error ? error.message : '获取订单列表失败',
    });
  }
};

// 获取订单列表（商家）
export const getMerchantOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, paymentStatus } = req.query;
    const { page, limit, skip } = validatePagination(req.query.page, req.query.limit);

    const query: any = { merchant: req.user.merchantId };
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'nickname avatar phone')
        .populate('designer', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        orders,
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
      message: error instanceof Error ? error.message : '获取订单列表失败',
    });
  }
};

// 获取订单详情
export const getOrderById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('user', 'nickname avatar phone')
      .populate('merchant', 'companyName logo contactPhone')
      .populate('designer', 'name avatar title')
      .populate('case', 'title images');

    if (!order) {
      throw new AppError('订单不存在', 404);
    }

    // 权限检查：只有用户本人或商家可以查看
    const isOwner = order.user._id.toString() === req.userId;
    const isMerchant = req.user?.merchantId &&
      order.merchant._id.toString() === req.user.merchantId.toString();

    if (!isOwner && !isMerchant && req.user?.role !== 'admin') {
      throw new AppError('无权查看此订单', 403);
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取订单详情失败',
    });
  }
};

// 更新订单状态（商家）
export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, merchantNote } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      throw new AppError('订单不存在', 404);
    }

    // 权限检查
    if (order.merchant.toString() !== req.user?.merchantId) {
      throw new AppError('无权修改此订单', 403);
    }

    // 状态流转验证
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['designing', 'cancelled'],
      designing: ['constructing', 'cancelled'],
      constructing: ['completed'],
      completed: [],
      cancelled: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      throw new AppError(`不能从 ${order.status} 状态变更为 ${status}`, 400);
    }

    order.status = status;
    if (merchantNote) order.merchantNote = merchantNote;

    // 记录实际开工/完工时间
    if (status === 'constructing' && !order.actualStartDate) {
      order.actualStartDate = new Date();
    }
    if (status === 'completed' && !order.actualEndDate) {
      order.actualEndDate = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: '状态更新成功',
      data: order,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '更新订单状态失败',
    });
  }
};

// 添加支付记录（商家）
export const addPayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount, method, transactionId, note } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      throw new AppError('订单不存在', 404);
    }

    // 权限检查
    if (order.merchant.toString() !== req.user?.merchantId) {
      throw new AppError('无权修改此订单', 403);
    }

    // 验证金额
    const remainingAmount = order.finalAmount - order.paidAmount;
    if (amount > remainingAmount) {
      throw new AppError(`支付金额不能超过未支付金额 ${remainingAmount}`, 400);
    }

    // 添加支付记录
    order.payments.push({
      amount,
      method,
      transactionId,
      paidAt: new Date(),
      note,
    });

    order.paidAmount += amount;
    await order.save();

    res.status(200).json({
      success: true,
      message: '支付记录添加成功',
      data: order,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '添加支付记录失败',
    });
  }
};

// 取消订单（用户）
export const cancelOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      throw new AppError('订单不存在', 404);
    }

    // 权限检查
    if (order.user.toString() !== req.userId) {
      throw new AppError('无权取消此订单', 403);
    }

    // 只有待确认状态可以取消
    if (order.status !== 'pending') {
      throw new AppError('只有待确认的订单可以取消', 400);
    }

    order.status = 'cancelled';
    order.customerNote = reason || '用户取消';
    await order.save();

    res.status(200).json({
      success: true,
      message: '订单已取消',
      data: order,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '取消订单失败',
    });
  }
};

// 获取订单统计（商家）
export const getOrderStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const merchantId = req.user?.merchantId;

    if (!merchantId) {
      throw new AppError('商家信息不存在', 400);
    }

    const stats = await Order.aggregate([
      { $match: { merchant: merchantId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$finalAmount' },
          paidAmount: { $sum: '$paidAmount' },
        },
      },
    ]);

    const totalOrders = await Order.countDocuments({ merchant: merchantId });
    const totalRevenue = await Order.aggregate([
      { $match: { merchant: merchantId, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: stats,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取订单统计失败',
    });
  }
};
