import Taro from '@tarojs/taro'

export interface UserInfo {
  id: string
  nickname: string
  avatar: string
  phone?: string
  isLogin: boolean
}

const STORAGE_KEY = 'userInfo'

// 获取用户信息
export const getUserInfo = (): UserInfo | null => {
  try {
    const userInfoStr = Taro.getStorageSync(STORAGE_KEY)
    if (userInfoStr) {
      return JSON.parse(userInfoStr)
    }
    return null
  } catch (error) {
    console.error('获取用户信息失败', error)
    return null
  }
}

// 保存用户信息
export const saveUserInfo = (userInfo: UserInfo): boolean => {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(userInfo))
    return true
  } catch (error) {
    console.error('保存用户信息失败', error)
    return false
  }
}

// 清除用户信息
export const clearUserInfo = (): boolean => {
  try {
    Taro.removeStorageSync(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('清除用户信息失败', error)
    return false
  }
}

// 检查是否登录
export const isLogin = (): boolean => {
  const userInfo = getUserInfo()
  return userInfo?.isLogin || false
}

// 模拟登录
export const mockLogin = (phone: string, code: string): Promise<UserInfo> => {
  return new Promise((resolve, reject) => {
    // 模拟网络请求延迟
    setTimeout(() => {
      // 简单验证
      if (phone && code === '123456') {
        const userInfo: UserInfo = {
          id: Date.now().toString(),
          nickname: `用户${phone.slice(-4)}`,
          avatar: 'https://via.placeholder.com/140x140/667eea/ffffff?text=用户',
          phone,
          isLogin: true
        }
        saveUserInfo(userInfo)
        resolve(userInfo)
      } else {
        reject(new Error('验证码错误'))
      }
    }, 1000)
  })
}

// 退出登录
export const logout = (): boolean => {
  return clearUserInfo()
}
