import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  nickname: string;
  avatar?: string;
  phone?: string;
  openid?: string;
  password?: string;
  gender?: 'male' | 'female' | 'unknown';
  region?: string;
  signature?: string;
  role: 'user' | 'merchant' | 'admin';
  merchantId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    nickname: {
      type: String,
      required: [true, '昵称不能为空'],
      trim: true,
      maxlength: [50, '昵称最多50个字符'],
    },
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      match: [/^1[3-9]\d{9}$/, '手机号格式不正确'],
    },
    openid: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      select: false, // 默认查询时不返回密码字段
      minlength: [6, '密码至少6个字符'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'unknown'],
      default: 'unknown',
    },
    region: {
      type: String,
      default: '',
    },
    signature: {
      type: String,
      maxlength: [200, '个性签名最多200个字符'],
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'merchant', 'admin'],
      default: 'user',
    },
    merchantId: {
      type: Schema.Types.ObjectId,
      ref: 'Merchant',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// 索引
UserSchema.index({ phone: 1 });
UserSchema.index({ openid: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ merchantId: 1 });

// Pre-save 钩子：密码加密
UserSchema.pre('save', async function (next) {
  // 只有在密码被修改时才加密
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// 方法：比较密码
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
