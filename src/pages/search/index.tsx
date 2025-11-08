import { View, Text, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect, useMemo } from 'react'
import './index.scss'

type TabType = 'cases' | 'designers'

interface Case {
  id: number
  title: string
  style: string
  area: string
  price: string
  image: string
  designer: string
}

interface Designer {
  id: number
  name: string
  avatar: string
  title: string
  experience: string
  specialties: string[]
  caseCount: number
  rating: number
}

const SEARCH_HISTORY_KEY = 'searchHistory'
const MAX_HISTORY = 10

export default function Search() {
  const [activeTab, setActiveTab] = useState<TabType>('cases')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // 模拟案例数据
  const allCases: Case[] = [
    {
      id: 1,
      title: '现代简约风格三居室',
      style: '现代简约',
      area: '120㎡',
      price: '15万',
      image: 'https://via.placeholder.com/300x200/667eea/ffffff?text=现代简约',
      designer: '张设计师'
    },
    {
      id: 2,
      title: '北欧风格小户型',
      style: '北欧风格',
      area: '80㎡',
      price: '10万',
      image: 'https://via.placeholder.com/300x200/764ba2/ffffff?text=北欧风格',
      designer: '李设计师'
    },
    {
      id: 3,
      title: '中式古典别墅',
      style: '中式风格',
      area: '300㎡',
      price: '50万',
      image: 'https://via.placeholder.com/300x200/52c41a/ffffff?text=中式古典',
      designer: '王设计师'
    },
    {
      id: 4,
      title: '工业风格loft',
      style: '工业风格',
      area: '150㎡',
      price: '20万',
      image: 'https://via.placeholder.com/300x200/faad14/ffffff?text=工业风格',
      designer: '赵设计师'
    },
    {
      id: 5,
      title: '地中海风格复式',
      style: '地中海',
      area: '200㎡',
      price: '30万',
      image: 'https://via.placeholder.com/300x200/1890ff/ffffff?text=地中海',
      designer: '刘设计师'
    }
  ]

  // 模拟设计师数据
  const allDesigners: Designer[] = [
    {
      id: 1,
      name: '张设计师',
      avatar: 'https://via.placeholder.com/120x120/667eea/ffffff?text=张',
      title: '首席设计师',
      experience: '10年经验',
      specialties: ['现代简约', '北欧风格'],
      caseCount: 156,
      rating: 4.9
    },
    {
      id: 2,
      name: '李设计师',
      avatar: 'https://via.placeholder.com/120x120/764ba2/ffffff?text=李',
      title: '高级设计师',
      experience: '8年经验',
      specialties: ['中式风格', '新中式'],
      caseCount: 98,
      rating: 4.8
    },
    {
      id: 3,
      name: '王设计师',
      avatar: 'https://via.placeholder.com/120x120/52c41a/ffffff?text=王',
      title: '资深设计师',
      experience: '12年经验',
      specialties: ['欧式古典', '法式风格'],
      caseCount: 203,
      rating: 5.0
    },
    {
      id: 4,
      name: '赵设计师',
      avatar: 'https://via.placeholder.com/120x120/faad14/ffffff?text=赵',
      title: '设计总监',
      experience: '15年经验',
      specialties: ['工业风格', '美式风格'],
      caseCount: 267,
      rating: 4.9
    },
    {
      id: 5,
      name: '刘设计师',
      avatar: 'https://via.placeholder.com/120x120/1890ff/ffffff?text=刘',
      title: '主任设计师',
      experience: '7年经验',
      specialties: ['地中海', '田园风格'],
      caseCount: 76,
      rating: 4.7
    }
  ]

  // 热门搜索关键词
  const hotKeywords = [
    '现代简约',
    '北欧风格',
    '小户型',
    '别墅设计',
    '中式风格',
    '轻奢风格',
    'loft',
    '三居室'
  ]

  useEffect(() => {
    loadSearchHistory()
  }, [])

  const loadSearchHistory = () => {
    try {
      const history = Taro.getStorageSync(SEARCH_HISTORY_KEY)
      if (history) {
        setSearchHistory(JSON.parse(history))
      }
    } catch (error) {
      console.error('加载搜索历史失败', error)
    }
  }

  const saveSearchHistory = (keyword: string) => {
    try {
      const trimmedKeyword = keyword.trim()
      if (!trimmedKeyword) return

      let newHistory = [trimmedKeyword, ...searchHistory.filter(k => k !== trimmedKeyword)]
      newHistory = newHistory.slice(0, MAX_HISTORY)

      Taro.setStorageSync(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))
      setSearchHistory(newHistory)
    } catch (error) {
      console.error('保存搜索历史失败', error)
    }
  }

  const clearSearchHistory = () => {
    Taro.showModal({
      title: '提示',
      content: '确认清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            Taro.removeStorageSync(SEARCH_HISTORY_KEY)
            setSearchHistory([])
            Taro.showToast({
              title: '已清空',
              icon: 'success',
              duration: 1500
            })
          } catch (error) {
            console.error('清空搜索历史失败', error)
          }
        }
      }
    })
  }

  const handleSearch = (keyword?: string) => {
    const searchText = keyword || searchKeyword
    if (!searchText.trim()) {
      Taro.showToast({
        title: '请输入搜索关键词',
        icon: 'none',
        duration: 1500
      })
      return
    }

    saveSearchHistory(searchText)
    setSearchKeyword(searchText)
    setIsSearching(true)
  }

  const handleKeywordClick = (keyword: string) => {
    setSearchKeyword(keyword)
    handleSearch(keyword)
  }

  const handleClearSearch = () => {
    setSearchKeyword('')
    setIsSearching(false)
  }

  // 过滤案例
  const filteredCases = useMemo(() => {
    if (!searchKeyword.trim()) return []
    const keyword = searchKeyword.toLowerCase()
    return allCases.filter(item =>
      item.title.toLowerCase().includes(keyword) ||
      item.style.toLowerCase().includes(keyword) ||
      item.area.toLowerCase().includes(keyword) ||
      item.designer.toLowerCase().includes(keyword)
    )
  }, [searchKeyword])

  // 过滤设计师
  const filteredDesigners = useMemo(() => {
    if (!searchKeyword.trim()) return []
    const keyword = searchKeyword.toLowerCase()
    return allDesigners.filter(item =>
      item.name.toLowerCase().includes(keyword) ||
      item.title.toLowerCase().includes(keyword) ||
      item.specialties.some(s => s.toLowerCase().includes(keyword))
    )
  }, [searchKeyword])

  const handleCaseDetail = (id: number) => {
    Taro.navigateTo({
      url: `/pages/case-detail/index?id=${id}`
    })
  }

  const handleDesignerDetail = (id: number) => {
    Taro.navigateTo({
      url: `/pages/designer-detail/index?id=${id}`
    })
  }

  return (
    <View className='search-page'>
      {/* 搜索栏 */}
      <View className='search-bar'>
        <View className='search-input-box'>
          <Text className='search-icon'>🔍</Text>
          <Input
            className='search-input'
            type='text'
            placeholder='搜索案例或设计师'
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
            onConfirm={() => handleSearch()}
            confirmType='search'
            focus
          />
          {searchKeyword && (
            <View className='clear-icon' onClick={handleClearSearch}>
              <Text>✕</Text>
            </View>
          )}
        </View>
        <View className='search-btn' onClick={() => handleSearch()}>
          搜索
        </View>
      </View>

      {/* 搜索前显示 */}
      {!isSearching && (
        <View className='search-suggestions'>
          {/* 搜索历史 */}
          {searchHistory.length > 0 && (
            <View className='history-section'>
              <View className='section-header'>
                <Text className='section-title'>搜索历史</Text>
                <View className='clear-history' onClick={clearSearchHistory}>
                  <Text className='clear-icon'>🗑️</Text>
                  <Text className='clear-text'>清空</Text>
                </View>
              </View>
              <View className='keyword-tags'>
                {searchHistory.map((keyword, index) => (
                  <View
                    key={index}
                    className='keyword-tag'
                    onClick={() => handleKeywordClick(keyword)}
                  >
                    {keyword}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* 热门搜索 */}
          <View className='hot-section'>
            <View className='section-header'>
              <Text className='section-title'>热门搜索</Text>
            </View>
            <View className='keyword-tags'>
              {hotKeywords.map((keyword, index) => (
                <View
                  key={index}
                  className='keyword-tag hot'
                  onClick={() => handleKeywordClick(keyword)}
                >
                  {index < 3 && <Text className='hot-badge'>{index + 1}</Text>}
                  {keyword}
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* 搜索结果 */}
      {isSearching && (
        <View className='search-results'>
          {/* Tab切换 */}
          <View className='tabs-bar'>
            <View
              className={`tab-item ${activeTab === 'cases' ? 'active' : ''}`}
              onClick={() => setActiveTab('cases')}
            >
              <Text className='tab-text'>案例</Text>
              {filteredCases.length > 0 && (
                <Text className='tab-count'>({filteredCases.length})</Text>
              )}
            </View>
            <View
              className={`tab-item ${activeTab === 'designers' ? 'active' : ''}`}
              onClick={() => setActiveTab('designers')}
            >
              <Text className='tab-text'>设计师</Text>
              {filteredDesigners.length > 0 && (
                <Text className='tab-count'>({filteredDesigners.length})</Text>
              )}
            </View>
          </View>

          {/* 案例结果 */}
          {activeTab === 'cases' && (
            <View className='cases-list'>
              {filteredCases.map(item => (
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
                    <View className='case-designer'>设计师：{item.designer}</View>
                  </View>
                </View>
              ))}

              {filteredCases.length === 0 && (
                <View className='empty-state'>
                  <Text className='empty-icon'>🔍</Text>
                  <Text className='empty-text'>未找到相关案例</Text>
                  <Text className='empty-hint'>试试其他关键词吧</Text>
                </View>
              )}
            </View>
          )}

          {/* 设计师结果 */}
          {activeTab === 'designers' && (
            <View className='designers-list'>
              {filteredDesigners.map(item => (
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
                    <View className='designer-specialties'>
                      {item.specialties.map((specialty, index) => (
                        <Text key={index} className='specialty-tag'>{specialty}</Text>
                      ))}
                    </View>
                    <View className='designer-stats'>
                      <Text className='stat-text'>{item.caseCount} 案例</Text>
                      <Text className='stat-divider'>|</Text>
                      <Text className='stat-text'>{item.rating} 评分</Text>
                    </View>
                  </View>
                </View>
              ))}

              {filteredDesigners.length === 0 && (
                <View className='empty-state'>
                  <Text className='empty-icon'>👨‍🎨</Text>
                  <Text className='empty-text'>未找到相关设计师</Text>
                  <Text className='empty-hint'>试试其他关键词吧</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  )
}
