import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { getMerchantDetail, getCases } from '@/services/api'
import './index.scss'

interface Designer {
  _id: string
  avatar?: string
  logo?: string
  name?: string
  companyName?: string
  title?: string
  experience?: number
  rating?: number
  caseCount?: number
  consultCount?: number
  styles?: string[]
  specialties?: string[]
  introduction?: string
  description?: string
  designers?: Array<{
    _id: string
    name: string
    avatar: string
    title: string
    experience: number
    specialties: string[]
  }>
}

interface CaseItem {
  _id: string
  images: string[]
  title: string
  style: string
  area: number
  budget: number
}

export default function DesignerDetail() {
  const [designer, setDesigner] = useState<Designer | null>(null)
  const [cases, setCases] = useState<CaseItem[]>([])

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    const designerId = params?.id || '1'
    loadDesignerDetail(designerId)
  }, [])

  const loadDesignerDetail = async (id: string) => {
    try {
      // 获取商家/设计师详情
      const res = await getMerchantDetail(id)
      if (res.success && res.data) {
        setDesigner(res.data)

        // 获取该商家的案例
        const casesRes = await getCases({ merchantId: id, limit: 10 } as any)
        if (casesRes.success && casesRes.data) {
          const caseList = casesRes.data.cases || casesRes.data.list || []
          setCases(caseList)
        }
      } else {
        Taro.showToast({
          title: res.message || '加载失败',
          icon: 'none',
          duration: 2000
        })
      }
    } catch (error) {
      console.error('加载设计师详情失败:', error)
      Taro.showToast({
        title: '加载失败',
        icon: 'none',
        duration: 2000
      })
    }
  }

  const handleConsult = () => {
    if (!designer) return
    const designerName = designer.name || designer.companyName || '设计师'
    Taro.navigateTo({
      url: `/pages/chat/index?type=designer&designerId=${designer._id}&designerName=${encodeURIComponent(designerName)}`
    })
  }

  const handleCaseDetail = (caseId: string) => {
    Taro.navigateTo({
      url: `/pages/case-detail/index?id=${caseId}`
    })
  }

  // 获取显示用的名称和头像
  const displayName = designer?.name || designer?.companyName || '-'
  const displayAvatar = designer?.avatar || designer?.logo || 'https://via.placeholder.com/200x200/667eea/ffffff?text=商'
  const displayTitle = designer?.title || '专业装修服务'
  const displayExperience = designer?.experience ? `${designer.experience}年经验` : '-'
  const displayIntro = designer?.introduction || designer?.description || '暂无介绍'
  const displayStyles = designer?.styles || []
  const displaySpecialties = designer?.specialties || []

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
          <Image src={displayAvatar} className='designer-avatar' mode='aspectFill' />
          <View className='designer-info'>
            <View className='designer-name'>{displayName}</View>
            <View className='designer-meta'>
              <Text className='meta-text'>{displayTitle}</Text>
              <Text className='meta-divider'>|</Text>
              <Text className='meta-text'>{displayExperience}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 数据统计 */}
      <View className='stats-section'>
        <View className='stat-item'>
          <View className='stat-value'>{designer.rating || '-'}</View>
          <View className='stat-label'>评分</View>
        </View>
        <View className='stat-divider' />
        <View className='stat-item'>
          <View className='stat-value'>{designer.caseCount || cases.length || 0}</View>
          <View className='stat-label'>案例数</View>
        </View>
        <View className='stat-divider' />
        <View className='stat-item'>
          <View className='stat-value'>{designer.consultCount || 0}</View>
          <View className='stat-label'>咨询数</View>
        </View>
      </View>

      {/* 擅长风格 */}
      {displayStyles.length > 0 && (
        <View className='section'>
          <View className='section-title'>擅长风格</View>
          <View className='styles-grid'>
            {displayStyles.map((style, index) => (
              <View key={index} className='style-tag'>{style}</View>
            ))}
          </View>
        </View>
      )}

      {/* 个人简介 */}
      <View className='section'>
        <View className='section-title'>简介</View>
        <Text className='introduction-text'>{displayIntro}</Text>
      </View>

      {/* 专业特长 */}
      {displaySpecialties.length > 0 && (
        <View className='section'>
          <View className='section-title'>专业特长</View>
          <View className='specialties-list'>
            {displaySpecialties.map((specialty, index) => (
              <View key={index} className='specialty-item'>
                <View className='specialty-icon'>✓</View>
                <Text className='specialty-text'>{specialty}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 设计案例 */}
      {cases.length > 0 && (
        <View className='section'>
          <View className='section-title'>设计案例</View>
          <View className='cases-grid'>
            {cases.map(caseItem => (
              <View
                key={caseItem._id}
                className='case-card'
                onClick={() => handleCaseDetail(caseItem._id)}
              >
                <Image src={caseItem.images?.[0] || ''} className='case-image' mode='aspectFill' />
                <View className='case-info'>
                  <View className='case-title'>{caseItem.title}</View>
                  <View className='case-meta'>
                    <Text className='meta-tag'>{caseItem.area ? `${caseItem.area}㎡` : '-'}</Text>
                    <Text className='meta-tag'>{caseItem.budget ? `${caseItem.budget}万` : '-'}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 底部咨询按钮 */}
      <View className='consult-bar'>
        <View className='consult-btn' onClick={handleConsult}>
          立即咨询
        </View>
      </View>
    </ScrollView>
  )
}
