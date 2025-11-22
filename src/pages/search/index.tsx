import { View, Text, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { searchCases, getCases } from '@/services/api'
import './index.scss'

type TabType = 'cases' | 'designers'

interface Case {
  _id: string
  title: string
  style: string
  area: number
  budget: number
  images: string[]
  designer?: {
    name: string
  }
  merchant?: {
    companyName: string
  }
}

interface Designer {
  _id: string
  name?: string
  companyName?: string
  avatar?: string
  logo?: string
  title?: string
  experience?: number
  specialties?: string[]
  caseCount?: number
  rating?: number
}

const SEARCH_HISTORY_KEY = 'searchHistory'
const MAX_HISTORY = 10

export default function Search() {
  const [activeTab, setActiveTab] = useState<TabType>('cases')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cases, setCases] = useState<Case[]>([])
  const [designers, setDesigners] = useState<Designer[]>([])

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

  const handleSearch = async (keyword?: string) => {
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
    setLoading(true)

    try {
      // 搜索案例
      const casesRes = await searchCases({ keyword: searchText, limit: 20 })
      if (casesRes.success && casesRes.data) {
        const caseList = casesRes.data.cases || casesRes.data.list || []
        setCases(caseList)
      }

      // 搜索设计师/商家 (使用 style 过滤来模拟搜索)
      // 实际上如果后端支持商家搜索API会更好
      // 这里暂时只显示案例结果
      setDesigners([])
    } catch (error) {
      console.error('搜索失败:', error)
      Taro.showToast({
        title: '搜索失败',
        icon: 'none',
        duration: 1500
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeywordClick = (keyword: string) => {
    setSearchKeyword(keyword)
    handleSearch(keyword)
  }

  const handleClearSearch = () => {
    setSearchKeyword('')
    setIsSearching(false)
    setCases([])
    setDesigners([])
  }

  const handleCaseDetail = (id: string) => {
    Taro.navigateTo({
      url: `/pages/case-detail/index?id=${id}`
    })
  }

  const handleDesignerDetail = (id: string) => {
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
              {cases.length > 0 && (
                <Text className='tab-count'>({cases.length})</Text>
              )}
            </View>
            <View
              className={`tab-item ${activeTab === 'designers' ? 'active' : ''}`}
              onClick={() => setActiveTab('designers')}
            >
              <Text className='tab-text'>设计师</Text>
              {designers.length > 0 && (
                <Text className='tab-count'>({designers.length})</Text>
              )}
            </View>
          </View>

          {/* 加载中 */}
          {loading && (
            <View className='loading-state'>
              <Text>搜索中...</Text>
            </View>
          )}

          {/* 案例结果 */}
          {!loading && activeTab === 'cases' && (
            <View className='cases-list'>
              {cases.map(item => (
                <View
                  key={item._id}
                  className='case-item'
                  onClick={() => handleCaseDetail(item._id)}
                >
                  <Image src={item.images?.[0] || ''} className='case-image' mode='aspectFill' />
                  <View className='case-info'>
                    <View className='case-title'>{item.title}</View>
                    <View className='case-meta'>
                      <Text className='meta-item'>{item.style || '-'}</Text>
                      <Text className='meta-divider'>·</Text>
                      <Text className='meta-item'>{item.area ? `${item.area}㎡` : '-'}</Text>
                      <Text className='meta-divider'>·</Text>
                      <Text className='meta-item'>{item.budget ? `${item.budget}万` : '-'}</Text>
                    </View>
                    <View className='case-designer'>
                      设计师：{item.designer?.name || item.merchant?.companyName || '-'}
                    </View>
                  </View>
                </View>
              ))}

              {cases.length === 0 && (
                <View className='empty-state'>
                  <Text className='empty-icon'>🔍</Text>
                  <Text className='empty-text'>未找到相关案例</Text>
                  <Text className='empty-hint'>试试其他关键词吧</Text>
                </View>
              )}
            </View>
          )}

          {/* 设计师结果 */}
          {!loading && activeTab === 'designers' && (
            <View className='designers-list'>
              {designers.map(item => (
                <View
                  key={item._id}
                  className='designer-item'
                  onClick={() => handleDesignerDetail(item._id)}
                >
                  <Image
                    src={item.avatar || item.logo || ''}
                    className='designer-avatar'
                    mode='aspectFill'
                  />
                  <View className='designer-info'>
                    <View className='designer-name'>{item.name || item.companyName || '-'}</View>
                    <View className='designer-meta'>
                      <Text className='meta-text'>{item.title || '设计师'}</Text>
                      <Text className='meta-divider'>·</Text>
                      <Text className='meta-text'>
                        {item.experience ? `${item.experience}年经验` : '-'}
                      </Text>
                    </View>
                    <View className='designer-specialties'>
                      {(item.specialties || []).map((specialty, index) => (
                        <Text key={index} className='specialty-tag'>{specialty}</Text>
                      ))}
                    </View>
                    <View className='designer-stats'>
                      <Text className='stat-text'>{item.caseCount || 0} 案例</Text>
                      <Text className='stat-divider'>|</Text>
                      <Text className='stat-text'>{item.rating || '-'} 评分</Text>
                    </View>
                  </View>
                </View>
              ))}

              {designers.length === 0 && (
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
