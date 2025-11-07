import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { getUserInfo, logout, UserInfo } from '@/utils/user'
import './index.scss'

interface MenuItem {
  id: string
  icon: string
  title: string
  subtitle?: string
}

export default function Mine() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  const menuItems: MenuItem[] = [
    { id: 'orders', icon: '📋', title: '我的订单', subtitle: '查看装修进度' },
    { id: 'appointments', icon: '📅', title: '我的预约', subtitle: '设计师预约记录' },
    { id: 'favorites', icon: '❤️', title: '我的收藏', subtitle: '收藏的案例和设计' },
    { id: 'calculator', icon: '🧮', title: '装修计算器', subtitle: '快速估算装修费用' },
    { id: 'customer-service', icon: '💬', title: '在线客服', subtitle: '7×24小时服务' },
    { id: 'about', icon: 'ℹ️', title: '关于我们', subtitle: '了解更多' }
  ]

  useEffect(() => {
    loadUserInfo()
  }, [])

  // 加载用户信息
  const loadUserInfo = () => {
    const info = getUserInfo()
    setUserInfo(info)
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
    const needLoginItems = ['orders', 'appointments', 'favorites']

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

    Taro.showToast({
      title: `打开${itemId}`,
      icon: 'none',
      duration: 1500
    })
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
