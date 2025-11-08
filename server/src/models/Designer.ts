import mongoose, { Schema, Document } from 'mongoose';

export interface IDesigner extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  avatar: string;
  title: string;
  experience: number;
  specialties: string[];
  introduction: string;
  caseCount: number;
  rating: number;
  ratingCount: number;
  merchant: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DesignerSchema = new Schema<IDesigner>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '用户ID不能为空'],
    },
    name: {
      type: String,
      required: [true, '姓名不能为空'],
      trim: true,
      maxlength: [50, '姓名最多50个字符'],
    },
    avatar: {
      type: String,
      required: [true, '头像不能为空'],
    },
    title: {
      type: String,
      required: [true, '职称不能为空'],
      enum: [
        '助理设计师',
        '设计师',
        '高级设计师',
        '资深设计师',
        '主任设计师',
        '首席设计师',
        '设计总监',
      ],
    },
    experience: {
      type: Number,
      required: [true, '工作年限不能为空'],
      min: [0, '工作年限不能为负数'],
    },
    specialties: {
      type: [String],
      required: [true, '擅长风格不能为空'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: '至少需要一个擅长风格',
      },
    },
    introduction: {
      type: String,
      default: '',
      maxlength: [1000, '简介最多1000个字符'],
    },
    caseCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: [0, '评分不能低于0'],
      max: [5, '评分不能高于5'],
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    merchant: {
      type: Schema.Types.ObjectId,
      ref: 'Merchant',
      required: [true, '商家不能为空'],
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
DesignerSchema.index({ merchant: 1 });
DesignerSchema.index({ rating: -1 });
DesignerSchema.index({ caseCount: -1 });
DesignerSchema.index({ specialties: 1 });

export default mongoose.model<IDesigner>('Designer', DesignerSchema);
