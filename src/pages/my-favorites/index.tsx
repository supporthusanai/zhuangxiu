import { View, Text, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { getMyFavorites, removeFavorite } from '@/services/api'
import './index.scss'

type TabType = 'cases' | 'designers'

interface FavoriteCase {
  id: string
  title: string
  image: string
  style: string
  area: string
  price: string
  favoriteTime: number
}

interface FavoriteDesigner {
  id: string
  name: string
  avatar: string
  title: string
  experience: string
  caseCount: number
  rating: number
  favoriteTime: number
}

export default function MyFavorites() {
  const [activeTab, setActiveTab] = useState<TabType>('cases')
  const [favoriteCases, setFavoriteCases] = useState<FavoriteCase[]>([])
  const [favoriteDesigners, setFavoriteDesigners] = useState<FavoriteDesigner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  useDidShow(() => {
    loadFavorites()
  })

  const loadFavorites = async () => {
    try {
      setLoading(true)
      const [casesRes, designersRes] = await Promise.all([
        getMyFavorites({ targetType: 'case' }),
        getMyFavorites({ targetType: 'designer' })
      ])

      if (casesRes.success && casesRes.data) {
        setFavoriteCases(casesRes.data.favorites?.map((item: any) => ({
          id: item.target?._id || item.targetId,
          title: item.target?.title || '',
          image: item.target?.images?.[0] || '',
          style: item.target?.style || '',
          area: item.target?.area ? `${item.target.area}㎡` : '',
          price: item.target?.price ? `${item.target.price}万` : '',
          favoriteTime: new Date(item.createdAt).getTime()
        })) || [])
      }

      if (designersRes.success && designersRes.data) {
        setFavoriteDesigners(designersRes.data.favorites?.map((item: any) => ({
          id: item.target?._id || item.targetId,
          name: item.target?.companyName || item.target?.name || '',
          avatar: item.target?.logo || item.target?.avatar || '',
          title: item.target?.description || '',
          experience: item.target?.experience ? `${item.target.experience}年经验` : '',
          caseCount: item.target?.caseCount || 0,
          rating: item.target?.rating || 0,
          favoriteTime: new Date(item.createdAt).getTime()
        })) || [])
      }
    } catch (error) {
      console.error('加载收藏列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCaseDetail = (caseId: string) => {
    Taro.navigateTo({
      url: `/pages/case-detail/index?id=${caseId}`
    })
  }

  const handleDesignerDetail = (designerId: string) => {
    Taro.navigateTo({
      url: `/pages/designer-detail/index?id=${designerId}`
    })
  }

  const handleRemoveCase = async (caseId: string, e: any) => {
    e.stopPropagation()
    Taro.showModal({
      title: '提示',
      content: '确认取消收藏该案例吗？',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await removeFavorite('case', caseId)
            if (result.success) {
              setFavoriteCases(favoriteCases.filter(item => item.id !== caseId))
              Taro.showToast({
                title: '已取消收藏',
                icon: 'success',
                duration: 1500
              })
            }
          } catch (error) {
            Taro.showToast({
              title: '操作失败',
              icon: 'error',
              duration: 1500
            })
          }
        }
      }
    })
  }

  const handleRemoveDesigner = async (designerId: string, e: any) => {
    e.stopPropagation()
    Taro.showModal({
      title: '提示',
      content: '确认取消收藏该设计师吗？',
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await removeFavorite('designer', designerId)
            if (result.success) {
              setFavoriteDesigners(favoriteDesigners.filter(item => item.id !== designerId))
              Taro.showToast({
                title: '已取消收藏',
                icon: 'success',
                duration: 1500
              })
            }
          } catch (error) {
            Taro.showToast({
              title: '操作失败',
              icon: 'error',
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

  if (loading) {
    return (
      <View className='my-favorites-page'>
        <View className='loading-state'>
          <Text>加载中...</Text>
        </View>
      </View>
    )
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
