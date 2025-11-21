import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

interface Consultation {
  id: string
  designerId: string
  designerName: string
  designerAvatar: string
  lastMessage: string
  time: string
  unreadCount: number
  caseTitle?: string
}

export default function MyConsultations() {
  const [consultations] = useState<Consultation[]>([
    {
      id: '1',
      designerId: '1',
      designerName: '张设计师',
      designerAvatar: 'https://via.placeholder.com/80x80/667eea/ffffff?text=张',
      lastMessage: '好的，我会尽快给您出一份设计方案',
      time: '今天 14:30',
      unreadCount: 2,
      caseTitle: '现代简约 · 三居室'
    },
    {
      id: '2',
      designerId: '2',
      designerName: '李设计师',
      designerAvatar: 'https://via.placeholder.com/80x80/764ba2/ffffff?text=李',
      lastMessage: '这个预算是可以做的，我们可以约个时间详谈',
      time: '昨天 10:15',
      unreadCount: 0,
      caseTitle: '北欧风格 · 两居室'
    },
    {
      id: '3',
      designerId: '3',
      designerName: '王设计师',
      designerAvatar: 'https://via.placeholder.com/80x80/f093fb/ffffff?text=王',
      lastMessage: '感谢您的咨询，期待为您服务',
      time: '3天前',
      unreadCount: 0
    },
    {
      id: '4',
      designerId: '0',
      designerName: '客服',
      designerAvatar: 'https://via.placeholder.com/80x80/4facfe/ffffff?text=客服',
      lastMessage: '您好，请问有什么可以帮到您的？',
      time: '1周前',
      unreadCount: 0
    }
  ])

  const handleChatClick = (consultation: Consultation) => {
    const caseParam = consultation.caseTitle ? `&caseTitle=${encodeURIComponent(consultation.caseTitle)}` : ''
    Taro.navigateTo({
      url: `/pages/chat/index?type=consultation&consultationId=${consultation.id}&designerId=${consultation.designerId}&designerName=${encodeURIComponent(consultation.designerName)}${caseParam}`
    })
  }

  /* TODO: Implement delete functionality when backend is ready
  const handleDelete = (consultationId: string, e: any) => {
    e.stopPropagation()
    Taro.showModal({
      title: '提示',
      content: '确认删除该咨询记录吗？',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          // Call API to delete consultation with consultationId
          Taro.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 1500
          })
        }
      }
    })
  }
  */

  const totalUnread = consultations.reduce((sum, item) => sum + item.unreadCount, 0)

  return (
    <View className='my-consultations-page'>
      {/* 统计信息 */}
      {totalUnread > 0 && (
        <View className='stats-bar'>
          <View className='stat-item'>
            <Text className='stat-value highlight'>{totalUnread}</Text>
            <Text className='stat-label'>条未读消息</Text>
          </View>
        </View>
      )}

      {/* 咨询列表 */}
      <View className='consultations-list'>
        {consultations.map(consultation => (
          <View
            key={consultation.id}
            className='consultation-item'
            onClick={() => handleChatClick(consultation)}
          >
            <Image
              src={consultation.designerAvatar}
              className='designer-avatar'
              mode='aspectFill'
            />
            <View className='consultation-content'>
              <View className='consultation-header'>
                <View className='designer-name'>{consultation.designerName}</View>
                <View className='consultation-time'>{consultation.time}</View>
              </View>
              {consultation.caseTitle && (
                <View className='case-tag'>
                  <Text className='tag-icon'>📸</Text>
                  <Text className='tag-text'>{consultation.caseTitle}</Text>
                </View>
              )}
              <View className='last-message'>
                {consultation.lastMessage}
              </View>
            </View>
            {consultation.unreadCount > 0 && (
              <View className='unread-badge'>
                {consultation.unreadCount > 99 ? '99+' : consultation.unreadCount}
              </View>
            )}
          </View>
        ))}
      </View>

      {/* 空状态 */}
      {consultations.length === 0 && (
        <View className='empty-state'>
          <Text className='empty-icon'>💬</Text>
          <Text className='empty-text'>暂无咨询记录</Text>
          <View className='empty-tip'>咨询设计师后，记录会显示在这里</View>
        </View>
      )}
    </View>
  )
}
