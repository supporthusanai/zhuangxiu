import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Input, Button, message, Checkbox } from 'antd'
import { MobileOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons'
import { authApi } from '@/services/api'
import styles from './index.module.css'

const Register = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [form] = Form.useForm()

  const handleSendCode = async () => {
    const phone = form.getFieldValue('phone')
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

  const handleSubmit = async (values: { phone: string; code: string; nickname: string; agreement: boolean }) => {
    if (!values.agreement) {
      message.warning('请阅读并同意服务协议')
      return
    }

    setLoading(true)
    try {
      const res: any = await authApi.register({
        phone: values.phone,
        code: values.code,
        nickname: values.nickname,
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userInfo', JSON.stringify(res.data.user))
      message.success('注册成功')
      navigate('/')
    } catch (error: any) {
      message.error(error.message || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.register}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <Link to="/" className={styles.logo}>装修平台</Link>
            <h1>注册账号</h1>
          </div>

          <Form form={form} onFinish={handleSubmit} layout="vertical" size="large">
            <Form.Item
              name="phone"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
              ]}
            >
              <Input
                prefix={<MobileOutlined />}
                placeholder="请输入手机号"
              />
            </Form.Item>

            <Form.Item
              name="code"
              rules={[{ required: true, message: '请输入验证码' }]}
            >
              <div className={styles.codeInput}>
                <Input
                  prefix={<SafetyOutlined />}
                  placeholder="请输入验证码"
                />
                <Button
                  disabled={countdown > 0}
                  onClick={handleSendCode}
                >
                  {countdown > 0 ? `${countdown}s后重发` : '获取验证码'}
                </Button>
              </div>
            </Form.Item>

            <Form.Item
              name="nickname"
              rules={[{ required: true, message: '请输入昵称' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入昵称"
              />
            </Form.Item>

            <Form.Item name="agreement" valuePropName="checked">
              <Checkbox>
                我已阅读并同意 <a href="#">《服务协议》</a> 和 <a href="#">《隐私政策》</a>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                注册
              </Button>
            </Form.Item>
          </Form>

          <div className={styles.footer}>
            <span>已有账号？</span>
            <Link to="/login">立即登录</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
