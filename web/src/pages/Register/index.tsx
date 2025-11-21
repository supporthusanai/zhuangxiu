import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Input, Button, message, Checkbox } from 'antd'
import { MobileOutlined, LockOutlined, UserOutlined } from '@ant-design/icons'
import { authApi } from '@/services/api'
import styles from './index.module.css'

const Register = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const handleSubmit = async (values: { phone: string; password: string; confirmPassword: string; nickname: string; agreement: boolean }) => {
    if (!values.agreement) {
      message.warning('请阅读并同意服务协议')
      return
    }

    if (values.password !== values.confirmPassword) {
      message.warning('两次输入的密码不一致')
      return
    }

    setLoading(true)
    try {
      const res: any = await authApi.register({
        phone: values.phone,
        password: values.password,
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
              name="nickname"
              rules={[{ required: true, message: '请输入昵称' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入昵称"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请确认密码"
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
