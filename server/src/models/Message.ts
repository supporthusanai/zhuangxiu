import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: string;
  sender: mongoose.Types.ObjectId;
  senderType: 'user' | 'merchant' | 'designer';
  receiver: mongoose.Types.ObjectId;
  receiverType: 'user' | 'merchant' | 'designer';
  content: string;
  messageType: 'text' | 'image' | 'file';
  fileUrl?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: String,
      required: [true, '会话ID不能为空'],
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '发送者不能为空'],
    },
    senderType: {
      type: String,
      enum: ['user', 'merchant', 'designer'],
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '接收者不能为空'],
    },
    receiverType: {
      type: String,
      enum: ['user', 'merchant', 'designer'],
      required: true,
    },
    content: {
      type: String,
      required: [true, '消息内容不能为空'],
      maxlength: [2000, '消息内容最多2000个字符'],
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text',
    },
    fileUrl: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 索引优化
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ receiver: 1, isRead: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
