import { Response } from 'express';
import Appointment from '../models/Appointment';
import Merchant from '../models/Merchant';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

// 创建预约
export const createAppointment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      merchantId,
      designerId,
      type,
      date,
      timeSlot,
      contactName,
      contactPhone,
      address,
      projectArea,
      projectStyle,
      note,
    } = req.body;
    const userId = req.user!._id;

    // 检查商家是否存在
    const merchant = await Merchant.findById(merchantId);
    if (!merchant || merchant.status !== 'approved') {
      throw new AppError('商家不存在或未通过审核', 404);
    }

    // 检查时间槽是否可用
    const existingAppointment = await Appointment.findOne({
      merchant: merchantId,
      date: new Date(date),
      timeSlot,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (existingAppointment) {
      throw new AppError('该时间段已被预约', 400);
    }

    const appointment = await Appointment.create({
      user: userId,
      merchant: merchantId,
      designer: designerId,
      type,
      date: new Date(date),
      timeSlot,
      contactName,
      contactPhone,
      address,
      projectArea,
      projectStyle,
      note,
    });

    res.status(201).json({
      success: true,
      message: '预约成功',
      data: appointment,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '预约失败',
    });
  }
};

// 获取用户的预约列表
export const getMyAppointments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = { user: userId };
    if (status) query.status = status;

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('merchant', 'companyName logo contactPhone')
        .populate('designer', 'name avatar')
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Appointment.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        appointments,
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
      message: error instanceof Error ? error.message : '获取预约列表失败',
    });
  }
};

// 获取预约详情
export const getAppointmentDetail = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const appointment = await Appointment.findById(id)
      .populate('merchant', 'companyName logo contactPhone address')
      .populate('designer', 'name avatar phone');

    if (!appointment) throw new AppError('预约不存在', 404);

    // 检查权限
    const userRole = req.user!.role;
    if (
      appointment.user.toString() !== userId.toString() &&
      userRole !== 'admin' &&
      !(userRole === 'merchant' && req.user!.merchantId?.toString() === appointment.merchant._id.toString())
    ) {
      throw new AppError('无权查看此预约', 403);
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取预约详情失败',
    });
  }
};

// 取消预约
export const cancelAppointment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user!._id;

    const appointment = await Appointment.findById(id);
    if (!appointment) throw new AppError('预约不存在', 404);

    if (appointment.user.toString() !== userId.toString() && req.user!.role !== 'admin') {
      throw new AppError('无权取消此预约', 403);
    }

    if (['cancelled', 'completed'].includes(appointment.status)) {
      throw new AppError('预约已取消或已完成', 400);
    }

    appointment.status = 'cancelled';
    appointment.cancelReason = reason;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: '预约已取消',
      data: appointment,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '取消预约失败',
    });
  }
};

// 商家：获取预约列表
export const getMerchantAppointments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const merchantId = req.user!.merchantId;
    const { page = 1, limit = 10, status, date } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = { merchant: merchantId };
    if (status) query.status = status;
    if (date) {
      const startOfDay = new Date(date as string);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date as string);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('user', 'nickname phone avatar')
        .populate('designer', 'name')
        .sort({ date: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Appointment.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        appointments,
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
      message: error instanceof Error ? error.message : '获取预约列表失败',
    });
  }
};

// 商家：确认/拒绝预约
export const updateAppointmentStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, merchantNote } = req.body;
    const merchantId = req.user!.merchantId;

    const appointment = await Appointment.findById(id);
    if (!appointment) throw new AppError('预约不存在', 404);

    if (appointment.merchant.toString() !== merchantId?.toString()) {
      throw new AppError('无权操作此预约', 403);
    }

    if (!['confirmed', 'cancelled', 'completed', 'no_show'].includes(status)) {
      throw new AppError('无效的状态', 400);
    }

    appointment.status = status;
    if (merchantNote) appointment.merchantNote = merchantNote;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: '预约状态已更新',
      data: appointment,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '更新状态失败',
    });
  }
};

// 获取可用时间槽
export const getAvailableSlots = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { merchantId, date } = req.query;

    if (!merchantId || !date) {
      throw new AppError('缺少参数', 400);
    }

    // 定义时间槽
    const allSlots = [
      '09:00-10:00',
      '10:00-11:00',
      '11:00-12:00',
      '14:00-15:00',
      '15:00-16:00',
      '16:00-17:00',
      '17:00-18:00',
    ];

    // 查询已预约的时间槽
    const startOfDay = new Date(date as string);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date as string);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      merchant: merchantId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] },
    }).select('timeSlot');

    const bookedSlots = bookedAppointments.map((a) => a.timeSlot);
    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

    res.status(200).json({
      success: true,
      data: {
        allSlots,
        bookedSlots,
        availableSlots,
      },
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取时间槽失败',
    });
  }
};
