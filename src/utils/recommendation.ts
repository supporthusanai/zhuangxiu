import Taro from '@tarojs/taro'

// 浏览记录项
export interface BrowseHistoryItem {
  id: number
  type: 'case' | 'designer'
  style?: string
  timestamp: number
}

// 用户偏好
export interface UserPreference {
  favoriteStyles: string[]
  priceRange: { min: number; max: number }
  areaRange: { min: number; max: number }
  browseHistory: BrowseHistoryItem[]
}

const BROWSE_HISTORY_KEY = 'browseHistory'
const USER_PREFERENCE_KEY = 'userPreference'
const MAX_HISTORY = 50

// 获取浏览历史
export const getBrowseHistory = (): BrowseHistoryItem[] => {
  try {
    const data = Taro.getStorageSync(BROWSE_HISTORY_KEY)
    if (data) {
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('获取浏览历史失败', error)
    return []
  }
}

// 添加浏览记录
export const addBrowseHistory = (item: Omit<BrowseHistoryItem, 'timestamp'>): boolean => {
  try {
    const history = getBrowseHistory()

    // 移除重复的记录（相同id和type）
    const filteredHistory = history.filter(h => !(h.id === item.id && h.type === item.type))

    // 添加新记录
    const newHistory = [
      { ...item, timestamp: Date.now() },
      ...filteredHistory
    ].slice(0, MAX_HISTORY)

    Taro.setStorageSync(BROWSE_HISTORY_KEY, JSON.stringify(newHistory))
    return true
  } catch (error) {
    console.error('添加浏览记录失败', error)
    return false
  }
}

// 清除浏览历史
export const clearBrowseHistory = (): boolean => {
  try {
    Taro.removeStorageSync(BROWSE_HISTORY_KEY)
    return true
  } catch (error) {
    console.error('清除浏览历史失败', error)
    return false
  }
}

// 获取用户偏好
export const getUserPreference = (): UserPreference | null => {
  try {
    const data = Taro.getStorageSync(USER_PREFERENCE_KEY)
    if (data) {
      return JSON.parse(data)
    }
    return null
  } catch (error) {
    console.error('获取用户偏好失败', error)
    return null
  }
}

// 保存用户偏好
export const saveUserPreference = (preference: UserPreference): boolean => {
  try {
    Taro.setStorageSync(USER_PREFERENCE_KEY, JSON.stringify(preference))
    return true
  } catch (error) {
    console.error('保存用户偏好失败', error)
    return false
  }
}

// 分析用户偏好（从收藏和浏览历史中提取）
export const analyzeUserPreference = (): UserPreference => {
  try {
    // 获取收藏数据
    const favoriteCasesData = Taro.getStorageSync('favoriteCases')
    const favoriteDesignersData = Taro.getStorageSync('favoriteDesigners')

    const favoriteCases = favoriteCasesData ? JSON.parse(favoriteCasesData) : []
    const favoriteDesigners = favoriteDesignersData ? JSON.parse(favoriteDesignersData) : []

    // 提取收藏的风格
    const styles = new Set<string>()
    favoriteCases.forEach(item => {
      if (item.style) styles.add(item.style)
    })
    favoriteDesigners.forEach(item => {
      if (item.specialties) {
        item.specialties.forEach(s => styles.add(s))
      }
    })

    // 获取浏览历史
    const browseHistory = getBrowseHistory()

    // 从浏览历史中提取风格
    browseHistory.forEach(item => {
      if (item.style) styles.add(item.style)
    })

    // 分析价格和面积范围（从收藏案例中）
    let minPrice = 0
    let maxPrice = 100
    let minArea = 0
    let maxArea = 500

    if (favoriteCases.length > 0) {
      const prices = favoriteCases
        .map(item => parseInt(item.price.replace(/[^\d]/g, '')))
        .filter(p => !isNaN(p))

      const areas = favoriteCases
        .map(item => parseInt(item.area.replace(/[^\d]/g, '')))
        .filter(a => !isNaN(a))

      if (prices.length > 0) {
        minPrice = Math.min(...prices)
        maxPrice = Math.max(...prices)
      }

      if (areas.length > 0) {
        minArea = Math.min(...areas)
        maxArea = Math.max(...areas)
      }
    }

    return {
      favoriteStyles: Array.from(styles),
      priceRange: { min: minPrice, max: maxPrice },
      areaRange: { min: minArea, max: maxArea },
      browseHistory
    }
  } catch (error) {
    console.error('分析用户偏好失败', error)
    return {
      favoriteStyles: [],
      priceRange: { min: 0, max: 100 },
      areaRange: { min: 0, max: 500 },
      browseHistory: []
    }
  }
}

// 计算相似度得分
const calculateSimilarityScore = (
  item: any,
  preference: UserPreference,
  type: 'case' | 'designer'
): number => {
  let score = 0

  // 风格匹配（最高权重）
  if (type === 'case' && preference.favoriteStyles.includes(item.style)) {
    score += 50
  } else if (type === 'designer') {
    const matchedStyles = item.specialties?.filter(s => preference.favoriteStyles.includes(s)) || []
    score += matchedStyles.length * 25
  }

  // 价格范围匹配（案例）
  if (type === 'case') {
    const price = parseInt(item.price?.replace(/[^\d]/g, '') || '0')
    if (price >= preference.priceRange.min && price <= preference.priceRange.max) {
      score += 20
    }
  }

  // 面积范围匹配（案例）
  if (type === 'case') {
    const area = parseInt(item.area?.replace(/[^\d]/g, '') || '0')
    if (area >= preference.areaRange.min && area <= preference.areaRange.max) {
      score += 15
    }
  }

  // 评分权重（设计师）
  if (type === 'designer' && item.rating) {
    score += item.rating * 5
  }

  // 案例数权重（设计师）
  if (type === 'designer' && item.caseCount) {
    score += Math.min(item.caseCount / 10, 15)
  }

  return score
}

// 获取推荐案例
export const getRecommendedCases = (allCases: any[], limit: number = 10): any[] => {
  try {
    const preference = analyzeUserPreference()
    const history = preference.browseHistory

    // 过滤掉已浏览的案例
    const browsedCaseIds = new Set(
      history.filter(h => h.type === 'case').map(h => h.id)
    )

    const unbrowsedCases = allCases.filter(c => !browsedCaseIds.has(c.id))

    // 如果没有足够的偏好数据，返回热门案例
    if (preference.favoriteStyles.length === 0 && history.length === 0) {
      return unbrowsedCases.slice(0, limit)
    }

    // 计算每个案例的推荐得分
    const scoredCases = unbrowsedCases.map(item => ({
      ...item,
      recommendScore: calculateSimilarityScore(item, preference, 'case')
    }))

    // 按得分排序
    scoredCases.sort((a, b) => b.recommendScore - a.recommendScore)

    return scoredCases.slice(0, limit)
  } catch (error) {
    console.error('获取推荐案例失败', error)
    return allCases.slice(0, limit)
  }
}

// 获取推荐设计师
export const getRecommendedDesigners = (allDesigners: any[], limit: number = 10): any[] => {
  try {
    const preference = analyzeUserPreference()
    const history = preference.browseHistory

    // 过滤掉已浏览的设计师
    const browsedDesignerIds = new Set(
      history.filter(h => h.type === 'designer').map(h => h.id)
    )

    const unbrowsedDesigners = allDesigners.filter(d => !browsedDesignerIds.has(d.id))

    // 如果没有足够的偏好数据，返回热门设计师
    if (preference.favoriteStyles.length === 0 && history.length === 0) {
      return unbrowsedDesigners
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, limit)
    }

    // 计算每个设计师的推荐得分
    const scoredDesigners = unbrowsedDesigners.map(item => ({
      ...item,
      recommendScore: calculateSimilarityScore(item, preference, 'designer')
    }))

    // 按得分排序
    scoredDesigners.sort((a, b) => b.recommendScore - a.recommendScore)

    return scoredDesigners.slice(0, limit)
  } catch (error) {
    console.error('获取推荐设计师失败', error)
    return allDesigners.slice(0, limit)
  }
}

// 获取相似案例
export const getSimilarCases = (caseItem: any, allCases: any[], limit: number = 5): any[] => {
  try {
    // 过滤掉当前案例
    const otherCases = allCases.filter(c => c.id !== caseItem.id)

    // 计算相似度
    const scoredCases = otherCases.map(item => {
      let score = 0

      // 相同风格
      if (item.style === caseItem.style) {
        score += 50
      }

      // 相似面积
      const targetArea = parseInt(caseItem.area?.replace(/[^\d]/g, '') || '0')
      const itemArea = parseInt(item.area?.replace(/[^\d]/g, '') || '0')
      const areaDiff = Math.abs(targetArea - itemArea)
      if (areaDiff < 20) {
        score += 30 - areaDiff
      }

      // 相似价格
      const targetPrice = parseInt(caseItem.price?.replace(/[^\d]/g, '') || '0')
      const itemPrice = parseInt(item.price?.replace(/[^\d]/g, '') || '0')
      const priceDiff = Math.abs(targetPrice - itemPrice)
      if (priceDiff < 10) {
        score += 20 - priceDiff * 2
      }

      return {
        ...item,
        similarityScore: score
      }
    })

    // 按相似度排序
    scoredCases.sort((a, b) => b.similarityScore - a.similarityScore)

    return scoredCases.slice(0, limit)
  } catch (error) {
    console.error('获取相似案例失败', error)
    return allCases.slice(0, limit)
  }
}
