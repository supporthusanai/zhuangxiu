import { View, Text, Image, Swiper, SwiperItem, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss'

interface CaseDetail {
  id: number
  title: string
  style: string
  area: string
  price: string
  designer: {
    name: string
    avatar: string
    title: string
  }
  images: string[]
  description: string
  tags: string[]
  specs: {
    label: string
    value: string
  }[]
  rooms: string
  floor: string
  district: string
}

export default function CaseDetail() {
  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    // 获取路由参数
    const params = Taro.getCurrentInstance().router?.params
    const caseId = params?.id || '1'

    // 模拟加载案例详情数据
    loadCaseDetail(caseId)
  }, [])

  const loadCaseDetail = (id: string) => {
    // 模拟数据
    const mockData: CaseDetail = {
      id: parseInt(id),
      title: '现代简约 · 三居室',
      style: '现代简约',
      area: '120㎡',
      price: '15万',
      designer: {
        name: '张设计师',
        avatar: 'https://via.placeholder.com/100x100/667eea/ffffff?text=张',
        title: '首席设计师 · 10年经验'
      },
      images: [
        'https://via.placeholder.com/750x600/667eea/ffffff?text=客厅',
        'https://via.placeholder.com/750x600/764ba2/ffffff?text=卧室',
        'https://via.placeholder.com/750x600/f093fb/ffffff?text=厨房',
        'https://via.placeholder.com/750x600/4facfe/ffffff?text=卫生间'
      ],
      description: '本案例采用现代简约风格，以简洁明快的设计手法，营造出温馨舒适的居住空间。整体色调以白色和灰色为主，搭配木质家具，呈现出自然清新的氛围。客厅采用开放式设计，增加空间的通透感；卧室注重舒适性和私密性；厨房采用一字型布局，兼顾美观与实用。',
      tags: ['简约', '舒适', '温馨', '实用'],
      specs: [
        { label: '户型', value: '三室两厅一卫' },
        { label: '面积', value: '120㎡' },
        { label: '风格', value: '现代简约' },
        { label: '预算', value: '15万' },
        { label: '工期', value: '90天' }
      ],
      rooms: '3室2厅1卫',
      floor: '中层',
      district: '朝阳区'
    }
    setCaseDetail(mockData)
  }

  const handleSwiperChange = (e: any) => {
    setCurrentImageIndex(e.detail.current)
  }

  const handleFavorite = () => {
    setIsFavorite(!isFavorite)
    Taro.showToast({
      title: isFavorite ? '已取消收藏' : '收藏成功',
      icon: 'success',
      duration: 1500
    })
  }

  const handleConsultDesigner = () => {
    Taro.showModal({
      title: '咨询设计师',
      content: '确认要预约该设计师咨询吗？',
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

  const handleShare = () => {
    Taro.showToast({
      title: '分享功能待实现',
      icon: 'none',
      duration: 1500
    })
  }

  const handleViewDesigner = () => {
    Taro.showToast({
      title: '查看设计师详情',
      icon: 'none',
      duration: 1500
    })
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
          {caseDetail.images.map((image, index) => (
            <SwiperItem key={index}>
              <Image src={image} className='case-image' mode='aspectFill' />
            </SwiperItem>
          ))}
        </Swiper>
        <View className='image-indicator'>
          {currentImageIndex + 1} / {caseDetail.images.length}
        </View>
      </View>

      {/* 基本信息 */}
      <View className='info-section'>
        <View className='case-header'>
          <View className='case-title'>{caseDetail.title}</View>
          <View className='case-price'>¥{caseDetail.price}</View>
        </View>
        <View className='case-tags'>
          {caseDetail.tags.map((tag, index) => (
            <Text key={index} className='tag'>{tag}</Text>
          ))}
        </View>
      </View>

      {/* 规格参数 */}
      <View className='specs-section'>
        <View className='section-title'>项目信息</View>
        <View className='specs-grid'>
          {caseDetail.specs.map((spec, index) => (
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

      {/* 设计师信息 */}
      <View className='designer-section'>
        <View className='section-title'>设计师</View>
        <View className='designer-card' onClick={handleViewDesigner}>
          <Image
            src={caseDetail.designer.avatar}
            className='designer-avatar'
            mode='aspectFill'
          />
          <View className='designer-info'>
            <View className='designer-name'>{caseDetail.designer.name}</View>
            <View className='designer-title'>{caseDetail.designer.title}</View>
          </View>
          <View className='view-more'>查看 ›</View>
        </View>
      </View>

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
