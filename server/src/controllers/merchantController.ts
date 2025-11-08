import { Response } from 'express';
import Merchant from '../models/Merchant';
import User from '../models/User';
import Designer from '../models/Designer';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

// 申请成为商家
export const applyMerchant = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      companyName,
      businessLicense,
      contactPerson,
      contactPhone,
      address,
      description,
      logo,
    } = req.body;

    // 检查是否已经申请过
    const existing = await Merchant.findOne({ user: req.userId });

    if (existing) {
      throw new AppError('您已经提交过申请', 400);
    }

    // 创建商家申请
    const merchant = await Merchant.create({
      user: req.userId,
      companyName,
      businessLicense,
      contactPerson,
      contactPhone,
      address,
      description: description || '',
      logo: logo || '',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: '申请已提交，请等待审核',
      data: merchant,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '申请失败',
    });
  }
};

// 获取我的商家信息
export const getMyMerchant = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const merchant = await Merchant.findOne({ user: req.userId });

    if (!merchant) {
      throw new AppError('商家信息不存在', 404);
    }

    res.status(200).json({
      success: true,
      data: merchant,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取商家信息失败',
    });
  }
};

// 更新商家信息
export const updateMerchant = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      companyName,
      contactPerson,
      contactPhone,
      address,
      description,
      logo,
    } = req.body;

    const merchant = await Merchant.findOne({ user: req.userId });

    if (!merchant) {
      throw new AppError('商家信息不存在', 404);
    }

    // 只有审核通过的商家可以修改信息
    if (merchant.status !== 'approved') {
      throw new AppError('商家未通过审核，无法修改信息', 403);
    }

    // 更新字段
    if (companyName) merchant.companyName = companyName;
    if (contactPerson) merchant.contactPerson = contactPerson;
    if (contactPhone) merchant.contactPhone = contactPhone;
    if (address) merchant.address = address;
    if (description !== undefined) merchant.description = description;
    if (logo !== undefined) merchant.logo = logo;

    await merchant.save();

    res.status(200).json({
      success: true,
      message: '更新成功',
      data: merchant,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '更新失败',
    });
  }
};

// 获取商家列表（管理员）
export const getMerchants = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [merchants, total] = await Promise.all([
      Merchant.find(query)
        .populate('user', 'nickname avatar phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Merchant.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        merchants,
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
      message: error instanceof Error ? error.message : '获取商家列表失败',
    });
  }
};

// 审核商家（管理员）
export const reviewMerchant = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      throw new AppError('状态参数错误', 400);
    }

    const merchant = await Merchant.findById(id);

    if (!merchant) {
      throw new AppError('商家不存在', 404);
    }

    merchant.status = status;

    if (status === 'rejected' && rejectionReason) {
      merchant.rejectionReason = rejectionReason;
    }

    await merchant.save();

    // 如果审核通过，更新用户角色为商家
    if (status === 'approved') {
      await User.findByIdAndUpdate(merchant.user, { role: 'merchant' });
    }

    res.status(200).json({
      success: true,
      message: status === 'approved' ? '审核通过' : '已拒绝',
      data: merchant,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '审核失败',
    });
  }
};

// 添加设计师
export const addDesigner = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, avatar, title, experience, specialties, introduction } = req.body;

    // 获取商家信息
    const merchant = await Merchant.findOne({
      user: req.userId,
      status: 'approved',
    });

    if (!merchant) {
      throw new AppError('商家未通过审核', 403);
    }

    // 创建设计师
    const designer = await Designer.create({
      user: req.userId,
      name,
      avatar,
      title,
      experience,
      specialties,
      introduction: introduction || '',
      merchant: merchant._id,
    });

    res.status(201).json({
      success: true,
      message: '添加成功',
      data: designer,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '添加设计师失败',
    });
  }
};

// 获取我的设计师列表
export const getMyDesigners = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // 获取商家信息
    const merchant = await Merchant.findOne({ user: req.userId });

    if (!merchant) {
      throw new AppError('商家信息不存在', 404);
    }

    const designers = await Designer.find({ merchant: merchant._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: designers,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取设计师列表失败',
    });
  }
};

// 更新设计师信息
export const updateDesigner = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, avatar, title, experience, specialties, introduction } = req.body;

    const designer = await Designer.findById(id);

    if (!designer) {
      throw new AppError('设计师不存在', 404);
    }

    // 验证权限
    const merchant = await Merchant.findOne({ user: req.userId });
    if (!merchant || designer.merchant.toString() !== merchant._id.toString()) {
      throw new AppError('无权修改此设计师', 403);
    }

    // 更新字段
    if (name) designer.name = name;
    if (avatar) designer.avatar = avatar;
    if (title) designer.title = title;
    if (experience !== undefined) designer.experience = experience;
    if (specialties) designer.specialties = specialties;
    if (introduction !== undefined) designer.introduction = introduction;

    await designer.save();

    res.status(200).json({
      success: true,
      message: '更新成功',
      data: designer,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '更新设计师失败',
    });
  }
};

// 删除设计师
export const deleteDesigner = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const designer = await Designer.findById(id);

    if (!designer) {
      throw new AppError('设计师不存在', 404);
    }

    // 验证权限
    const merchant = await Merchant.findOne({ user: req.userId });
    if (!merchant || designer.merchant.toString() !== merchant._id.toString()) {
      throw new AppError('无权删除此设计师', 403);
    }

    await designer.deleteOne();

    res.status(200).json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '删除设计师失败',
    });
  }
};
