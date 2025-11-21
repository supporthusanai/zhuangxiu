import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { MobileOutlined, SafetyOutlined } from '@ant-design/icons';
import { login, sendCode } from '../services/api';

interface LoginProps {
  onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [form] = Form.useForm();

  const handleSendCode = async () => {
    const phone = form.getFieldValue('phone');
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      message.error('请输入正确的手机号');
      return;
    }

    try {
      await sendCode(phone);
      message.success('验证码已发送');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      // Error handled by interceptor
    }
  };

  const handleSubmit = async (values: { phone: string; code: string }) => {
    setLoading(true);
    try {
      const res: any = await login(values);
      if (res.data?.user?.role !== 'admin') {
        message.error('权限不足，仅管理员可登录');
        return;
      }
      localStorage.setItem('admin_token', res.data.token);
      onLogin(res.data.user);
      message.success('登录成功');
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Card style={{ width: 400 }} title={<div style={{ textAlign: 'center', fontSize: 20 }}>装修小程序管理后台</div>}>
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="phone" rules={[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }]}>
            <Input prefix={<MobileOutlined />} placeholder="手机号" size="large" />
          </Form.Item>
          <Form.Item name="code" rules={[{ required: true, message: '请输入验证码' }]}>
            <Input
              prefix={<SafetyOutlined />}
              placeholder="验证码"
              size="large"
              suffix={
                <Button type="link" disabled={countdown > 0} onClick={handleSendCode}>
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </Button>
              }
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              登录
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
          开发环境验证码请查看后端日志
        </div>
      </Card>
    </div>
  );
};

export default Login;
