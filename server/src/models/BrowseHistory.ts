import mongoose, { Schema, Document } from 'mongoose';

export interface IBrowseHistory extends Document {
  user: mongoose.Types.ObjectId;
  targetType: 'case' | 'designer';
  targetId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const BrowseHistorySchema = new Schema<IBrowseHistory>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '用户ID不能为空'],
      index: true,
    },
    targetType: {
      type: String,
      required: [true, '浏览类型不能为空'],
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

// 索引
BrowseHistorySchema.index({ user: 1, createdAt: -1 });
BrowseHistorySchema.index({ user: 1, targetType: 1, targetId: 1 });
BrowseHistorySchema.index({ createdAt: -1 });

// TTL索引：30天后自动删除
BrowseHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.model<IBrowseHistory>('BrowseHistory', BrowseHistorySchema);
