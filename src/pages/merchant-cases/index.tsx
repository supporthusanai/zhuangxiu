import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

interface CaseItem {
  id: number
  title: string
  image: string
  status: 'published' | 'draft'
  views: number
  likes: number
  createdAt: string
}

export default function MerchantCases() {
  const [activeTab, setActiveTab] = useState('all')
  const [cases] = useState<CaseItem[]>([
    {
      id: 1,
      title: '现代简约 · 三居室',
      image: 'https://via.placeholder.com/340x240/667eea/ffffff?text=案例1',
      status: 'published',
      views: 1286,
      likes: 89,
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      title: '北欧风格 · 两居室',
      image: 'https://via.placeholder.com/340x240/764ba2/ffffff?text=案例2',
      status: 'published',
      views: 956,
      likes: 67,
      createdAt: '2024-01-10'
    },
    {
      id: 3,
      title: '新中式 · 四居室（草稿）',
      image: 'https://via.placeholder.com/340x240/f093fb/ffffff?text=草稿',
      status: 'draft',
      views: 0,
      likes: 0,
      createdAt: '2024-01-20'
    }
  ])

  const tabs = [
    { id: 'all', name: '全部', count: 3 },
    { id: 'published', name: '已发布', count: 2 },
    { id: 'draft', name: '草稿', count: 1 }
  ]

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  const handleAddCase = () => {
    Taro.navigateTo({
      url: '/pages/case-edit/index'
    })
  }

  const handleEditCase = (caseId: number) => {
    Taro.navigateTo({
      url: `/pages/case-edit/index?id=${caseId}`
    })
  }

  const handleDeleteCase = (caseId: number, title: string) => {
    Taro.showModal({
      title: '删除案例',
      content: `确定要删除「${title}」吗？`,
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          // 这里应该调用删除接口
          Taro.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 1500
          })
        }
      }
    })
  }

  const handlePublishCase = (caseId: number) => {
    Taro.showModal({
      title: '发布案例',
      content: '确定要发布该案例吗？',
      success: (res) => {
        if (res.confirm) {
          // 这里应该调用发布接口
          Taro.showToast({
            title: '发布成功',
            icon: 'success',
            duration: 1500
          })
        }
      }
    })
  }

  const filteredCases = cases.filter(item => {
    if (activeTab === 'all') return true
    return item.status === activeTab
  })

  return (
    <View className='merchant-cases-page'>
      {/* 标签栏 */}
      <View className='tabs-section'>
        {tabs.map(tab => (
          <View
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
          >
            <Text className='tab-name'>{tab.name}</Text>
            <Text className='tab-count'>({tab.count})</Text>
          </View>
        ))}
      </View>

      {/* 案例列表 */}
      <View className='cases-list'>
        {filteredCases.map(item => (
          <View key={item.id} className='case-card'>
            <Image src={item.image} className='case-image' mode='aspectFill' />
            <View className='case-info'>
              <View className='case-header'>
                <View className='case-title'>{item.title}</View>
                {item.status === 'draft' && (
                  <View className='status-badge draft'>草稿</View>
                )}
                {item.status === 'published' && (
                  <View className='status-badge published'>已发布</View>
                )}
              </View>

              <View className='case-stats'>
                <View className='stat-item'>
                  <Text className='stat-icon'>👁</Text>
                  <Text className='stat-value'>{item.views}</Text>
                </View>
                <View className='stat-item'>
                  <Text className='stat-icon'>❤️</Text>
                  <Text className='stat-value'>{item.likes}</Text>
                </View>
                <View className='stat-item'>
                  <Text className='stat-label'>发布时间：</Text>
                  <Text className='stat-value'>{item.createdAt}</Text>
                </View>
              </View>

              <View className='case-actions'>
                <View className='action-btn' onClick={() => handleEditCase(item.id)}>
                  <Text className='action-icon'>✏️</Text>
                  <Text className='action-text'>编辑</Text>
                </View>
                {item.status === 'draft' && (
                  <View className='action-btn' onClick={() => handlePublishCase(item.id)}>
                    <Text className='action-icon'>📤</Text>
                    <Text className='action-text'>发布</Text>
                  </View>
                )}
                <View className='action-btn danger' onClick={() => handleDeleteCase(item.id, item.title)}>
                  <Text className='action-icon'>🗑</Text>
                  <Text className='action-text'>删除</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* 浮动添加按钮 */}
      <View className='float-add-btn' onClick={handleAddCase}>
        <Text className='add-icon'>+</Text>
      </View>
    </View>
  )
}
