import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

interface Designer {
  id: number
  avatar: string
  name: string
  title: string
  experience: string
  caseCount: number
  styles: string[]
  rating: number
}

export default function Designers() {
  const [designers] = useState<Designer[]>([
    {
      id: 1,
      avatar: 'https://via.placeholder.com/120x120/667eea/ffffff?text=张',
      name: '张设计师',
      title: '首席设计师',
      experience: '10年经验',
      caseCount: 156,
      styles: ['现代简约', '北欧风', '轻奢'],
      rating: 4.9
    },
    {
      id: 2,
      avatar: 'https://via.placeholder.com/120x120/764ba2/ffffff?text=李',
      name: '李设计师',
      title: '高级设计师',
      experience: '8年经验',
      caseCount: 128,
      styles: ['新中式', '中式', '禅意'],
      rating: 4.8
    },
    {
      id: 3,
      avatar: 'https://via.placeholder.com/120x120/f093fb/ffffff?text=王',
      name: '王设计师',
      title: '资深设计师',
      experience: '12年经验',
      caseCount: 203,
      styles: ['欧式', '美式', '法式'],
      rating: 5.0
    },
    {
      id: 4,
      avatar: 'https://via.placeholder.com/120x120/4facfe/ffffff?text=赵',
      name: '赵设计师',
      title: '高级设计师',
      experience: '7年经验',
      caseCount: 98,
      styles: ['工业风', 'LOFT', '混搭'],
      rating: 4.7
    },
    {
      id: 5,
      avatar: 'https://via.placeholder.com/120x120/00f2fe/ffffff?text=刘',
      name: '刘设计师',
      title: '首席设计师',
      experience: '15年经验',
      caseCount: 267,
      styles: ['现代', '简约', '极简'],
      rating: 4.9
    },
    {
      id: 6,
      avatar: 'https://via.placeholder.com/120x120/43e97b/ffffff?text=陈',
      name: '陈设计师',
      title: '资深设计师',
      experience: '9年经验',
      caseCount: 134,
      styles: ['田园', '地中海', '美式乡村'],
      rating: 4.8
    }
  ])

  const handleDesignerDetail = (designerId: number) => {
    Taro.showToast({
      title: `查看设计师 ${designerId} 详情`,
      icon: 'none',
      duration: 1500
    })
  }

  const handleConsult = (designerId: number) => {
    Taro.showModal({
      title: '预约咨询',
      content: '确认要预约该设计师吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '预约成功',
            icon: 'success',
            duration: 2000
          })
        }
      }
    })
  }

  return (
    <View className='designers-page'>
      {/* 页面标题 */}
      <View className='page-header'>
        <View className='header-title'>明星设计师</View>
        <View className='header-desc'>为您匹配最合适的设计师</View>
      </View>

      {/* 设计师列表 */}
      <View className='designers-list'>
        {designers.map(designer => (
          <View
            key={designer.id}
            className='designer-card'
            onClick={() => handleDesignerDetail(designer.id)}
          >
            <View className='designer-header'>
              <Image src={designer.avatar} className='designer-avatar' mode='aspectFill' />
              <View className='designer-info'>
                <View className='designer-name'>{designer.name}</View>
                <View className='designer-meta'>
                  <Text className='meta-text'>{designer.title}</Text>
                  <Text className='meta-divider'>|</Text>
                  <Text className='meta-text'>{designer.experience}</Text>
                </View>
                <View className='designer-stats'>
                  <View className='stat-item'>
                    <Text className='stat-value'>{designer.caseCount}</Text>
                    <Text className='stat-label'>案例</Text>
                  </View>
                  <View className='stat-item'>
                    <Text className='stat-value'>{designer.rating}</Text>
                    <Text className='stat-label'>评分</Text>
                  </View>
                </View>
              </View>
            </View>

            <View className='designer-styles'>
              <Text className='styles-label'>擅长风格：</Text>
              {designer.styles.map((style, index) => (
                <Text key={index} className='style-tag'>{style}</Text>
              ))}
            </View>

            <View className='designer-footer'>
              <View
                className='consult-btn'
                onClick={(e) => {
                  e.stopPropagation()
                  handleConsult(designer.id)
                }}
              >
                预约咨询
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
