import { View, Text, Image, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useMemo } from 'react'
import './index.scss'

interface CaseItem {
  id: number
  image: string
  title: string
  style: string
  area: string
  price: string
  designer: string
  areaNum: number // 面积数值（用于排序）
  priceNum: number // 价格数值（用于排序）
  createTime: number // 创建时间（用于排序）
}

type SortType = 'default' | 'newest' | 'priceAsc' | 'priceDesc' | 'areaAsc' | 'areaDesc'

export default function Cases() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [sortType, setSortType] = useState<SortType>('default')
  const [showFilter, setShowFilter] = useState(false)
  const [showSort, setShowSort] = useState(false)

  // 筛选条件
  const [areaRange, setAreaRange] = useState<string>('all') // all, 0-90, 90-120, 120-150, 150+
  const [priceRange, setPriceRange] = useState<string>('all') // all, 0-10, 10-20, 20-30, 30+

  const [allCases] = useState<CaseItem[]>([
    {
      id: 1,
      image: 'https://via.placeholder.com/340x240/667eea/ffffff?text=现代简约',
      title: '现代简约 · 三居室',
      style: '现代简约',
      area: '120㎡',
      price: '15万',
      designer: '张设计师',
      areaNum: 120,
      priceNum: 15,
      createTime: Date.now() - 86400000 * 1
    },
    {
      id: 2,
      image: 'https://via.placeholder.com/340x240/764ba2/ffffff?text=北欧风格',
      title: '北欧风格 · 两居室',
      style: '北欧',
      area: '90㎡',
      price: '12万',
      designer: '李设计师',
      areaNum: 90,
      priceNum: 12,
      createTime: Date.now() - 86400000 * 2
    },
    {
      id: 3,
      image: 'https://via.placeholder.com/340x240/f093fb/ffffff?text=新中式',
      title: '新中式 · 四居室',
      style: '新中式',
      area: '150㎡',
      price: '25万',
      designer: '王设计师',
      areaNum: 150,
      priceNum: 25,
      createTime: Date.now() - 86400000 * 3
    },
    {
      id: 4,
      image: 'https://via.placeholder.com/340x240/4facfe/ffffff?text=轻奢风',
      title: '轻奢风 · 三居室',
      style: '轻奢',
      area: '130㎡',
      price: '20万',
      designer: '赵设计师',
      areaNum: 130,
      priceNum: 20,
      createTime: Date.now() - 86400000 * 4
    },
    {
      id: 5,
      image: 'https://via.placeholder.com/340x240/00f2fe/ffffff?text=工业风',
      title: '工业风 · 复式',
      style: '工业',
      area: '180㎡',
      price: '28万',
      designer: '刘设计师',
      areaNum: 180,
      priceNum: 28,
      createTime: Date.now() - 86400000 * 5
    },
    {
      id: 6,
      image: 'https://via.placeholder.com/340x240/43e97b/ffffff?text=田园风',
      title: '田园风 · 三居室',
      style: '田园',
      area: '110㎡',
      price: '13万',
      designer: '陈设计师',
      areaNum: 110,
      priceNum: 13,
      createTime: Date.now() - 86400000 * 6
    },
    {
      id: 7,
      image: 'https://via.placeholder.com/340x240/667eea/ffffff?text=美式',
      title: '美式风格 · 别墅',
      style: '美式',
      area: '280㎡',
      price: '45万',
      designer: '周设计师',
      areaNum: 280,
      priceNum: 45,
      createTime: Date.now() - 86400000 * 7
    },
    {
      id: 8,
      image: 'https://via.placeholder.com/340x240/764ba2/ffffff?text=日式',
      title: '日式风格 · 小户型',
      style: '日式',
      area: '65㎡',
      price: '8万',
      designer: '吴设计师',
      areaNum: 65,
      priceNum: 8,
      createTime: Date.now() - 86400000 * 8
    }
  ])

  const tabs = [
    { id: 'all', name: '全部' },
    { id: '现代简约', name: '现代简约' },
    { id: '北欧', name: '北欧' },
    { id: '新中式', name: '新中式' },
    { id: '轻奢', name: '轻奢' },
    { id: '工业', name: '工业' },
    { id: '田园', name: '田园' },
    { id: '美式', name: '美式' },
    { id: '日式', name: '日式' }
  ]

  // 筛选和排序后的案例列表
  const filteredCases = useMemo(() => {
    let result = [...allCases]

    // 1. 按风格筛选
    if (activeTab !== 'all') {
      result = result.filter(item => item.style === activeTab)
    }

    // 2. 按搜索关键词筛选
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase()
      result = result.filter(item =>
        item.title.toLowerCase().includes(keyword) ||
        item.style.toLowerCase().includes(keyword) ||
        item.designer.toLowerCase().includes(keyword)
      )
    }

    // 3. 按面积筛选
    if (areaRange !== 'all') {
      result = result.filter(item => {
        if (areaRange === '0-90') return item.areaNum < 90
        if (areaRange === '90-120') return item.areaNum >= 90 && item.areaNum < 120
        if (areaRange === '120-150') return item.areaNum >= 120 && item.areaNum < 150
        if (areaRange === '150+') return item.areaNum >= 150
        return true
      })
    }

    // 4. 按价格筛选
    if (priceRange !== 'all') {
      result = result.filter(item => {
        if (priceRange === '0-10') return item.priceNum < 10
        if (priceRange === '10-20') return item.priceNum >= 10 && item.priceNum < 20
        if (priceRange === '20-30') return item.priceNum >= 20 && item.priceNum < 30
        if (priceRange === '30+') return item.priceNum >= 30
        return true
      })
    }

    // 5. 排序
    if (sortType === 'newest') {
      result.sort((a, b) => b.createTime - a.createTime)
    } else if (sortType === 'priceAsc') {
      result.sort((a, b) => a.priceNum - b.priceNum)
    } else if (sortType === 'priceDesc') {
      result.sort((a, b) => b.priceNum - a.priceNum)
    } else if (sortType === 'areaAsc') {
      result.sort((a, b) => a.areaNum - b.areaNum)
    } else if (sortType === 'areaDesc') {
      result.sort((a, b) => b.areaNum - a.areaNum)
    }

    return result
  }, [allCases, activeTab, searchKeyword, areaRange, priceRange, sortType])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  const handleCaseDetail = (caseId: number) => {
    Taro.navigateTo({
      url: `/pages/case-detail/index?id=${caseId}`
    })
  }

  const handleSearch = (value: string) => {
    setSearchKeyword(value)
  }

  const handleSortChange = (type: SortType) => {
    setSortType(type)
    setShowSort(false)
  }

  const handleAreaFilter = (range: string) => {
    setAreaRange(range)
  }

  const handlePriceFilter = (range: string) => {
    setPriceRange(range)
  }

  const handleResetFilter = () => {
    setAreaRange('all')
    setPriceRange('all')
    setShowFilter(false)
  }

  const handleConfirmFilter = () => {
    setShowFilter(false)
  }

  const getSortName = () => {
    const sortNames = {
      default: '综合',
      newest: '最新',
      priceAsc: '价格升序',
      priceDesc: '价格降序',
      areaAsc: '面积升序',
      areaDesc: '面积降序'
    }
    return sortNames[sortType]
  }

  return (
    <View className='cases-page'>
      {/* 搜索栏 */}
      <View className='search-bar'>
        <View className='search-input-wrap'>
          <Input
            className='search-input'
            placeholder='搜索案例、风格、设计师'
            value={searchKeyword}
            onInput={(e) => handleSearch(e.detail.value)}
          />
          <View className='search-icon'>🔍</View>
        </View>
      </View>

      {/* 筛选和排序栏 */}
      <View className='filter-bar'>
        <View
          className={`filter-item ${showFilter ? 'active' : ''}`}
          onClick={() => setShowFilter(!showFilter)}
        >
          <Text>筛选</Text>
          {(areaRange !== 'all' || priceRange !== 'all') && <View className='filter-dot' />}
        </View>
        <View
          className={`filter-item ${showSort ? 'active' : ''}`}
          onClick={() => setShowSort(!showSort)}
        >
          <Text>{getSortName()}</Text>
        </View>
      </View>

      {/* 筛选弹出层 */}
      {showFilter && (
        <View className='filter-popup'>
          <View className='filter-section'>
            <View className='filter-label'>面积范围</View>
            <View className='filter-options'>
              {['all', '0-90', '90-120', '120-150', '150+'].map(range => (
                <View
                  key={range}
                  className={`filter-option ${areaRange === range ? 'active' : ''}`}
                  onClick={() => handleAreaFilter(range)}
                >
                  {range === 'all' ? '不限' : range + '㎡'}
                </View>
              ))}
            </View>
          </View>
          <View className='filter-section'>
            <View className='filter-label'>价格范围</View>
            <View className='filter-options'>
              {['all', '0-10', '10-20', '20-30', '30+'].map(range => (
                <View
                  key={range}
                  className={`filter-option ${priceRange === range ? 'active' : ''}`}
                  onClick={() => handlePriceFilter(range)}
                >
                  {range === 'all' ? '不限' : range + '万'}
                </View>
              ))}
            </View>
          </View>
          <View className='filter-actions'>
            <View className='filter-btn reset' onClick={handleResetFilter}>
              重置
            </View>
            <View className='filter-btn confirm' onClick={handleConfirmFilter}>
              确定
            </View>
          </View>
        </View>
      )}

      {/* 排序弹出层 */}
      {showSort && (
        <View className='sort-popup'>
          {[
            { type: 'default' as SortType, name: '综合排序' },
            { type: 'newest' as SortType, name: '最新发布' },
            { type: 'priceAsc' as SortType, name: '价格从低到高' },
            { type: 'priceDesc' as SortType, name: '价格从高到低' },
            { type: 'areaAsc' as SortType, name: '面积从小到大' },
            { type: 'areaDesc' as SortType, name: '面积从大到小' }
          ].map(item => (
            <View
              key={item.type}
              className={`sort-option ${sortType === item.type ? 'active' : ''}`}
              onClick={() => handleSortChange(item.type)}
            >
              {item.name}
              {sortType === item.type && <Text className='check-icon'>✓</Text>}
            </View>
          ))}
        </View>
      )}

      {/* 遮罩层 */}
      {(showFilter || showSort) && (
        <View
          className='mask'
          onClick={() => {
            setShowFilter(false)
            setShowSort(false)
          }}
        />
      )}

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

      {/* 空状态 */}
      {filteredCases.length === 0 && (
        <View className='empty-state'>
          <Text className='empty-icon'>📦</Text>
          <Text className='empty-text'>暂无符合条件的案例</Text>
        </View>
      )}

      {/* 加载更多提示 */}
      {filteredCases.length > 0 && (
        <View className='load-more'>
          <Text className='load-more-text'>已显示全部 {filteredCases.length} 个案例</Text>
        </View>
      )}
    </View>
  )
}
