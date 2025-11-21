import { Response } from 'express';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

// 获取会话列表
export const getConversations = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const conversations = await Conversation.find({
      'participants.userId': req.userId,
    })
      .populate('participants.userId', 'nickname avatar')
      .populate('lastMessage.senderId', 'nickname avatar')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // 计算每个会话的未读消息数
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          receiver: req.userId,
          isRead: false,
        });

        return {
          ...conv.toObject(),
          unreadCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: conversationsWithUnread,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取会话列表失败',
    });
  }
};

// 获取会话详情
export const getConversation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findById(id).populate(
      'participants.userId',
      'nickname avatar'
    );

    if (!conversation) {
      throw new AppError('会话不存在', 404);
    }

    // 验证是否是参与者
    const isParticipant = conversation.participants.some(
      (p) => p.userId._id.toString() === req.userId
    );

    if (!isParticipant) {
      throw new AppError('无权访问该会话', 403);
    }

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取会话详情失败',
    });
  }
};

// 获取消息历史
export const getMessages = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // 验证会话权限
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new AppError('会话不存在', 404);
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId.toString() === req.userId
    );

    if (!isParticipant) {
      throw new AppError('无权访问该会话', 403);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [messages, total] = await Promise.all([
      Message.find({ conversationId })
        .populate('sender', 'nickname avatar')
        .populate('receiver', 'nickname avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Message.countDocuments({ conversationId }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(), // 返回时按时间正序
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取消息历史失败',
    });
  }
};

// 创建会话
export const createConversation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { receiverId, caseId, designerId } = req.body;

    if (!receiverId) {
      throw new AppError('接收者ID不能为空', 400);
    }

    // 检查是否已存在会话
    const existingConversation = await Conversation.findOne({
      $and: [
        { 'participants.userId': req.userId },
        { 'participants.userId': receiverId },
      ],
    });

    if (existingConversation) {
      res.status(200).json({
        success: true,
        data: existingConversation,
        message: '会话已存在',
      });
      return;
    }

    // 创建新会话
    const conversation = await Conversation.create({
      participants: [
        { userId: req.userId, userType: 'user' },
        { userId: receiverId, userType: 'user' },
      ],
      caseId: caseId || undefined,
      designerId: designerId || undefined,
    });

    await conversation.populate('participants.userId', 'nickname avatar');

    res.status(201).json({
      success: true,
      message: '创建成功',
      data: conversation,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '创建会话失败',
    });
  }
};

// 删除会话
export const deleteConversation = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findById(id);

    if (!conversation) {
      throw new AppError('会话不存在', 404);
    }

    // 验证权限
    const isParticipant = conversation.participants.some(
      (p) => p.userId.toString() === req.userId
    );

    if (!isParticipant) {
      throw new AppError('无权删除该会话', 403);
    }

    // 删除会话和相关消息
    await Promise.all([
      conversation.deleteOne(),
      Message.deleteMany({ conversationId: id }),
    ]);

    res.status(200).json({
      success: true,
      message: '删除成功',
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '删除会话失败',
    });
  }
};

// 发送消息
export const sendMessage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { content, type = 'text', mediaUrl } = req.body;

    if (!content && !mediaUrl) {
      throw new AppError('消息内容不能为空', 400);
    }

    // 验证会话权限
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new AppError('会话不存在', 404);
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId.toString() === req.userId
    );
    if (!isParticipant) {
      throw new AppError('无权在该会话中发送消息', 403);
    }

    // 获取接收者
    const receiver = conversation.participants.find(
      (p) => p.userId.toString() !== req.userId
    );

    if (!receiver) {
      throw new AppError('找不到接收者', 400);
    }

    // 创建消息
    const message = await Message.create({
      conversationId,
      sender: req.userId,
      receiver: receiver.userId,
      content,
      type,
      mediaUrl,
    });

    // 更新会话的最后消息
    conversation.lastMessage = {
      content: type === 'text' ? content : `[${type === 'image' ? '图片' : '文件'}]`,
      senderId: req.user!._id,
      createdAt: new Date(),
    };
    await conversation.save();

    await message.populate('sender', 'nickname avatar');

    res.status(201).json({
      success: true,
      message: '发送成功',
      data: message,
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '发送消息失败',
    });
  }
};

// 标记消息已读
export const markMessagesRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { conversationId } = req.params;

    // 验证会话权限
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new AppError('会话不存在', 404);
    }

    const isParticipant = conversation.participants.some(
      (p) => p.userId.toString() === req.userId
    );
    if (!isParticipant) {
      throw new AppError('无权访问该会话', 403);
    }

    // 标记所有发给当前用户的消息为已读
    await Message.updateMany(
      {
        conversationId,
        receiver: req.userId,
        isRead: false,
      },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: '标记成功',
    });
  } catch (error) {
    res.status(error instanceof AppError ? error.statusCode : 500).json({
      success: false,
      message: error instanceof Error ? error.message : '标记失败',
    });
  }
};

// 获取未读消息数
export const getUnreadCount = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const count = await Message.countDocuments({
      receiver: req.userId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: {
        unreadCount: count,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '获取未读消息数失败',
    });
  }
};
