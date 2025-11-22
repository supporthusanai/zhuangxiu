import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect, useRef } from 'react'
import { mockLogin, wechatLoginComplete } from '@/utils/user'
import './index.scss'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  // 发送验证码
  const handleSendCode = () => {
    if (!phone) {
      Taro.showToast({
        title: '请输入手机号',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      Taro.showToast({
        title: '手机号格式不正确',
        icon: 'none',
        duration: 2000
      })
      return
    }

    // 清除之前的定时器（如果存在）
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // 模拟发送验证码
    Taro.showToast({
      title: '验证码已发送',
      icon: 'success',
      duration: 2000
    })

    // 开始倒计时
    let count = 60
    setCountdown(count)
    timerRef.current = setInterval(() => {
      count--
      setCountdown(count)
      if (count <= 0 && timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }, 1000)
  }

  // 登录
  const handleLogin = async () => {
    if (!phone) {
      Taro.showToast({
        title: '请输入手机号',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!code) {
      Taro.showToast({
        title: '请输入验证码',
        icon: 'none',
        duration: 2000
      })
      return
    }

    setLoading(true)
    try {
      await mockLogin(phone, code)
      Taro.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 2000
      })

      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        // 返回上一页或跳转到首页
        if (Taro.getCurrentPages().length > 1) {
          Taro.navigateBack()
        } else {
          Taro.switchTab({
            url: '/pages/index/index'
          })
        }
      }, 1500)
    } catch (error: any) {
      Taro.showToast({
        title: error.message || '登录失败',
        icon: 'none',
        duration: 2000
      })
    } finally {
      setLoading(false)
    }
  }

  // 微信一键登录（仅微信小程序）
  const handleWechatLogin = async () => {
    try {
      setLoading(true)

      // 使用标准的微信登录流程
      const userInfo = await wechatLoginComplete()

      console.log('微信登录成功', userInfo)

      Taro.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 2000
      })

      setTimeout(() => {
        if (Taro.getCurrentPages().length > 1) {
          Taro.navigateBack()
        } else {
          Taro.switchTab({
            url: '/pages/index/index'
          })
        }
      }, 1500)
    } catch (error: any) {
      console.error('微信登录失败', error)
      Taro.showToast({
        title: error.message || '登录失败',
        icon: 'none',
        duration: 2000
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='login-page'>
      <View className='login-container'>
        {/* Logo和标题 */}
        <View className='login-header'>
          <View className='logo'>🏠</View>
          <View className='title'>装修小程序</View>
          <View className='subtitle'>欢迎登录，开启装修之旅</View>
        </View>

        {/* 登录表单 */}
        <View className='login-form'>
          {/* 手机号输入 */}
          <View className='form-item'>
            <View className='input-label'>手机号</View>
            <Input
              className='input-field'
              type='number'
              maxlength={11}
              placeholder='请输入手机号'
              value={phone}
              onInput={(e) => setPhone(e.detail.value)}
            />
          </View>

          {/* 验证码输入 */}
          <View className='form-item'>
            <View className='input-label'>验证码</View>
            <View className='code-input-wrapper'>
              <Input
                className='input-field code-input'
                type='number'
                maxlength={6}
                placeholder='请输入验证码'
                value={code}
                onInput={(e) => setCode(e.detail.value)}
              />
              <Button
                className='send-code-btn'
                disabled={countdown > 0}
                onClick={handleSendCode}
              >
                {countdown > 0 ? `${countdown}s` : '发送验证码'}
              </Button>
            </View>
          </View>

          {/* 提示信息 */}
          <View className='login-tip'>
            <Text className='tip-text'>测试验证码：123456</Text>
          </View>

          {/* 登录按钮 */}
          <Button
            className='login-btn'
            loading={loading}
            onClick={handleLogin}
          >
            登录
          </Button>

          {/* 分割线 */}
          <View className='divider'>
            <View className='divider-line' />
            <Text className='divider-text'>其他登录方式</Text>
            <View className='divider-line' />
          </View>

          {/* 微信登录按钮 */}
          <Button
            className='wechat-login-btn'
            loading={loading}
            onClick={handleWechatLogin}
          >
            <Text className='wechat-icon'>💬</Text>
            <Text>微信一键登录</Text>
          </Button>

          {/* 说明文字 */}
          <View className='wechat-tip'>
            <Text className='tip-note'>• 首次登录将自动注册账号</Text>
            <Text className='tip-note'>• 使用微信授权获取头像和昵称</Text>
          </View>
        </View>

        {/* 用户协议 */}
        <View className='agreement'>
          <Text className='agreement-text'>
            登录即表示同意
            <Text className='agreement-link'>《用户协议》</Text>
            和
            <Text className='agreement-link'>《隐私政策》</Text>
          </Text>
        </View>
      </View>
    </View>
  )
}
