import { Response } from 'express';
import Appointment from '../models/Appointment';
import Merchant from '../models/Merchant';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { validatePagination, isValidObjectId } from '../utils/sanitize';

// 有效的时间槽
const VALID_TIME_SLOTS = [
  '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00',
];

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

    // 验证必填字段
    if (!merchantId || !date || !timeSlot || !contactName || !contactPhone) {
      throw new AppError('缺少必填参数', 400);
    }

    // 验证ObjectId
    if (!isValidObjectId(merchantId)) {
      throw new AppError('无效的商家ID', 400);
    }

    if (designerId && !isValidObjectId(designerId)) {
      throw new AppError('无效的设计师ID', 400);
    }

    // 验证时间槽格式
    if (!VALID_TIME_SLOTS.includes(timeSlot)) {
      throw new AppError('无效的时间槽', 400);
    }

    // 验证预约日期
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      throw new AppError('无效的日期格式', 400);
    }

    // 检查日期不能是过去
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      throw new AppError('不能预约过去的日期', 400);
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(contactPhone)) {
      throw new AppError('手机号格式不正确', 400);
    }

    // 检查商家是否存在
    const merchant = await Merchant.findById(merchantId);
    if (!merchant || merchant.status !== 'approved') {
      throw new AppError('商家不存在或未通过审核', 404);
    }

    // 检查时间槽是否可用
    const existingAppointment = await Appointment.findOne({
      merchant: merchantId,
      date: appointmentDate,
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
      type: type || 'consultation',
      date: appointmentDate,
      timeSlot,
      contactName,
      contactPhone,
      address: address || '',
      projectArea: projectArea ? Number(projectArea) : undefined,
      projectStyle: projectStyle || '',
      note: note || '',
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
    const { status } = req.query;
    const { page, limit, skip } = validatePagination(req.query.page, req.query.limit);

    const query: any = { user: userId };
    if (status && ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'].includes(status as string)) {
      query.status = status;
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('merchant', 'companyName logo contactPhone')
        .populate('designer', 'name avatar')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
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
    const { status, date } = req.query;
    const { page, limit, skip } = validatePagination(req.query.page, req.query.limit);

    const query: any = { merchant: merchantId };
    if (status && ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'].includes(status as string)) {
      query.status = status;
    }
    if (date) {
      const parsedDate = new Date(date as string);
      if (!isNaN(parsedDate.getTime())) {
        const startOfDay = new Date(parsedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(parsedDate);
        endOfDay.setHours(23, 59, 59, 999);
        query.date = { $gte: startOfDay, $lte: endOfDay };
      }
    }

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('user', 'nickname phone avatar')
        .populate('designer', 'name')
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit),
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

    if (!isValidObjectId(merchantId as string)) {
      throw new AppError('无效的商家ID', 400);
    }

    const parsedDate = new Date(date as string);
    if (isNaN(parsedDate.getTime())) {
      throw new AppError('无效的日期格式', 400);
    }

    // 查询已预约的时间槽
    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      merchant: merchantId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] },
    }).select('timeSlot');

    const bookedSlots = bookedAppointments.map((a) => a.timeSlot);
    const availableSlots = VALID_TIME_SLOTS.filter((slot) => !bookedSlots.includes(slot));

    res.status(200).json({
      success: true,
      data: {
        allSlots: VALID_TIME_SLOTS,
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
