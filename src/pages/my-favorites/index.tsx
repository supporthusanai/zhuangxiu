import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import {
  getFavoriteCases,
  getFavoriteDesigners,
  removeFavoriteCase,
  removeFavoriteDesigner,
  type FavoriteCase,
  type FavoriteDesigner
} from '@/utils/favorite'
import './index.scss'

type TabType = 'cases' | 'designers'

export default function MyFavorites() {
  const [activeTab, setActiveTab] = useState<TabType>('cases')
  const [favoriteCases, setFavoriteCases] = useState<FavoriteCase[]>([])
  const [favoriteDesigners, setFavoriteDesigners] = useState<FavoriteDesigner[]>([])

  useEffect(() => {
    loadFavorites()
  }, [])

  // 页面显示时重新加载
  useEffect(() => {
    Taro.useDidShow(() => {
      loadFavorites()
    })
  }, [])

  const loadFavorites = () => {
    setFavoriteCases(getFavoriteCases())
    setFavoriteDesigners(getFavoriteDesigners())
  }

  const handleCaseDetail = (caseId: number) => {
    Taro.navigateTo({
      url: `/pages/case-detail/index?id=${caseId}`
    })
  }

  const handleDesignerDetail = (designerId: number) => {
    Taro.navigateTo({
      url: `/pages/designer-detail/index?id=${designerId}`
    })
  }

  const handleRemoveCase = (caseId: number, e: any) => {
    e.stopPropagation()
    Taro.showModal({
      title: '提示',
      content: '确认取消收藏该案例吗？',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          const success = removeFavoriteCase(caseId)
          if (success) {
            setFavoriteCases(favoriteCases.filter(item => item.id !== caseId))
            Taro.showToast({
              title: '已取消收藏',
              icon: 'success',
              duration: 1500
            })
          }
        }
      }
    })
  }

  const handleRemoveDesigner = (designerId: number, e: any) => {
    e.stopPropagation()
    Taro.showModal({
      title: '提示',
      content: '确认取消收藏该设计师吗？',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          const success = removeFavoriteDesigner(designerId)
          if (success) {
            setFavoriteDesigners(favoriteDesigners.filter(item => item.id !== designerId))
            Taro.showToast({
              title: '已取消收藏',
              icon: 'success',
              duration: 1500
            })
          }
        }
      }
    })
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (24 * 3600 * 1000))

    if (days === 0) {
      return '今天'
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }
  }

  return (
    <View className='my-favorites-page'>
      {/* Tab切换 */}
      <View className='tabs-bar'>
        <View
          className={`tab-item ${activeTab === 'cases' ? 'active' : ''}`}
          onClick={() => setActiveTab('cases')}
        >
          <Text className='tab-text'>案例收藏</Text>
          {favoriteCases.length > 0 && (
            <Text className='tab-count'>({favoriteCases.length})</Text>
          )}
        </View>
        <View
          className={`tab-item ${activeTab === 'designers' ? 'active' : ''}`}
          onClick={() => setActiveTab('designers')}
        >
          <Text className='tab-text'>设计师收藏</Text>
          {favoriteDesigners.length > 0 && (
            <Text className='tab-count'>({favoriteDesigners.length})</Text>
          )}
        </View>
      </View>

      {/* 案例列表 */}
      {activeTab === 'cases' && (
        <View className='cases-list'>
          {favoriteCases.map(item => (
            <View
              key={item.id}
              className='case-item'
              onClick={() => handleCaseDetail(item.id)}
            >
              <Image src={item.image} className='case-image' mode='aspectFill' />
              <View className='case-info'>
                <View className='case-title'>{item.title}</View>
                <View className='case-meta'>
                  <Text className='meta-item'>{item.style}</Text>
                  <Text className='meta-divider'>·</Text>
                  <Text className='meta-item'>{item.area}</Text>
                  <Text className='meta-divider'>·</Text>
                  <Text className='meta-item'>{item.price}</Text>
                </View>
                <View className='case-footer'>
                  <Text className='favorite-time'>收藏于 {formatDate(item.favoriteTime)}</Text>
                  <View
                    className='remove-btn'
                    onClick={(e) => handleRemoveCase(item.id, e)}
                  >
                    取消收藏
                  </View>
                </View>
              </View>
            </View>
          ))}

          {/* 空状态 */}
          {favoriteCases.length === 0 && (
            <View className='empty-state'>
              <Text className='empty-icon'>❤️</Text>
              <Text className='empty-text'>还没有收藏案例</Text>
              <View
                className='empty-btn'
                onClick={() => Taro.switchTab({ url: '/pages/cases/index' })}
              >
                去看看
              </View>
            </View>
          )}
        </View>
      )}

      {/* 设计师列表 */}
      {activeTab === 'designers' && (
        <View className='designers-list'>
          {favoriteDesigners.map(item => (
            <View
              key={item.id}
              className='designer-item'
              onClick={() => handleDesignerDetail(item.id)}
            >
              <Image src={item.avatar} className='designer-avatar' mode='aspectFill' />
              <View className='designer-info'>
                <View className='designer-name'>{item.name}</View>
                <View className='designer-meta'>
                  <Text className='meta-text'>{item.title}</Text>
                  <Text className='meta-divider'>·</Text>
                  <Text className='meta-text'>{item.experience}</Text>
                </View>
                <View className='designer-stats'>
                  <Text className='stat-text'>{item.caseCount} 案例</Text>
                  <Text className='stat-divider'>|</Text>
                  <Text className='stat-text'>{item.rating} 评分</Text>
                </View>
                <Text className='favorite-time'>收藏于 {formatDate(item.favoriteTime)}</Text>
              </View>
              <View
                className='remove-btn'
                onClick={(e) => handleRemoveDesigner(item.id, e)}
              >
                取消
              </View>
            </View>
          ))}

          {/* 空状态 */}
          {favoriteDesigners.length === 0 && (
            <View className='empty-state'>
              <Text className='empty-icon'>👨‍🎨</Text>
              <Text className='empty-text'>还没有收藏设计师</Text>
              <View
                className='empty-btn'
                onClick={() => Taro.switchTab({ url: '/pages/designers/index' })}
              >
                去看看
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  )
}
