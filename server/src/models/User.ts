import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  nickname: string;
  avatar?: string;
  phone?: string;
  openid?: string;
  gender?: 'male' | 'female' | 'unknown';
  region?: string;
  signature?: string;
  role: 'user' | 'merchant' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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

// 注：当前系统使用微信登录和手机验证码登录，不需要密码字段
// 如果后续需要密码登录功能，请添加 password 字段并实现相关逻辑

export default mongoose.model<IUser>('User', UserSchema);
