import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { getUserInfo, logout, UserInfo } from '@/utils/user'
import {
  getMerchantInfo,
  getMerchantStatus,
  getMerchantStatusName,
  MerchantStatus
} from '@/utils/merchant'
import './index.scss'

interface MenuItem {
  id: string
  icon: string
  title: string
  subtitle?: string
}

export default function Mine() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [merchantStatus, setMerchantStatus] = useState<MerchantStatus>(MerchantStatus.NONE)

  const menuItems: MenuItem[] = [
    { id: 'orders', icon: '📋', title: '我的订单', subtitle: '查看装修进度' },
    { id: 'consultations', icon: '💬', title: '我的咨询', subtitle: '查看咨询记录' },
    { id: 'appointments', icon: '📅', title: '我的预约', subtitle: '设计师预约记录' },
    { id: 'favorites', icon: '❤️', title: '我的收藏', subtitle: '收藏的案例和设计' },
    { id: 'calculator', icon: '🧮', title: '装修计算器', subtitle: '快速估算装修费用' },
    { id: 'customer-service', icon: '📞', title: '在线客服', subtitle: '7×24小时服务' },
    { id: 'about', icon: 'ℹ️', title: '关于我们', subtitle: '了解更多' }
  ]

  useEffect(() => {
    loadUserInfo()
  }, [])

  // 加载用户信息
  const loadUserInfo = () => {
    const info = getUserInfo()
    setUserInfo(info)

    // 加载商家状态
    const status = getMerchantStatus()
    setMerchantStatus(status)
  }

  // 页面显示时重新加载用户信息
  useEffect(() => {
    Taro.useDidShow(() => {
      loadUserInfo()
    })
  }, [])

  const handleLogin = () => {
    Taro.navigateTo({
      url: '/pages/login/index'
    })
  }

  const handleMenuItem = (itemId: string) => {
    // 部分功能需要登录
    const needLoginItems = ['orders', 'consultations', 'appointments', 'favorites']

    if (needLoginItems.includes(itemId) && !userInfo?.isLogin) {
      Taro.showModal({
        title: '提示',
        content: '该功能需要登录后使用',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            handleLogin()
          }
        }
      })
      return
    }

    // 根据不同菜单项跳转
    switch (itemId) {
      case 'consultations':
        // 跳转到我的咨询页面（用户端咨询历史）
        Taro.navigateTo({
          url: '/pages/my-consultations/index'
        })
        break
      case 'customer-service':
        // 直接打开客服聊天
        Taro.navigateTo({
          url: '/pages/chat/index?type=consult'
        })
        break
      default:
        Taro.showToast({
          title: '功能开发中',
          icon: 'none',
          duration: 1500
        })
        break
    }
  }

  // 处理商家中心入口
  const handleMerchantCenter = () => {
    if (!userInfo?.isLogin) {
      Taro.showModal({
        title: '提示',
        content: '请先登录',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            handleLogin()
          }
        }
      })
      return
    }

    // 根据商家状态跳转
    if (merchantStatus === MerchantStatus.NONE) {
      // 未申请，跳转到申请页
      Taro.navigateTo({
        url: '/pages/merchant-apply/index'
      })
    } else {
      // 已申请或已通过，跳转到商家中心
      Taro.navigateTo({
        url: '/pages/merchant-center/index'
      })
    }
  }

  const handleSetting = () => {
    if (!userInfo?.isLogin) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 1500
      })
      return
    }

    Taro.showModal({
      title: '设置',
      content: '是否退出登录？',
      confirmText: '退出',
      confirmColor: '#ff6b6b',
      success: (res) => {
        if (res.confirm) {
          logout()
          setUserInfo(null)
          Taro.showToast({
            title: '已退出登录',
            icon: 'success',
            duration: 1500
          })
        }
      }
    })
  }

  return (
    <View className='mine-page'>
      {/* 用户信息区域 */}
      <View className='user-section'>
        <View className='user-info'>
          <Image
            src={userInfo?.avatar || 'https://via.placeholder.com/140x140/667eea/ffffff?text=头像'}
            className='user-avatar'
            mode='aspectFill'
            onClick={!userInfo?.isLogin ? handleLogin : undefined}
          />
          <View className='user-details'>
            <View className='user-name' onClick={!userInfo?.isLogin ? handleLogin : undefined}>
              {userInfo?.isLogin ? userInfo.nickname : '点击登录'}
            </View>
            <View className='user-desc'>
              {userInfo?.isLogin ? (userInfo.phone || '已登录') : '登录后享受更多服务'}
            </View>
          </View>
        </View>
        <View className='setting-icon' onClick={handleSetting}>
          ⚙️
        </View>
      </View>

      {/* 快捷入口 */}
      <View className='quick-entry'>
        <View className='entry-item'>
          <View className='entry-value'>0</View>
          <View className='entry-label'>待付款</View>
        </View>
        <View className='entry-item'>
          <View className='entry-value'>0</View>
          <View className='entry-label'>进行中</View>
        </View>
        <View className='entry-item'>
          <View className='entry-value'>0</View>
          <View className='entry-label'>已完成</View>
        </View>
        <View className='entry-item'>
          <View className='entry-value'>0</View>
          <View className='entry-label'>售后</View>
        </View>
      </View>

      {/* 商家入口 */}
      <View className='merchant-entry' onClick={handleMerchantCenter}>
        <View className='merchant-entry-content'>
          <View className='merchant-entry-left'>
            <View className='merchant-icon'>🏢</View>
            <View className='merchant-text'>
              <View className='merchant-title'>
                {merchantStatus === MerchantStatus.NONE ? '申请成为商家' : '商家中心'}
              </View>
              <View className='merchant-subtitle'>
                {merchantStatus === MerchantStatus.NONE
                  ? '装修公司/设计师入驻'
                  : getMerchantStatusName(merchantStatus)}
              </View>
            </View>
          </View>
          <View className='merchant-entry-arrow'>›</View>
        </View>
      </View>

      {/* 功能菜单 */}
      <View className='menu-section'>
        {menuItems.map(item => (
          <View
            key={item.id}
            className='menu-item'
            onClick={() => handleMenuItem(item.id)}
          >
            <View className='menu-left'>
              <View className='menu-icon'>{item.icon}</View>
              <View className='menu-text'>
                <View className='menu-title'>{item.title}</View>
                {item.subtitle && (
                  <View className='menu-subtitle'>{item.subtitle}</View>
                )}
              </View>
            </View>
            <View className='menu-arrow'>›</View>
          </View>
        ))}
      </View>

      {/* 版本信息 */}
      <View className='version-info'>
        <Text className='version-text'>装修小程序 v1.0.0</Text>
      </View>
    </View>
  )
}
