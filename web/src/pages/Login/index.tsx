import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Input, Button, message, Tabs } from 'antd'
import { MobileOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons'
import { authApi } from '@/services/api'
import styles from './index.module.css'

const Login = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [loginType, setLoginType] = useState<'password' | 'sms'>('password')
  const [passwordForm] = Form.useForm()
  const [smsForm] = Form.useForm()

  const handleSendCode = async () => {
    const phone = smsForm.getFieldValue('phone')
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      message.warning('请输入正确的手机号')
      return
    }

    try {
      await authApi.sendCode(phone)
      message.success('验证码已发送')
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error: any) {
      message.error(error.message || '发送失败')
    }
  }

  // 密码登录
  const handlePasswordLogin = async (values: { phone: string; password: string }) => {
    setLoading(true)
    try {
      const res: any = await authApi.login(values)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userInfo', JSON.stringify(res.data.user))
      message.success('登录成功')
      navigate('/')
    } catch (error: any) {
      message.error(error.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  // 验证码登录
  const handleSmsLogin = async (values: { phone: string; code: string }) => {
    setLoading(true)
    try {
      const res: any = await authApi.phoneLogin(values)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userInfo', JSON.stringify(res.data.user))
      message.success('登录成功')
      navigate('/')
    } catch (error: any) {
      message.error(error.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  const tabItems = [
    {
      key: 'password',
      label: '密码登录',
      children: (
        <Form form={passwordForm} onFinish={handlePasswordLogin} layout="vertical" size="large">
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
            ]}
          >
            <Input prefix={<MobileOutlined />} placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'sms',
      label: '验证码登录',
      children: (
        <Form form={smsForm} onFinish={handleSmsLogin} layout="vertical" size="large">
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
            ]}
          >
            <Input prefix={<MobileOutlined />} placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item
            name="code"
            rules={[{ required: true, message: '请输入验证码' }]}
          >
            <div className={styles.codeInput}>
              <Input prefix={<SafetyOutlined />} placeholder="请输入验证码" />
              <Button disabled={countdown > 0} onClick={handleSendCode}>
                {countdown > 0 ? `${countdown}s后重发` : '获取验证码'}
              </Button>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ]

  return (
    <div className={styles.login}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <Link to="/" className={styles.logo}>装修平台</Link>
            <h1>欢迎登录</h1>
          </div>

          <Tabs
            activeKey={loginType}
            onChange={(key) => setLoginType(key as 'password' | 'sms')}
            items={tabItems}
            centered
          />

          <div className={styles.footer}>
            <span>还没有账号？</span>
            <Link to="/register">立即注册</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
