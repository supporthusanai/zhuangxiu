import Taro from '@tarojs/taro'

export interface UserInfo {
  id: string
  nickname: string
  avatar: string
  phone?: string
  gender?: 'male' | 'female' | 'unknown'
  region?: string
  signature?: string
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

/**
 * 微信小程序登录
 * 标准流程：
 * 1. 调用 wx.login 获取 code
 * 2. 将 code 发送到开发者服务器
 * 3. 服务器使用 code 换取 openid 和 session_key
 * 4. 服务器返回自定义登录态（token）
 */
export const wechatLogin = async (): Promise<{ code: string }> => {
  try {
    const res = await Taro.login()
    return { code: res.code }
  } catch (error) {
    console.error('微信登录失败', error)
    throw new Error('微信登录失败')
  }
}

/**
 * 获取微信用户信息
 * 需要用户主动触发（如点击按钮）
 */
export const getWechatUserProfile = async (): Promise<any> => {
  try {
    const res = await Taro.getUserProfile({
      desc: '用于完善用户资料'
    })
    return res.userInfo
  } catch (error) {
    console.error('获取用户信息失败', error)
    throw new Error('获取用户信息失败')
  }
}

/**
 * 完整的微信登录流程
 * 1. 获取 code
 * 2. 获取用户信息（需要用户授权）
 * 3. 发送到后端服务器
 * 4. 保存登录状态
 */
export const wechatLoginComplete = async (): Promise<UserInfo> => {
  try {
    // 1. 获取 code
    const { code: _code } = await wechatLogin()

    // 2. 获取用户信息
    const wxUserInfo = await getWechatUserProfile()

    // 3. 这里应该调用后端接口，将 code 和 userInfo 发送给服务器
    // const response = await fetch('/api/wechat-login', {
    //   method: 'POST',
    //   body: JSON.stringify({ code, userInfo: wxUserInfo })
    // })

    // 4. 模拟后端返回的用户信息
    const userInfo: UserInfo = {
      id: Date.now().toString(),
      nickname: wxUserInfo.nickName,
      avatar: wxUserInfo.avatarUrl,
      isLogin: true
    }

    saveUserInfo(userInfo)
    return userInfo
  } catch (error) {
    console.error('微信登录失败', error)
    throw error
  }
}

/**
 * 静默登录（不获取用户信息）
 * 用于自动登录场景
 */
export const silentLogin = async (): Promise<{ code: string }> => {
  try {
    const { code } = await wechatLogin()

    // 这里应该将 code 发送到后端，后端返回 token
    // const response = await fetch('/api/silent-login', {
    //   method: 'POST',
    //   body: JSON.stringify({ code })
    // })

    return { code }
  } catch (error) {
    console.error('静默登录失败', error)
    throw error
  }
}
