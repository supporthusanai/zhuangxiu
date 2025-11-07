import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss'

interface Designer {
  id: number
  avatar: string
  name: string
  title: string
  experience: string
  rating: number
  caseCount: number
  consultCount: number
  styles: string[]
  introduction: string
  specialties: string[]
}

interface CaseItem {
  id: number
  image: string
  title: string
  style: string
  area: string
  price: string
}

export default function DesignerDetail() {
  const [designer, setDesigner] = useState<Designer | null>(null)
  const [cases, setCases] = useState<CaseItem[]>([])

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    const designerId = params?.id || '1'
    loadDesignerDetail(designerId)
  }, [])

  const loadDesignerDetail = (id: string) => {
    // 模拟设计师详情数据
    const mockDesigner: Designer = {
      id: parseInt(id),
      avatar: 'https://via.placeholder.com/200x200/667eea/ffffff?text=张',
      name: '张设计师',
      title: '首席设计师',
      experience: '10年经验',
      rating: 4.9,
      caseCount: 156,
      consultCount: 892,
      styles: ['现代简约', '北欧风', '轻奢', '新中式'],
      introduction: '从业10年，擅长现代简约、北欧风格设计。注重空间的合理利用和生活动线的优化，致力于为每一位客户打造舒适、实用、美观的居住空间。曾获得多项设计大奖，深受客户好评。',
      specialties: [
        '空间规划与布局优化',
        '色彩搭配与软装设计',
        '收纳系统设计',
        '智能家居整合',
        '环保材料选择'
      ]
    }
    setDesigner(mockDesigner)

    // 模拟设计师案例
    const mockCases: CaseItem[] = [
      {
        id: 1,
        image: 'https://via.placeholder.com/340x240/667eea/ffffff?text=案例1',
        title: '现代简约 · 三居室',
        style: '现代简约',
        area: '120㎡',
        price: '15万'
      },
      {
        id: 2,
        image: 'https://via.placeholder.com/340x240/764ba2/ffffff?text=案例2',
        title: '北欧风格 · 两居室',
        style: '北欧风',
        area: '90㎡',
        price: '12万'
      },
      {
        id: 3,
        image: 'https://via.placeholder.com/340x240/f093fb/ffffff?text=案例3',
        title: '轻奢风格 · 大平层',
        style: '轻奢',
        area: '180㎡',
        price: '28万'
      },
      {
        id: 4,
        image: 'https://via.placeholder.com/340x240/4facfe/ffffff?text=案例4',
        title: '新中式 · 别墅',
        style: '新中式',
        area: '300㎡',
        price: '50万'
      }
    ]
    setCases(mockCases)
  }

  const handleConsult = () => {
    if (!designer) return
    Taro.navigateTo({
      url: `/pages/chat/index?type=designer&designerId=${designer.id}&designerName=${designer.name}`
    })
  }

  const handleCaseDetail = (caseId: number) => {
    Taro.navigateTo({
      url: `/pages/case-detail/index?id=${caseId}`
    })
  }

  if (!designer) {
    return (
      <View className='loading-container'>
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <ScrollView className='designer-detail-page' scrollY>
      {/* 设计师头部信息 */}
      <View className='designer-header'>
        <View className='header-bg' />
        <View className='header-content'>
          <Image src={designer.avatar} className='designer-avatar' mode='aspectFill' />
          <View className='designer-info'>
            <View className='designer-name'>{designer.name}</View>
            <View className='designer-meta'>
              <Text className='meta-text'>{designer.title}</Text>
              <Text className='meta-divider'>|</Text>
              <Text className='meta-text'>{designer.experience}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 数据统计 */}
      <View className='stats-section'>
        <View className='stat-item'>
          <View className='stat-value'>{designer.rating}</View>
          <View className='stat-label'>评分</View>
        </View>
        <View className='stat-divider' />
        <View className='stat-item'>
          <View className='stat-value'>{designer.caseCount}</View>
          <View className='stat-label'>案例数</View>
        </View>
        <View className='stat-divider' />
        <View className='stat-item'>
          <View className='stat-value'>{designer.consultCount}</View>
          <View className='stat-label'>咨询数</View>
        </View>
      </View>

      {/* 擅长风格 */}
      <View className='section'>
        <View className='section-title'>擅长风格</View>
        <View className='styles-grid'>
          {designer.styles.map((style, index) => (
            <View key={index} className='style-tag'>{style}</View>
          ))}
        </View>
      </View>

      {/* 个人简介 */}
      <View className='section'>
        <View className='section-title'>个人简介</View>
        <Text className='introduction-text'>{designer.introduction}</Text>
      </View>

      {/* 专业特长 */}
      <View className='section'>
        <View className='section-title'>专业特长</View>
        <View className='specialties-list'>
          {designer.specialties.map((specialty, index) => (
            <View key={index} className='specialty-item'>
              <View className='specialty-icon'>✓</View>
              <Text className='specialty-text'>{specialty}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 设计案例 */}
      <View className='section'>
        <View className='section-title'>设计案例</View>
        <View className='cases-grid'>
          {cases.map(caseItem => (
            <View
              key={caseItem.id}
              className='case-card'
              onClick={() => handleCaseDetail(caseItem.id)}
            >
              <Image src={caseItem.image} className='case-image' mode='aspectFill' />
              <View className='case-info'>
                <View className='case-title'>{caseItem.title}</View>
                <View className='case-meta'>
                  <Text className='meta-tag'>{caseItem.area}</Text>
                  <Text className='meta-tag'>{caseItem.price}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 底部咨询按钮 */}
      <View className='consult-bar'>
        <View className='consult-btn' onClick={handleConsult}>
          立即咨询
        </View>
      </View>
    </ScrollView>
  )
}
