import { View, Text, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { getUserInfo, saveUserInfo, type UserInfo } from '@/utils/user'
import './index.scss'

export default function ProfileEdit() {
  const [avatar, setAvatar] = useState('')
  const [nickname, setNickname] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | 'unknown'>('unknown')
  const [region, setRegion] = useState('')
  const [signature, setSignature] = useState('')

  useEffect(() => {
    const userInfo = getUserInfo()
    if (userInfo && userInfo.isLogin) {
      setAvatar(userInfo.avatar || '')
      setNickname(userInfo.nickname || '')
      setGender((userInfo.gender as 'male' | 'female' | 'unknown') || 'unknown')
      setRegion(userInfo.region || '')
      setSignature(userInfo.signature || '')
    }
  }, [])

  const handleChooseAvatar = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        setAvatar(res.tempFilePaths[0])
      }
    })
  }

  const handleGenderChange = () => {
    Taro.showActionSheet({
      itemList: ['男', '女', '保密'],
      success: (res) => {
        const genders: Array<'male' | 'female' | 'unknown'> = ['male', 'female', 'unknown']
        setGender(genders[res.tapIndex])
      }
    })
  }

  const handleRegionChange = () => {
    Taro.chooseLocation({
      success: (res) => {
        setRegion(res.address || res.name)
      },
      fail: () => {
        Taro.showToast({
          title: '获取位置失败',
          icon: 'none'
        })
      }
    })
  }

  const handleSave = () => {
    if (!nickname.trim()) {
      Taro.showToast({
        title: '请输入昵称',
        icon: 'none',
        duration: 2000
      })
      return
    }

    const userInfo = getUserInfo()
    const updatedUserInfo: UserInfo = {
      id: userInfo?.id || '',
      avatar,
      nickname: nickname.trim(),
      gender,
      region,
      signature,
      phone: userInfo?.phone,
      isLogin: true
    }

    saveUserInfo(updatedUserInfo)

    Taro.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 2000
    })

    setTimeout(() => {
      Taro.navigateBack()
    }, 2000)
  }

  const getGenderText = () => {
    const genderMap = {
      male: '男',
      female: '女',
      unknown: '保密'
    }
    return genderMap[gender]
  }

  return (
    <View className='profile-edit-page'>
      {/* 头像 */}
      <View className='edit-item' onClick={handleChooseAvatar}>
        <View className='item-label'>头像</View>
        <View className='item-value'>
          <Image
            src={avatar || 'https://via.placeholder.com/100x100/667eea/ffffff?text=头像'}
            className='avatar-image'
            mode='aspectFill'
          />
          <Text className='arrow'>›</Text>
        </View>
      </View>

      {/* 昵称 */}
      <View className='edit-item'>
        <View className='item-label'>昵称</View>
        <View className='item-value'>
          <Input
            className='input-field'
            placeholder='请输入昵称'
            value={nickname}
            onInput={(e) => setNickname(e.detail.value)}
            maxlength={20}
          />
        </View>
      </View>

      {/* 性别 */}
      <View className='edit-item' onClick={handleGenderChange}>
        <View className='item-label'>性别</View>
        <View className='item-value'>
          <Text className='value-text'>{getGenderText()}</Text>
          <Text className='arrow'>›</Text>
        </View>
      </View>

      {/* 地区 */}
      <View className='edit-item' onClick={handleRegionChange}>
        <View className='item-label'>地区</View>
        <View className='item-value'>
          <Text className='value-text'>{region || '未设置'}</Text>
          <Text className='arrow'>›</Text>
        </View>
      </View>

      {/* 个性签名 */}
      <View className='edit-item signature-item'>
        <View className='item-label'>个性签名</View>
        <View className='signature-input-wrap'>
          <Input
            className='signature-input'
            placeholder='说点什么吧...'
            value={signature}
            onInput={(e) => setSignature(e.detail.value)}
            maxlength={50}
          />
          <Text className='char-count'>{signature.length}/50</Text>
        </View>
      </View>

      {/* 保存按钮 */}
      <View className='save-btn' onClick={handleSave}>
        保存
      </View>

      {/* 提示 */}
      <View className='tips'>
        <Text className='tips-text'>* 修改后将立即生效</Text>
      </View>
    </View>
  )
}
