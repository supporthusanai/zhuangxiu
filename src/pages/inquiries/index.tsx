import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

interface Inquiry {
  id: string
  userId: string
  userName: string
  userAvatar: string
  lastMessage: string
  unreadCount: number
  time: string
  caseTitle?: string
}

export default function Inquiries() {
  const [inquiries] = useState<Inquiry[]>([
    {
      id: '1',
      userId: '101',
      userName: '张三',
      userAvatar: 'https://via.placeholder.com/80x80/667eea/ffffff?text=张',
      lastMessage: '想咨询一下现代简约风格的装修',
      unreadCount: 2,
      time: '10:30',
      caseTitle: '现代简约 · 三居室'
    },
    {
      id: '2',
      userId: '102',
      userName: '李四',
      userAvatar: 'https://via.placeholder.com/80x80/764ba2/ffffff?text=李',
      lastMessage: '请问这个案例的预算是多少？',
      unreadCount: 1,
      time: '昨天',
      caseTitle: '北欧风格 · 两居室'
    },
    {
      id: '3',
      userId: '103',
      userName: '王五',
      userAvatar: 'https://via.placeholder.com/80x80/f093fb/ffffff?text=王',
      lastMessage: '好的，谢谢！',
      unreadCount: 0,
      time: '2天前',
      caseTitle: '新中式 · 四居室'
    },
    {
      id: '4',
      userId: '104',
      userName: '赵六',
      userAvatar: 'https://via.placeholder.com/80x80/4facfe/ffffff?text=赵',
      lastMessage: '能预约看看实际效果吗？',
      unreadCount: 0,
      time: '3天前'
    },
    {
      id: '5',
      userId: '105',
      userName: '刘七',
      userAvatar: 'https://via.placeholder.com/80x80/00f2fe/ffffff?text=刘',
      lastMessage: '你们的服务区域包括丰台区吗？',
      unreadCount: 0,
      time: '1周前'
    }
  ])

  const handleChatClick = (inquiry: Inquiry) => {
    Taro.navigateTo({
      url: `/pages/chat/index?userId=${inquiry.userId}&userName=${inquiry.userName}`
    })
  }

  const totalUnread = inquiries.reduce((sum, item) => sum + item.unreadCount, 0)

  return (
    <View className='inquiries-page'>
      {/* 统计信息 */}
      <View className='stats-bar'>
        <View className='stat-item'>
          <Text className='stat-value'>{inquiries.length}</Text>
          <Text className='stat-label'>总咨询</Text>
        </View>
        <View className='stat-divider' />
        <View className='stat-item'>
          <Text className='stat-value highlight'>{totalUnread}</Text>
          <Text className='stat-label'>未读消息</Text>
        </View>
      </View>

      {/* 咨询列表 */}
      <View className='inquiries-list'>
        {inquiries.map(inquiry => (
          <View
            key={inquiry.id}
            className='inquiry-item'
            onClick={() => handleChatClick(inquiry)}
          >
            <Image src={inquiry.userAvatar} className='user-avatar' mode='aspectFill' />
            <View className='inquiry-content'>
              <View className='inquiry-header'>
                <View className='user-name'>{inquiry.userName}</View>
                <View className='inquiry-time'>{inquiry.time}</View>
              </View>
              {inquiry.caseTitle && (
                <View className='case-tag'>
                  <Text className='tag-icon'>📸</Text>
                  <Text className='tag-text'>{inquiry.caseTitle}</Text>
                </View>
              )}
              <View className='inquiry-message'>
                {inquiry.lastMessage}
              </View>
            </View>
            {inquiry.unreadCount > 0 && (
              <View className='unread-badge'>
                {inquiry.unreadCount > 99 ? '99+' : inquiry.unreadCount}
              </View>
            )}
          </View>
        ))}
      </View>

      {/* 空状态 */}
      {inquiries.length === 0 && (
        <View className='empty-state'>
          <Text className='empty-icon'>💬</Text>
          <Text className='empty-text'>暂无咨询消息</Text>
        </View>
      )}
    </View>
  )
}
