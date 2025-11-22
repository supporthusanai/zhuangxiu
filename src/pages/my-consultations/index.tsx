import { View, Text, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { getConversations } from '@/services/api'
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
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)

  const loadConsultations = async () => {
    try {
      setLoading(true)
      const res = await getConversations()
      if (res.success && res.data) {
        const formatted = res.data.map((item: any) => ({
          id: item._id,
          designerId: item.participants?.find((p: any) => p._id !== item.currentUser)?.id || '',
          designerName: item.participants?.find((p: any) => p._id !== item.currentUser)?.nickname || '未知用户',
          designerAvatar: item.participants?.find((p: any) => p._id !== item.currentUser)?.avatar || '',
          lastMessage: item.lastMessage?.content || '',
          time: formatTime(item.updatedAt),
          unreadCount: item.unreadCount || 0,
          caseTitle: item.case?.title
        }))
        setConsultations(formatted)
      }
    } catch (error) {
      console.error('加载对话列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (24 * 3600 * 1000))

    if (days === 0) {
      return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }
  }

  useEffect(() => {
    loadConsultations()
  }, [])

  useDidShow(() => {
    loadConsultations()
  })

  const handleChatClick = (consultation: Consultation) => {
    const caseParam = consultation.caseTitle ? `&caseTitle=${encodeURIComponent(consultation.caseTitle)}` : ''
    Taro.navigateTo({
      url: `/pages/chat/index?type=consultation&consultationId=${consultation.id}&designerId=${consultation.designerId}&designerName=${encodeURIComponent(consultation.designerName)}${caseParam}`
    })
  }

  const totalUnread = consultations.reduce((sum, item) => sum + item.unreadCount, 0)

  if (loading) {
    return (
      <View className='my-consultations-page'>
        <View className='loading-state'>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

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
