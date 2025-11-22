import { Router } from 'express';
import {
  getConversations,
  getConversation,
  getMessages,
  createConversation,
  deleteConversation,
  getUnreadCount,
  sendMessage,
  markMessagesRead,
} from '../controllers/chatController';
import { authenticate } from '../middleware/auth';

const router = Router();

// 所有聊天接口都需要认证
router.use(authenticate);

// 会话相关
router.get('/conversations', getConversations); // 获取会话列表
router.get('/conversations/:id', getConversation); // 获取会话详情
router.post('/conversations', createConversation); // 创建会话
router.delete('/conversations/:id', deleteConversation); // 删除会话

// 消息相关
router.get('/conversations/:conversationId/messages', getMessages); // 获取消息历史
router.post('/conversations/:conversationId/messages', sendMessage); // 发送消息
router.put('/conversations/:conversationId/read', markMessagesRead); // 标记已读
router.get('/unread-count', getUnreadCount); // 获取未读消息数

export default router;
