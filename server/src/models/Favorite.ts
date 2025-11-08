import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
  user: mongoose.Types.ObjectId;
  targetType: 'case' | 'designer';
  targetId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '用户ID不能为空'],
      index: true,
    },
    targetType: {
      type: String,
      required: [true, '收藏类型不能为空'],
      enum: ['case', 'designer'],
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: [true, '目标ID不能为空'],
      refPath: 'targetType',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// 复合索引，确保用户不会重复收藏同一项
FavoriteSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });
FavoriteSchema.index({ targetType: 1, targetId: 1 });
FavoriteSchema.index({ createdAt: -1 });

export default mongoose.model<IFavorite>('Favorite', FavoriteSchema);
