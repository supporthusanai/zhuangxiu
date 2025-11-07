import Taro from '@tarojs/taro'

export interface FavoriteCase {
  id: number
  image: string
  title: string
  style: string
  area: string
  price: string
  designer: string
  favoriteTime: number
}

export interface FavoriteDesigner {
  id: number
  avatar: string
  name: string
  title: string
  experience: string
  caseCount: number
  rating: number
  favoriteTime: number
}

const FAVORITE_CASES_KEY = 'favorite_cases'
const FAVORITE_DESIGNERS_KEY = 'favorite_designers'

// ===== 案例收藏 =====

/**
 * 获取收藏的案例列表
 */
export function getFavoriteCases(): FavoriteCase[] {
  try {
    const favoriteCases = Taro.getStorageSync(FAVORITE_CASES_KEY)
    return favoriteCases || []
  } catch (error) {
    console.error('获取收藏案例失败', error)
    return []
  }
}

/**
 * 添加案例收藏
 */
export function addFavoriteCase(caseItem: Omit<FavoriteCase, 'favoriteTime'>): boolean {
  try {
    const favoriteCases = getFavoriteCases()

    // 检查是否已收藏
    const existIndex = favoriteCases.findIndex(item => item.id === caseItem.id)
    if (existIndex >= 0) {
      return false // 已经收藏过了
    }

    // 添加收藏时间
    const newFavorite: FavoriteCase = {
      ...caseItem,
      favoriteTime: Date.now()
    }

    favoriteCases.unshift(newFavorite) // 添加到开头
    Taro.setStorageSync(FAVORITE_CASES_KEY, favoriteCases)
    return true
  } catch (error) {
    console.error('添加收藏案例失败', error)
    return false
  }
}

/**
 * 取消案例收藏
 */
export function removeFavoriteCase(caseId: number): boolean {
  try {
    const favoriteCases = getFavoriteCases()
    const newFavoriteCases = favoriteCases.filter(item => item.id !== caseId)
    Taro.setStorageSync(FAVORITE_CASES_KEY, newFavoriteCases)
    return true
  } catch (error) {
    console.error('取消收藏案例失败', error)
    return false
  }
}

/**
 * 检查案例是否已收藏
 */
export function isCaseFavorited(caseId: number): boolean {
  const favoriteCases = getFavoriteCases()
  return favoriteCases.some(item => item.id === caseId)
}

// ===== 设计师收藏 =====

/**
 * 获取收藏的设计师列表
 */
export function getFavoriteDesigners(): FavoriteDesigner[] {
  try {
    const favoriteDesigners = Taro.getStorageSync(FAVORITE_DESIGNERS_KEY)
    return favoriteDesigners || []
  } catch (error) {
    console.error('获取收藏设计师失败', error)
    return []
  }
}

/**
 * 添加设计师收藏
 */
export function addFavoriteDesigner(designer: Omit<FavoriteDesigner, 'favoriteTime'>): boolean {
  try {
    const favoriteDesigners = getFavoriteDesigners()

    // 检查是否已收藏
    const existIndex = favoriteDesigners.findIndex(item => item.id === designer.id)
    if (existIndex >= 0) {
      return false // 已经收藏过了
    }

    // 添加收藏时间
    const newFavorite: FavoriteDesigner = {
      ...designer,
      favoriteTime: Date.now()
    }

    favoriteDesigners.unshift(newFavorite) // 添加到开头
    Taro.setStorageSync(FAVORITE_DESIGNERS_KEY, favoriteDesigners)
    return true
  } catch (error) {
    console.error('添加收藏设计师失败', error)
    return false
  }
}

/**
 * 取消设计师收藏
 */
export function removeFavoriteDesigner(designerId: number): boolean {
  try {
    const favoriteDesigners = getFavoriteDesigners()
    const newFavoriteDesigners = favoriteDesigners.filter(item => item.id !== designerId)
    Taro.setStorageSync(FAVORITE_DESIGNERS_KEY, newFavoriteDesigners)
    return true
  } catch (error) {
    console.error('取消收藏设计师失败', error)
    return false
  }
}

/**
 * 检查设计师是否已收藏
 */
export function isDesignerFavorited(designerId: number): boolean {
  const favoriteDesigners = getFavoriteDesigners()
  return favoriteDesigners.some(item => item.id === designerId)
}

/**
 * 清空所有收藏
 */
export function clearAllFavorites(): boolean {
  try {
    Taro.removeStorageSync(FAVORITE_CASES_KEY)
    Taro.removeStorageSync(FAVORITE_DESIGNERS_KEY)
    return true
  } catch (error) {
    console.error('清空收藏失败', error)
    return false
  }
}

/**
 * 获取收藏统计
 */
export function getFavoriteStats() {
  return {
    casesCount: getFavoriteCases().length,
    designersCount: getFavoriteDesigners().length
  }
}
