import { View, Text, Image, Swiper, SwiperItem, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import {
  isCaseFavorited,
  addFavoriteCase,
  removeFavoriteCase
} from '@/utils/favorite'
import { addBrowseHistory } from '@/utils/recommendation'
import { getCaseDetail as fetchCaseDetail } from '@/services/api'
import './index.scss'

interface CaseDetail {
  id: string
  _id: string
  title: string
  style: string
  area: number
  budget: number
  merchant?: {
    _id: string
    companyName: string
    logo?: string
  }
  designer?: {
    _id: string
    name: string
    avatar: string
    title?: string
  }
  images: string[]
  description: string
  tags: string[]
  rooms: string
  floor?: string
  district?: string
}

function CaseDetail() {
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  // 启用分享功能
  Taro.useShareAppMessage(() => {
    const caseId = caseDetail?._id || caseDetail?.id
    return {
      title: caseDetail?.title || '装修案例分享',
      path: `/pages/case-detail/index?id=${caseId}`,
      imageUrl: caseDetail?.images?.[0] || ''
    }
  })

  useEffect(() => {
    // 获取路由参数
    const params = Taro.getCurrentInstance().router?.params
    const caseId = params?.id || '1'

    // 模拟加载案例详情数据
    loadCaseDetail(caseId)
  }, [])

  // 检查是否已收藏
  useEffect(() => {
    if (caseDetail) {
      const caseId = caseDetail._id || caseDetail.id
      setIsFavorite(isCaseFavorited(caseId))
    }
  }, [caseDetail])

  // 生成规格参数
  const getSpecs = () => {
    if (!caseDetail) return []
    return [
      { label: '户型', value: caseDetail.rooms || '-' },
      { label: '面积', value: caseDetail.area ? `${caseDetail.area}㎡` : '-' },
      { label: '风格', value: caseDetail.style || '-' },
      { label: '预算', value: caseDetail.budget ? `${caseDetail.budget}万` : '-' },
      { label: '楼层', value: caseDetail.floor || '-' }
    ]
  }

  const loadCaseDetail = async (id: string) => {
    try {
      const res = await fetchCaseDetail(id)
      if (res.success && res.data) {
        const data = res.data
        setCaseDetail(data)

        // 添加到浏览历史
        addBrowseHistory({
          id: data._id || id,
          type: 'case',
          style: data.style
        })
      } else {
        Taro.showToast({
          title: res.message || '加载失败',
          icon: 'none',
          duration: 2000
        })
      }
    } catch (error) {
      console.error('加载案例详情失败:', error)
      Taro.showToast({
        title: '加载案例详情失败',
        icon: 'none',
        duration: 2000
      })
    }
  }

  const handleSwiperChange = (e: any) => {
    setCurrentImageIndex(e.detail.current)
  }

  const handleFavorite = () => {
    if (!caseDetail) return

    const caseId = caseDetail._id || caseDetail.id

    if (isFavorite) {
      // 取消收藏
      const success = removeFavoriteCase(caseId)
      if (success) {
        setIsFavorite(false)
        Taro.showToast({
          title: '已取消收藏',
          icon: 'success',
          duration: 1500
        })
      }
    } else {
      // 添加收藏
      const success = addFavoriteCase({
        id: caseId,
        image: caseDetail.images?.[0] || '',
        title: caseDetail.title,
        style: caseDetail.style,
        area: caseDetail.area ? `${caseDetail.area}㎡` : '-',
        price: caseDetail.budget ? `${caseDetail.budget}万` : '-',
        designer: caseDetail.designer?.name || caseDetail.merchant?.companyName || '-'
      })
      if (success) {
        setIsFavorite(true)
        Taro.showToast({
          title: '收藏成功',
          icon: 'success',
          duration: 1500
        })
      } else {
        Taro.showToast({
          title: '已经收藏过了',
          icon: 'none',
          duration: 1500
        })
      }
    }
  }

  const handleConsultDesigner = () => {
    if (!caseDetail) return
    const caseId = caseDetail._id || caseDetail.id
    const designerName = caseDetail.designer?.name || caseDetail.merchant?.companyName || '设计师'
    Taro.navigateTo({
      url: `/pages/chat/index?type=case&caseId=${caseId}&caseTitle=${encodeURIComponent(caseDetail.title)}&designerName=${encodeURIComponent(designerName)}`
    })
  }

  const handleImagePreview = () => {
    if (!caseDetail) return
    Taro.previewImage({
      current: caseDetail.images[currentImageIndex], // 当前显示图片
      urls: caseDetail.images // 所有图片列表
    })
  }

  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true,
      showShareItems: ['wechatFriends', 'wechatMoment']
    })
    Taro.showToast({
      title: '点击右上角分享',
      icon: 'none',
      duration: 2000
    })
  }

  const handleViewDesigner = () => {
    if (!caseDetail) return
    // 优先使用设计师ID，否则使用商家ID
    const designerId = caseDetail.designer?._id || caseDetail.merchant?._id
    if (designerId) {
      Taro.navigateTo({
        url: `/pages/designer-detail/index?id=${designerId}`
      })
    }
  }

  if (!caseDetail) {
    return (
      <View className='loading-container'>
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <ScrollView className='case-detail-page' scrollY>
      {/* 图片轮播 */}
      <View className='images-section'>
        <Swiper
          className='images-swiper'
          indicatorDots={false}
          circular
          autoplay={false}
          onChange={handleSwiperChange}
        >
          {(caseDetail.images || []).map((image, index) => (
            <SwiperItem key={index} onClick={handleImagePreview}>
              <Image src={image} className='case-image' mode='aspectFill' />
            </SwiperItem>
          ))}
        </Swiper>
        <View className='image-indicator'>
          {currentImageIndex + 1} / {(caseDetail.images || []).length}
        </View>
      </View>

      {/* 基本信息 */}
      <View className='info-section'>
        <View className='case-header'>
          <View className='case-title'>{caseDetail.title}</View>
          <View className='case-price'>{caseDetail.budget ? `¥${caseDetail.budget}万` : '-'}</View>
        </View>
        <View className='case-tags'>
          {(caseDetail.tags || []).map((tag, index) => (
            <Text key={index} className='tag'>{tag}</Text>
          ))}
        </View>
      </View>

      {/* 规格参数 */}
      <View className='specs-section'>
        <View className='section-title'>项目信息</View>
        <View className='specs-grid'>
          {getSpecs().map((spec, index) => (
            <View key={index} className='spec-item'>
              <Text className='spec-label'>{spec.label}</Text>
              <Text className='spec-value'>{spec.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 案例描述 */}
      <View className='description-section'>
        <View className='section-title'>设计说明</View>
        <Text className='description-text'>{caseDetail.description}</Text>
      </View>

      {/* 设计师/商家信息 */}
      {(caseDetail.designer || caseDetail.merchant) && (
        <View className='designer-section'>
          <View className='section-title'>{caseDetail.designer ? '设计师' : '商家'}</View>
          <View className='designer-card' onClick={handleViewDesigner}>
            <Image
              src={caseDetail.designer?.avatar || caseDetail.merchant?.logo || 'https://via.placeholder.com/100x100/667eea/ffffff?text=商'}
              className='designer-avatar'
              mode='aspectFill'
            />
            <View className='designer-info'>
              <View className='designer-name'>{caseDetail.designer?.name || caseDetail.merchant?.companyName || '-'}</View>
              <View className='designer-title'>{caseDetail.designer?.title || '专业装修服务'}</View>
            </View>
            <View className='view-more'>查看 ›</View>
          </View>
        </View>
      )}

      {/* 底部操作栏 */}
      <View className='action-bar'>
        <View className='action-left'>
          <View className='action-btn' onClick={handleFavorite}>
            <Text className='action-icon'>{isFavorite ? '❤️' : '🤍'}</Text>
            <Text className='action-text'>收藏</Text>
          </View>
          <View className='action-btn' onClick={handleShare}>
            <Text className='action-icon'>📤</Text>
            <Text className='action-text'>分享</Text>
          </View>
        </View>
        <View className='consult-btn' onClick={handleConsultDesigner}>
          咨询设计师
        </View>
      </View>
    </ScrollView>
  )
}

export default CaseDetail
