import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import logger from './logger';

interface SocketUser {
  userId: string;
  socketId: string;
}

// 在线用户映射
const onlineUsers = new Map<string, string>();

// Socket.io 认证中间件
const socketAuth = async (socket: Socket, next: any) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('认证失败'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      userId: string;
    };

    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new Error('用户不存在'));
    }

    // 将用户信息附加到 socket
    (socket as any).userId = user._id.toString();
    (socket as any).user = user;

    next();
  } catch (error) {
    next(new Error('认证失败'));
  }
};

// 初始化 Socket.io
export const initSocket = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      credentials: true,
    },
  });

  // 使用认证中间件
  io.use(socketAuth);

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    const user = (socket as any).user;

    logger.info(`用户 ${user.nickname} (${userId}) 已连接`);

    // 添加到在线用户列表
    onlineUsers.set(userId, socket.id);

    // 加入个人房间
    socket.join(userId);

    // 发送在线状态
    socket.emit('online', { userId });

    // 发送连接成功消息
    socket.emit('connected', {
      message: '连接成功',
      userId,
    });

    // 监听加入会话
    socket.on('join_conversation', async (data: { conversationId: string }) => {
      const { conversationId } = data;

      try {
        // 验证用户是否是该会话的参与者
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
          socket.emit('error', { message: '会话不存在' });
          return;
        }

        const isParticipant = conversation.participants.some(
          (p) => p.userId.toString() === userId
        );

        if (!isParticipant) {
          socket.emit('error', { message: '无权访问该会话' });
          return;
        }

        // 加入会话房间
        socket.join(conversationId);

        socket.emit('joined_conversation', { conversationId });
      } catch (error) {
        socket.emit('error', { message: '加入会话失败' });
      }
    });

    // 监听发送消息
    socket.on('send_message', async (data: {
      conversationId: string;
      receiverId: string;
      content: string;
      messageType?: 'text' | 'image' | 'file';
      fileUrl?: string;
    }) => {
      try {
        const { conversationId, receiverId, content, messageType, fileUrl } = data;

        // 查找或创建会话
        let conversation = await Conversation.findById(conversationId);

        if (!conversation) {
          // 创建新会话
          conversation = await Conversation.create({
            participants: [
              { userId, userType: user.role },
              { userId: receiverId, userType: 'user' },
            ],
          });
        }

        // 创建消息
        const message = await Message.create({
          conversationId: conversation._id,
          sender: userId,
          senderType: user.role,
          receiver: receiverId,
          receiverType: 'user',
          content,
          messageType: messageType || 'text',
          fileUrl: fileUrl || '',
        });

        // 更新会话的最后消息
        conversation.lastMessage = {
          content,
          senderId: userId as any,
          createdAt: new Date(),
        };
        await conversation.save();

        // 填充发送者信息
        await message.populate('sender', 'nickname avatar');

        // 发送给发送者
        socket.emit('message_sent', {
          message,
          conversationId: conversation._id,
        });

        // 发送给接收者（如果在线）
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_message', {
            message,
            conversationId: conversation._id,
          });
        }

        // 发送到会话房间
        socket.to(conversation._id.toString()).emit('new_message', {
          message,
          conversationId: conversation._id,
        });
      } catch (error) {
        logger.error('发送消息错误', error);
        socket.emit('error', { message: '发送消息失败' });
      }
    });

    // 监听标记消息已读
    socket.on('mark_read', async (data: { conversationId: string }) => {
      try {
        const { conversationId } = data;

        // 更新未读消息为已读
        await Message.updateMany(
          {
            conversationId,
            receiver: userId,
            isRead: false,
          },
          {
            isRead: true,
          }
        );

        // 更新会话的最后阅读时间
        await Conversation.findOneAndUpdate(
          {
            _id: conversationId,
            'participants.userId': userId,
          },
          {
            $set: {
              'participants.$.lastReadAt': new Date(),
            },
          }
        );

        socket.emit('marked_read', { conversationId });
      } catch (error) {
        socket.emit('error', { message: '标记已读失败' });
      }
    });

    // 监听正在输入
    socket.on('typing', (data: { conversationId: string; receiverId: string }) => {
      const { conversationId, receiverId } = data;
      const receiverSocketId = onlineUsers.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          conversationId,
          userId,
          nickname: user.nickname,
        });
      }
    });

    // 监听停止输入
    socket.on('stop_typing', (data: { conversationId: string; receiverId: string }) => {
      const { conversationId, receiverId } = data;
      const receiverSocketId = onlineUsers.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_stop_typing', {
          conversationId,
          userId,
        });
      }
    });

    // 断开连接
    socket.on('disconnect', () => {
      logger.info(`用户 ${user.nickname} (${userId}) 已断开连接`);
      onlineUsers.delete(userId);
      io.emit('offline', { userId });
    });
  });

  return io;
};

export default initSocket;
