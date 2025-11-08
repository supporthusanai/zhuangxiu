import mongoose, { Schema, Document } from 'mongoose';

export interface IDiary extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  content: string;
  images: string[];
  tags: string[];
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

const DiarySchema = new Schema<IDiary>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '用户ID不能为空'],
      index: true,
    },
    title: {
      type: String,
      required: [true, '标题不能为空'],
      trim: true,
      maxlength: [100, '标题最多100个字符'],
    },
    content: {
      type: String,
      required: [true, '内容不能为空'],
      maxlength: [2000, '内容最多2000个字符'],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 9,
        message: '图片最多9张',
      },
    },
    tags: {
      type: [String],
      default: [],
      enum: ['拆除', '水电', '泥瓦', '木工', '油漆', '安装', '软装', '验收', '其他'],
    },
    progress: {
      type: Number,
      required: [true, '进度不能为空'],
      min: [0, '进度不能低于0'],
      max: [100, '进度不能高于100'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// 索引
DiarySchema.index({ user: 1, createdAt: -1 });
DiarySchema.index({ progress: -1 });

export default mongoose.model<IDiary>('Diary', DiarySchema);
