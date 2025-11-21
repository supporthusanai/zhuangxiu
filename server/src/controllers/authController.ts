import { Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { wechatLogin as wechatLoginApi, getPhoneNumber } from '../utils/wechat';
import { sendSmsCode, verifySmsCode, validatePhone } from '../utils/sms';
import logger from '../config/logger';

// 获取 JWT 密钥（生产环境必须配置）
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'secret') {
    if (process.env.NODE_ENV === 'production') {
      logger.error('JWT_SECRET 未配置或使用了默认值，生产环境不允许启动！');
      throw new Error('JWT_SECRET must be configured in production');
    }
    logger.warn('警告：JWT_SECRET 使用了默认值，仅限开发环境使用！');
    return 'dev-secret-change-in-production';
  }
  return secret;
};

// 生成 JWT Token
const generateToken = (userId: string): string => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    { userId },
    getJwtSecret(),
    { expiresIn } as jwt.SignOptions
  );
};

// 微信小程序登录
export const wechatLogin = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { code, userInfo } = req.body;

    if (!code) {
      throw new AppError('code 不能为空', 400);
    }

    // 调用微信 API 获取 openid 和 session_key
    const wechatResult = await wechatLoginApi(code);

    if (!wechatResult.openid) {
      throw new AppError('微信登录失败', 400);
    }

    const openid = wechatResult.openid;

    // 查找或创建用户
    let user = await User.findOne({ openid });

    if (!user) {
      // 创建新用户
      user = await User.create({
        openid,
        nickname: userInfo?.nickname || '微信用户',
        avatar: userInfo?.avatar || '',
        gender: userInfo?.gender || 'unknown',
      });
    } else {
      // 更新用户信息
      if (userInfo) {
        user.nickname = userInfo.nickname || user.nickname;
        user.avatar = userInfo.avatar || user.avatar;
        user.gender = userInfo.gender || user.gender;
        await user.save();
      }
    }

    // 生成 token
    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user._id,
          nickname: user.nickname,
          avatar: user.avatar,
          gender: user.gender,
          region: user.region,
          signature: user.signature,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '登录失败',
    });
  }
};

// 发送短信验证码
export const sendVerifyCode = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { phone } = req.body;

    if (!phone) {
      throw new AppError('手机号不能为空', 400);
    }

    if (!validatePhone(phone)) {
      throw new AppError('手机号格式不正确', 400);
    }

    const result = await sendSmsCode(phone);

    if (!result.success) {
      throw new AppError(result.message, 400);
    }

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '发送验证码失败',
    });
  }
};

// 手机号登录
export const phoneLogin = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      throw new AppError('手机号和验证码不能为空', 400);
    }

    if (!validatePhone(phone)) {
      throw new AppError('手机号格式不正确', 400);
    }

    // 验证短信验证码
    const isValid = await verifySmsCode(phone, code);
    if (!isValid) {
      throw new AppError('验证码错误或已过期', 400);
    }

    // 查找或创建用户
    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        phone,
        nickname: `用户${phone.slice(-4)}`,
      });
    }

    // 生成 token
    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user._id,
          nickname: user.nickname,
          avatar: user.avatar,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '登录失败',
    });
  }
};

// 获取当前用户信息
export const getCurrentUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
        gender: user.gender,
        region: user.region,
        signature: user.signature,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取用户信息失败',
    });
  }
};

// 更新用户信息
export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { nickname, avatar, gender, region, signature } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    // 更新允许修改的字段
    if (nickname) user.nickname = nickname;
    if (avatar) user.avatar = avatar;
    if (gender) user.gender = gender;
    if (region !== undefined) user.region = region;
    if (signature !== undefined) user.signature = signature;

    await user.save();

    res.status(200).json({
      success: true,
      message: '更新成功',
      data: {
        id: user._id,
        nickname: user.nickname,
        avatar: user.avatar,
        gender: user.gender,
        region: user.region,
        signature: user.signature,
      },
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '更新用户信息失败',
    });
  }
};

// 获取微信手机号
export const getWechatPhone = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { code } = req.body;

    if (!code) {
      throw new AppError('code 不能为空', 400);
    }

    // 调用微信 API 获取手机号
    const phoneNumber = await getPhoneNumber(code);

    if (!phoneNumber) {
      throw new AppError('获取手机号失败', 400);
    }

    // 更新用户手机号
    const user = await User.findById(req.userId);

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    user.phone = phoneNumber;
    await user.save();

    res.status(200).json({
      success: true,
      message: '获取手机号成功',
      data: {
        phone: phoneNumber,
      },
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取手机号失败',
    });
  }
};
