import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

interface BannerItem {
  id: number
  image: string
  title: string
}

interface ServiceItem {
  id: number
  icon: string
  name: string
  desc: string
}

export default function Index() {
  // 轮播图数据
  const [banners] = useState<BannerItem[]>([
    { id: 1, image: 'https://via.placeholder.com/750x400/667eea/ffffff?text=精品案例1', title: '现代简约风格' },
    { id: 2, image: 'https://via.placeholder.com/750x400/764ba2/ffffff?text=精品案例2', title: '北欧风格' },
    { id: 3, image: 'https://via.placeholder.com/750x400/f093fb/ffffff?text=精品案例3', title: '新中式风格' }
  ])

  // 服务项目
  const [services] = useState<ServiceItem[]>([
    { id: 1, icon: '🏠', name: '整屋设计', desc: '全屋定制设计方案' },
    { id: 2, icon: '🎨', name: '软装搭配', desc: '专业软装设计师' },
    { id: 3, icon: '🔨', name: '装修施工', desc: '标准化施工管理' },
    { id: 4, icon: '📐', name: '免费量房', desc: '专业设计师上门' }
  ])

  // 跳转到案例页面
  const navigateToCases = () => {
    Taro.switchTab({
      url: '/pages/cases/index'
    })
  }

  // 跳转到设计师页面
  const navigateToDesigners = () => {
    Taro.switchTab({
      url: '/pages/designers/index'
    })
  }

  // 预约咨询
  const handleConsult = () => {
    Taro.showToast({
      title: '预约成功，客服会尽快联系您',
      icon: 'success',
      duration: 2000
    })
  }

  return (
    <View className='index-page'>
      {/* 轮播图 */}
      <View className='banner-section'>
        <Swiper
          className='banner-swiper'
          indicatorColor='#999'
          indicatorActiveColor='#667eea'
          circular
          indicatorDots
          autoplay
        >
          {banners.map(banner => (
            <SwiperItem key={banner.id}>
              <Image src={banner.image} className='banner-image' mode='aspectFill' />
              <View className='banner-title'>{banner.title}</View>
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

      {/* 精品案例 */}
      <View className='cases-section'>
        <View className='section-header'>
          <View className='section-title'>精品案例</View>
          <Text className='more-link' onClick={navigateToCases}>查看更多 →</Text>
        </View>
        <View className='cases-preview'>
          <View className='case-card'>
            <Image
              src='https://via.placeholder.com/340x240/667eea/ffffff?text=案例1'
              className='case-image'
              mode='aspectFill'
            />
            <View className='case-info'>
              <View className='case-title'>现代简约 · 三居室</View>
              <View className='case-tags'>
                <Text className='tag'>120㎡</Text>
                <Text className='tag'>15万</Text>
              </View>
            </View>
          </View>
          <View className='case-card'>
            <Image
              src='https://via.placeholder.com/340x240/764ba2/ffffff?text=案例2'
              className='case-image'
              mode='aspectFill'
            />
            <View className='case-info'>
              <View className='case-title'>北欧风格 · 两居室</View>
              <View className='case-tags'>
                <Text className='tag'>90㎡</Text>
                <Text className='tag'>12万</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 设计师推荐 */}
      <View className='designers-section'>
        <View className='section-header'>
          <View className='section-title'>明星设计师</View>
          <Text className='more-link' onClick={navigateToDesigners}>查看更多 →</Text>
        </View>
        <View className='designer-card'>
          <Image
            src='https://via.placeholder.com/120x120/667eea/ffffff?text=设计师'
            className='designer-avatar'
            mode='aspectFill'
          />
          <View className='designer-info'>
            <View className='designer-name'>张设计师</View>
            <View className='designer-title'>首席设计师 · 10年经验</View>
            <View className='designer-tags'>
              <Text className='tag'>现代简约</Text>
              <Text className='tag'>北欧风</Text>
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
