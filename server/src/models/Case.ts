import mongoose, { Schema, Document } from 'mongoose';

export interface ICase extends Document {
  title: string;
  style: string;
  area: number;
  price: number;
  images: string[];
  description: string;
  tags: string[];
  rooms: string;
  floor: string;
  district: string;
  designer: mongoose.Types.ObjectId;
  merchant: mongoose.Types.ObjectId;
  status: 'draft' | 'published' | 'archived';
  viewCount: number;
  favoriteCount: number;
  isHot: boolean;
  isRecommended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CaseSchema = new Schema<ICase>(
  {
    title: {
      type: String,
      required: [true, '标题不能为空'],
      trim: true,
      maxlength: [100, '标题最多100个字符'],
    },
    style: {
      type: String,
      required: [true, '风格不能为空'],
      enum: [
        '现代简约',
        '北欧风格',
        '中式风格',
        '新中式',
        '欧式古典',
        '美式风格',
        '工业风格',
        '地中海',
        '日式风格',
        '轻奢风格',
        '田园风格',
        '混搭风格',
      ],
    },
    area: {
      type: Number,
      required: [true, '面积不能为空'],
      min: [0, '面积不能为负数'],
    },
    price: {
      type: Number,
      required: [true, '价格不能为空'],
      min: [0, '价格不能为负数'],
    },
    images: {
      type: [String],
      required: [true, '至少需要一张图片'],
      validate: {
        validator: (v: string[]) => v.length > 0 && v.length <= 20,
        message: '图片数量应在1-20张之间',
      },
    },
    description: {
      type: String,
      required: [true, '描述不能为空'],
      maxlength: [2000, '描述最多2000个字符'],
    },
    tags: {
      type: [String],
      default: [],
    },
    rooms: {
      type: String,
      required: [true, '户型不能为空'],
    },
    floor: {
      type: String,
      default: '',
    },
    district: {
      type: String,
      default: '',
    },
    designer: {
      type: Schema.Types.ObjectId,
      ref: 'Designer',
      required: [true, '设计师不能为空'],
    },
    merchant: {
      type: Schema.Types.ObjectId,
      ref: 'Merchant',
      required: [true, '商家不能为空'],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    favoriteCount: {
      type: Number,
      default: 0,
    },
    isHot: {
      type: Boolean,
      default: false,
    },
    isRecommended: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 索引
CaseSchema.index({ style: 1, status: 1 });
CaseSchema.index({ designer: 1 });
CaseSchema.index({ merchant: 1 });
CaseSchema.index({ viewCount: -1 });
CaseSchema.index({ favoriteCount: -1 });
CaseSchema.index({ createdAt: -1 });
CaseSchema.index({ area: 1, price: 1 });
CaseSchema.index({ status: 1, isHot: 1 });
CaseSchema.index({ status: 1, isRecommended: 1 });

// 全文搜索索引（支持中文搜索）
CaseSchema.index(
  { title: 'text', description: 'text', tags: 'text', style: 'text' },
  {
    weights: { title: 10, tags: 5, style: 3, description: 1 },
    default_language: 'none', // 禁用语言特定的词干分析，更适合中文
  }
);

export default mongoose.model<ICase>('Case', CaseSchema);
