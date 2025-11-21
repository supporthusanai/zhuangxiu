import mongoose, { Document, Schema } from 'mongoose';

export type ReviewTargetType = 'case' | 'merchant' | 'order';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  targetType: ReviewTargetType;
  targetId: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  rating: number;
  content: string;
  images: string[];
  tags: string[];
  isAnonymous: boolean;
  reply?: {
    content: string;
    createdAt: Date;
  };
  likes: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['case', 'merchant', 'order'],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'targetTypeRef',
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    content: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (v: string[]) => v.length <= 9,
        message: '最多上传9张图片',
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    reply: {
      content: String,
      createdAt: Date,
    },
    likes: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 虚拟字段用于动态引用
reviewSchema.virtual('targetTypeRef').get(function () {
  const typeMap: Record<string, string> = {
    case: 'Case',
    merchant: 'Merchant',
    order: 'Order',
  };
  return typeMap[this.targetType];
});

// 索引
reviewSchema.index({ user: 1, targetType: 1, targetId: 1 });
reviewSchema.index({ targetType: 1, targetId: 1, status: 1 });
reviewSchema.index({ createdAt: -1 });

// 静态方法：获取目标的平均评分
reviewSchema.statics.getAverageRating = async function (
  targetType: string,
  targetId: mongoose.Types.ObjectId
) {
  const result = await this.aggregate([
    { $match: { targetType, targetId, status: 'approved' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);
  return result[0] || { averageRating: 0, totalReviews: 0 };
};

export default mongoose.model<IReview>('Review', reviewSchema);
