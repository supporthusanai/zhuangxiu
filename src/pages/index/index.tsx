import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect, useCallback } from 'react'
import { getHotCases, getCases } from '@/services/api'
import './index.scss'

interface CaseItem {
  _id: string
  title: string
  style: string
  area: number
  price: number
  images: string[]
  designer?: {
    name: string
    avatar: string
    title: string
  }
}

interface ServiceItem {
  id: number
  icon: string
  name: string
  desc: string
}

// 默认占位图
const DEFAULT_IMAGE = 'https://via.placeholder.com/340x240/667eea/ffffff?text=装修案例'

export default function Index() {
  // 状态
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hotCases, setHotCases] = useState<CaseItem[]>([])
  const [latestCases, setLatestCases] = useState<CaseItem[]>([])

  // 服务项目（静态数据）
  const services: ServiceItem[] = [
    { id: 1, icon: '🏠', name: '整屋设计', desc: '全屋定制设计方案' },
    { id: 2, icon: '🎨', name: '软装搭配', desc: '专业软装设计师' },
    { id: 3, icon: '🔨', name: '装修施工', desc: '标准化施工管理' },
    { id: 4, icon: '📐', name: '免费量房', desc: '专业设计师上门' }
  ]

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // 并行请求热门案例和最新案例
      const [hotRes, latestRes] = await Promise.all([
        getHotCases(4).catch(() => ({ success: false, data: [] })),
        getCases({ limit: 4, sort: 'createdAt', order: 'desc' }).catch(() => ({
          success: false,
          data: { cases: [] }
        }))
      ])

      if (hotRes.success && hotRes.data) {
        setHotCases(Array.isArray(hotRes.data) ? hotRes.data : [])
      }

      if (latestRes.success && latestRes.data?.cases) {
        setLatestCases(latestRes.data.cases)
      }
    } catch (err) {
      console.error('加载数据失败:', err)
      setError('加载失败，请下拉刷新重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 下拉刷新
  Taro.usePullDownRefresh(() => {
    loadData().finally(() => {
      Taro.stopPullDownRefresh()
    })
  })

  // 获取案例图片
  const getCaseImage = (caseItem: CaseItem): string => {
    return caseItem.images?.[0] || DEFAULT_IMAGE
  }

  // 格式化价格
  const formatPrice = (price: number): string => {
    if (price >= 10000) {
      return `${(price / 10000).toFixed(0)}万`
    }
    return `${price}元`
  }

  // 导航函数
  const navigateToCases = () => {
    Taro.switchTab({ url: '/pages/cases/index' })
  }

  const navigateToDesigners = () => {
    Taro.switchTab({ url: '/pages/designers/index' })
  }

  const handleConsult = () => {
    Taro.navigateTo({ url: '/pages/chat/index?type=consult' })
  }

  const navigateToCaseDetail = (caseId: string) => {
    Taro.navigateTo({ url: `/pages/case-detail/index?id=${caseId}` })
  }

  const navigateToSearch = () => {
    Taro.navigateTo({ url: '/pages/search/index' })
  }

  // 渲染案例卡片
  const renderCaseCard = (caseItem: CaseItem) => (
    <View
      key={caseItem._id}
      className='case-card'
      onClick={() => navigateToCaseDetail(caseItem._id)}
    >
      <Image
        src={getCaseImage(caseItem)}
        className='case-image'
        mode='aspectFill'
        lazyLoad
      />
      <View className='case-info'>
        <View className='case-title'>{caseItem.title}</View>
        <View className='case-tags'>
          <Text className='tag'>{caseItem.area}㎡</Text>
          <Text className='tag'>{formatPrice(caseItem.price)}</Text>
        </View>
      </View>
    </View>
  )

  // 渲染加载状态
  const renderLoading = () => (
    <View className='loading-container'>
      <Text className='loading-text'>加载中...</Text>
    </View>
  )

  // 渲染错误状态
  const renderError = () => (
    <View className='error-container' onClick={loadData}>
      <Text className='error-text'>{error}</Text>
      <Text className='retry-text'>点击重试</Text>
    </View>
  )

  // 渲染空状态
  const renderEmpty = () => (
    <View className='empty-container'>
      <Text className='empty-text'>暂无数据</Text>
    </View>
  )

  return (
    <View className='index-page'>
      {/* 搜索栏 */}
      <View className='search-bar' onClick={navigateToSearch}>
        <View className='search-box'>
          <Text className='search-icon'>🔍</Text>
          <Text className='search-placeholder'>搜索案例或设计师</Text>
        </View>
      </View>

      {/* 轮播图 - 使用热门案例 */}
      <View className='banner-section'>
        <Swiper
          className='banner-swiper'
          indicatorColor='#999'
          indicatorActiveColor='#667eea'
          circular
          indicatorDots
          autoplay
        >
          {(hotCases.length > 0 ? hotCases.slice(0, 3) : [
            { _id: '1', title: '精品案例', images: [DEFAULT_IMAGE] }
          ]).map((caseItem, index) => (
            <SwiperItem key={caseItem._id || index} onClick={() => caseItem._id && navigateToCaseDetail(caseItem._id)}>
              <Image
                src={getCaseImage(caseItem as CaseItem)}
                className='banner-image'
                mode='aspectFill'
              />
              <View className='banner-title'>{caseItem.title || '精品案例'}</View>
            </SwiperItem>
          ))}
        </Swiper>
      </View>

      {/* 服务项目 */}
      <View className='services-section'>
        <View className='section-title'>我们的服务</View>
        <View className='services-grid'>
          {services.map(service => (
            <View key={service.id} className='service-item'>
              <View className='service-icon'>{service.icon}</View>
              <View className='service-name'>{service.name}</View>
              <View className='service-desc'>{service.desc}</View>
            </View>
          ))}
        </View>
      </View>

      {/* 热门推荐 */}
      <View className='recommendations-section'>
        <View className='section-header'>
          <View className='section-title-wrapper'>
            <Text className='section-title'>🔥 热门推荐</Text>
          </View>
          <Text className='more-link' onClick={navigateToCases}>查看更多 →</Text>
        </View>

        {loading ? renderLoading() : error ? renderError() : (
          <View className='cases-preview'>
            {hotCases.length > 0
              ? hotCases.slice(0, 2).map(renderCaseCard)
              : renderEmpty()
            }
          </View>
        )}
      </View>

      {/* 最新案例 */}
      <View className='cases-section'>
        <View className='section-header'>
          <View className='section-title'>精品案例</View>
          <Text className='more-link' onClick={navigateToCases}>查看更多 →</Text>
        </View>

        {loading ? renderLoading() : error ? renderError() : (
          <View className='cases-preview'>
            {latestCases.length > 0
              ? latestCases.slice(0, 2).map(renderCaseCard)
              : renderEmpty()
            }
          </View>
        )}
      </View>

      {/* 设计师推荐 */}
      <View className='designers-section'>
        <View className='section-header'>
          <View className='section-title'>明星设计师</View>
          <Text className='more-link' onClick={navigateToDesigners}>查看更多 →</Text>
        </View>
        <View className='designer-card' onClick={navigateToDesigners}>
          <Image
            src='https://via.placeholder.com/120x120/667eea/ffffff?text=设计师'
            className='designer-avatar'
            mode='aspectFill'
          />
          <View className='designer-info'>
            <View className='designer-name'>查看更多设计师</View>
            <View className='designer-title'>专业设计师团队为您服务</View>
            <View className='designer-tags'>
              <Text className='tag'>现代简约</Text>
              <Text className='tag'>北欧风格</Text>
              <Text className='tag'>中式风格</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 底部咨询按钮 */}
      <View className='consult-bar'>
        <View className='consult-btn' onClick={handleConsult}>
          免费预约咨询
        </View>
      </View>
    </View>
  )
}
