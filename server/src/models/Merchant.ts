import mongoose, { Schema, Document } from 'mongoose';

export interface IMerchant extends Document {
  user: mongoose.Types.ObjectId;
  companyName: string;
  businessLicense: string;
  contactPerson: string;
  contactPhone: string;
  address: string;
  description: string;
  logo?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MerchantSchema = new Schema<IMerchant>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '用户ID不能为空'],
      unique: true,
      index: true,
    },
    companyName: {
      type: String,
      required: [true, '公司名称不能为空'],
      trim: true,
      maxlength: [100, '公司名称最多100个字符'],
    },
    businessLicense: {
      type: String,
      required: [true, '营业执照不能为空'],
    },
    contactPerson: {
      type: String,
      required: [true, '联系人不能为空'],
      trim: true,
    },
    contactPhone: {
      type: String,
      required: [true, '联系电话不能为空'],
      match: [/^1[3-9]\d{9}$/, '手机号格式不正确'],
    },
    address: {
      type: String,
      required: [true, '地址不能为空'],
      maxlength: [200, '地址最多200个字符'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, '描述最多1000个字符'],
    },
    logo: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// 索引
MerchantSchema.index({ status: 1 });
MerchantSchema.index({ createdAt: -1 });

export default mongoose.model<IMerchant>('Merchant', MerchantSchema);
