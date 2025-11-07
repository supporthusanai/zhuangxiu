import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import './index.scss'

interface CaseItem {
  id: number
  image: string
  title: string
  style: string
  area: string
  price: string
  designer: string
}

export default function Cases() {
  const [activeTab, setActiveTab] = useState('all')
  const [cases] = useState<CaseItem[]>([
    {
      id: 1,
      image: 'https://via.placeholder.com/340x240/667eea/ffffff?text=现代简约',
      title: '现代简约 · 三居室',
      style: '现代简约',
      area: '120㎡',
      price: '15万',
      designer: '张设计师'
    },
    {
      id: 2,
      image: 'https://via.placeholder.com/340x240/764ba2/ffffff?text=北欧风格',
      title: '北欧风格 · 两居室',
      style: '北欧',
      area: '90㎡',
      price: '12万',
      designer: '李设计师'
    },
    {
      id: 3,
      image: 'https://via.placeholder.com/340x240/f093fb/ffffff?text=新中式',
      title: '新中式 · 四居室',
      style: '新中式',
      area: '150㎡',
      price: '25万',
      designer: '王设计师'
    },
    {
      id: 4,
      image: 'https://via.placeholder.com/340x240/4facfe/ffffff?text=轻奢风',
      title: '轻奢风 · 三居室',
      style: '轻奢',
      area: '130㎡',
      price: '20万',
      designer: '赵设计师'
    },
    {
      id: 5,
      image: 'https://via.placeholder.com/340x240/00f2fe/ffffff?text=工业风',
      title: '工业风 · 复式',
      style: '工业',
      area: '180㎡',
      price: '28万',
      designer: '刘设计师'
    },
    {
      id: 6,
      image: 'https://via.placeholder.com/340x240/43e97b/ffffff?text=田园风',
      title: '田园风 · 三居室',
      style: '田园',
      area: '110㎡',
      price: '13万',
      designer: '陈设计师'
    }
  ])

  const tabs = [
    { id: 'all', name: '全部' },
    { id: 'modern', name: '现代简约' },
    { id: 'nordic', name: '北欧' },
    { id: 'chinese', name: '新中式' },
    { id: 'luxury', name: '轻奢' }
  ]

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  const handleCaseDetail = (caseId: number) => {
    Taro.navigateTo({
      url: `/pages/case-detail/index?id=${caseId}`
    })
  }

  return (
    <View className='cases-page'>
      {/* 分类标签 */}
      <View className='tabs-section'>
        <ScrollView scrollX className='tabs-scroll'>
          <View className='tabs-container'>
            {tabs.map(tab => (
              <View
                key={tab.id}
                className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.name}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 案例列表 */}
      <View className='cases-list'>
        {cases.map(item => (
          <View
            key={item.id}
            className='case-item'
            onClick={() => handleCaseDetail(item.id)}
          >
            <Image src={item.image} className='case-image' mode='aspectFill' />
            <View className='case-info'>
              <View className='case-title'>{item.title}</View>
              <View className='case-meta'>
                <Text className='meta-item'>风格：{item.style}</Text>
                <Text className='meta-item'>面积：{item.area}</Text>
              </View>
              <View className='case-footer'>
                <View className='case-price'>预算：{item.price}</View>
                <View className='case-designer'>👤 {item.designer}</View>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* 加载更多提示 */}
      <View className='load-more'>
        <Text className='load-more-text'>暂无更多案例</Text>
      </View>
    </View>
  )
}
