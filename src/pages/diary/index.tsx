import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss'

export interface DiaryEntry {
  id: number
  title: string
  content: string
  images: string[]
  date: number
  tags: string[]
  progress: number
}

const DIARY_STORAGE_KEY = 'decorationDiary'

export default function Diary() {
  const [diaryList, setDiaryList] = useState<DiaryEntry[]>([])

  useEffect(() => {
    loadDiary()
  }, [])

  // 页面显示时重新加载
  useEffect(() => {
    Taro.useDidShow(() => {
      loadDiary()
    })
  }, [])

  const loadDiary = () => {
    try {
      const data = Taro.getStorageSync(DIARY_STORAGE_KEY)
      if (data) {
        const list = JSON.parse(data) as DiaryEntry[]
        // 按日期倒序排列
        list.sort((a, b) => b.date - a.date)
        setDiaryList(list)
      }
    } catch (error) {
      console.error('加载日记失败', error)
    }
  }

  const handleCreate = () => {
    Taro.navigateTo({
      url: '/pages/diary-edit/index'
    })
  }

  const handleEdit = (id: number) => {
    Taro.navigateTo({
      url: `/pages/diary-edit/index?id=${id}`
    })
  }

  const handleDelete = (id: number, e: any) => {
    e.stopPropagation()
    Taro.showModal({
      title: '提示',
      content: '确认删除这篇日记吗？',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          try {
            const newList = diaryList.filter(item => item.id !== id)
            Taro.setStorageSync(DIARY_STORAGE_KEY, JSON.stringify(newList))
            setDiaryList(newList)
            Taro.showToast({
              title: '删除成功',
              icon: 'success',
              duration: 1500
            })
          } catch (error) {
            console.error('删除失败', error)
            Taro.showToast({
              title: '删除失败',
              icon: 'none',
              duration: 1500
            })
          }
        }
      }
    })
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const days = Math.floor(diff / (24 * 3600 * 1000))

    if (days === 0) {
      const hours = Math.floor(diff / (3600 * 1000))
      if (hours === 0) {
        const minutes = Math.floor(diff / (60 * 1000))
        return minutes <= 0 ? '刚刚' : `${minutes}分钟前`
      }
      return `${hours}小时前`
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return formatDate(timestamp)
    }
  }

  return (
    <View className='diary-page'>
      {/* 头部统计 */}
      <View className='diary-header'>
        <View className='header-content'>
          <View className='header-title'>装修日记</View>
          <View className='header-subtitle'>记录装修点滴，留下美好回忆</View>
          <View className='header-stats'>
            <View className='stat-item'>
              <View className='stat-value'>{diaryList.length}</View>
              <View className='stat-label'>篇日记</View>
            </View>
            <View className='stat-divider'></View>
            <View className='stat-item'>
              <View className='stat-value'>
                {diaryList.length > 0 ? Math.max(...diaryList.map(d => d.progress)) : 0}%
              </View>
              <View className='stat-label'>总进度</View>
            </View>
          </View>
        </View>
      </View>

      {/* 日记列表 */}
      <View className='diary-list'>
        {diaryList.map(item => (
          <View
            key={item.id}
            className='diary-item'
            onClick={() => handleEdit(item.id)}
          >
            {/* 时间轴点 */}
            <View className='timeline-dot'></View>
            <View className='timeline-line'></View>

            <View className='diary-card'>
              {/* 日期和进度 */}
              <View className='diary-header-row'>
                <View className='diary-date'>
                  <Text className='date-icon'>📅</Text>
                  <Text className='date-text'>{getTimeAgo(item.date)}</Text>
                </View>
                <View className='diary-progress'>
                  <View className='progress-bar'>
                    <View
                      className='progress-fill'
                      style={`width: ${item.progress}%`}
                    ></View>
                  </View>
                  <Text className='progress-text'>{item.progress}%</Text>
                </View>
              </View>

              {/* 标题 */}
              <View className='diary-title'>{item.title}</View>

              {/* 标签 */}
              {item.tags.length > 0 && (
                <View className='diary-tags'>
                  {item.tags.map((tag, index) => (
                    <Text key={index} className='tag-item'>{tag}</Text>
                  ))}
                </View>
              )}

              {/* 内容 */}
              <View className='diary-content'>{item.content}</View>

              {/* 图片 */}
              {item.images.length > 0 && (
                <View className='diary-images'>
                  {item.images.slice(0, 3).map((image, index) => (
                    <Image
                      key={index}
                      src={image}
                      className='diary-image'
                      mode='aspectFill'
                    />
                  ))}
                  {item.images.length > 3 && (
                    <View className='more-images'>
                      <Text className='more-text'>+{item.images.length - 3}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* 操作栏 */}
              <View className='diary-actions'>
                <View className='action-btn edit' onClick={() => handleEdit(item.id)}>
                  <Text className='action-icon'>✏️</Text>
                  <Text className='action-text'>编辑</Text>
                </View>
                <View className='action-btn delete' onClick={(e) => handleDelete(item.id, e)}>
                  <Text className='action-icon'>🗑️</Text>
                  <Text className='action-text'>删除</Text>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* 空状态 */}
        {diaryList.length === 0 && (
          <View className='empty-state'>
            <Text className='empty-icon'>📔</Text>
            <Text className='empty-text'>还没有装修日记</Text>
            <Text className='empty-hint'>记录您的装修故事吧</Text>
          </View>
        )}
      </View>

      {/* 悬浮创建按钮 */}
      <View className='fab-btn' onClick={handleCreate}>
        <Text className='fab-icon'>✏️</Text>
      </View>
    </View>
  )
}
