import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  participants: {
    userId: mongoose.Types.ObjectId;
    userType: 'user' | 'merchant' | 'designer';
    lastReadAt: Date;
  }[];
  lastMessage?: {
    content: string;
    senderId: mongoose.Types.ObjectId;
    createdAt: Date;
  };
  caseId?: mongoose.Types.ObjectId;
  designerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        userType: {
          type: String,
          enum: ['user', 'merchant', 'designer'],
          required: true,
        },
        lastReadAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastMessage: {
      content: String,
      senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      createdAt: Date,
    },
    caseId: {
      type: Schema.Types.ObjectId,
      ref: 'Case',
    },
    designerId: {
      type: Schema.Types.ObjectId,
      ref: 'Designer',
    },
  },
  {
    timestamps: true,
  }
);

// 索引
ConversationSchema.index({ 'participants.userId': 1, updatedAt: -1 });
ConversationSchema.index({ caseId: 1 });
ConversationSchema.index({ designerId: 1 });

export default mongoose.model<IConversation>('Conversation', ConversationSchema);
