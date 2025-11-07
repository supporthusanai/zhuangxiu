import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import {
  getMerchantInfo,
  getMerchantTypeName,
  getMerchantStatusName,
  MerchantStatus,
  MerchantInfo
} from '@/utils/merchant'
import './index.scss'

interface MenuItem {
  id: string
  icon: string
  title: string
  badge?: number
}

export default function MerchantCenter() {
  const [merchantInfo, setMerchantInfo] = useState<MerchantInfo | null>(null)

  const menuItems: MenuItem[] = [
    { id: 'cases', icon: '📸', title: '案例管理', badge: 0 },
    { id: 'orders', icon: '📋', title: '订单管理', badge: 3 },
    { id: 'inquiries', icon: '💬', title: '咨询管理', badge: 5 },
    { id: 'appointments', icon: '📅', title: '预约管理', badge: 2 },
    { id: 'finance', icon: '💰', title: '财务管理' },
    { id: 'data', icon: '📊', title: '数据统计' },
    { id: 'settings', icon: '⚙️', title: '店铺设置' }
  ]

  useEffect(() => {
    loadMerchantInfo()
  }, [])

  const loadMerchantInfo = () => {
    const info = getMerchantInfo()
    setMerchantInfo(info)

    if (!info || info.status === MerchantStatus.NONE) {
      Taro.showModal({
        title: '提示',
        content: '您还未申请商家入驻',
        confirmText: '去申请',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({
              url: '/pages/merchant-apply/index'
            })
          } else {
            Taro.navigateBack()
          }
        }
      })
    }
  }

  const handleMenuItem = (itemId: string) => {
    if (merchantInfo?.status !== MerchantStatus.APPROVED) {
      Taro.showToast({
        title: '等待审核通过后使用',
        icon: 'none',
        duration: 2000
      })
      return
    }

    Taro.showToast({
      title: `打开${itemId}`,
      icon: 'none',
      duration: 1500
    })
  }

  const getStatusColor = (status: MerchantStatus): string => {
    switch (status) {
      case MerchantStatus.PENDING:
        return '#ff9800'
      case MerchantStatus.APPROVED:
        return '#52c41a'
      case MerchantStatus.REJECTED:
        return '#f5222d'
      default:
        return '#999'
    }
  }

  if (!merchantInfo) {
    return (
      <View className='merchant-center-page'>
        <View className='loading-container'>
          <Text>加载中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='merchant-center-page'>
      {/* 商家信息卡片 */}
      <View className='merchant-card'>
        <View className='card-header'>
          <View className='merchant-info'>
            <View className='merchant-name'>{merchantInfo.companyName}</View>
            <View className='merchant-type'>{getMerchantTypeName(merchantInfo.type)}</View>
          </View>
          <View
            className='merchant-status'
            style={{ color: getStatusColor(merchantInfo.status) }}
          >
            {getMerchantStatusName(merchantInfo.status)}
          </View>
        </View>

        <View className='card-divider' />

        <View className='card-info'>
          <View className='info-item'>
            <Text className='info-label'>联系人：</Text>
            <Text className='info-value'>{merchantInfo.contactName}</Text>
          </View>
          <View className='info-item'>
            <Text className='info-label'>电话：</Text>
            <Text className='info-value'>{merchantInfo.contactPhone}</Text>
          </View>
          <View className='info-item'>
            <Text className='info-label'>地址：</Text>
            <Text className='info-value'>{merchantInfo.address}</Text>
          </View>
          <View className='info-item'>
            <Text className='info-label'>服务区域：</Text>
            <Text className='info-value'>{merchantInfo.serviceArea.join('、')}</Text>
          </View>
        </View>

        {merchantInfo.status === MerchantStatus.PENDING && (
          <View className='status-tip'>
            <Text className='tip-icon'>⏳</Text>
            <Text className='tip-text'>您的申请正在审核中，请耐心等待</Text>
          </View>
        )}

        {merchantInfo.status === MerchantStatus.REJECTED && (
          <View className='status-tip rejected'>
            <Text className='tip-icon'>❌</Text>
            <Text className='tip-text'>审核未通过，请重新提交申请</Text>
          </View>
        )}
      </View>

      {/* 数据概览 */}
      {merchantInfo.status === MerchantStatus.APPROVED && (
        <View className='data-overview'>
          <View className='overview-item'>
            <View className='overview-value'>156</View>
            <View className='overview-label'>案例数</View>
          </View>
          <View className='overview-item'>
            <View className='overview-value'>89</View>
            <View className='overview-label'>订单数</View>
          </View>
          <View className='overview-item'>
            <View className='overview-value'>4.8</View>
            <View className='overview-label'>评分</View>
          </View>
          <View className='overview-item'>
            <View className='overview-value'>1286</View>
            <View className='overview-label'>浏览量</View>
          </View>
        </View>
      )}

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
              <View className='menu-title'>{item.title}</View>
            </View>
            <View className='menu-right'>
              {item.badge !== undefined && item.badge > 0 && (
                <View className='menu-badge'>{item.badge}</View>
              )}
              <View className='menu-arrow'>›</View>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}
