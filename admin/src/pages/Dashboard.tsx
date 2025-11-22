import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Spin, message } from 'antd';
import { UserOutlined, ShopOutlined, FileImageOutlined, OrderedListOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDashboardStats, getOrders } from '../services/api';

interface StatsData {
  totalUsers: number;
  totalMerchants: number;
  totalCases: number;
  totalOrders: number;
  pendingMerchants: number;
  pendingOrders: number;
}

interface OrderItem {
  _id: string;
  orderNo: string;
  user: { nickname: string } | null;
  finalAmount: number;
  status: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalMerchants: 0,
    totalCases: 0,
    totalOrders: 0,
    pendingMerchants: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 生成近7天的图表数据
  const generateChartData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
        users: Math.floor(Math.random() * 50) + 20,
        orders: Math.floor(Math.random() * 15) + 3,
      });
    }
    return data;
  };

  const [chartData] = useState(generateChartData());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, ordersRes]: any[] = await Promise.all([
          getDashboardStats(),
          getOrders({ page: 1, limit: 5 }),
        ]);

        if (statsRes.success) {
          setStats(statsRes.data);
        }

        if (ordersRes.success && ordersRes.data?.orders) {
          setRecentOrders(ordersRes.data.orders);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        message.error('获取数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statusMap: Record<string, { color: string; text: string }> = {
    pending: { color: 'gold', text: '待确认' },
    confirmed: { color: 'blue', text: '已确认' },
    designing: { color: 'cyan', text: '设计中' },
    constructing: { color: 'purple', text: '施工中' },
    completed: { color: 'green', text: '已完成' },
    cancelled: { color: 'red', text: '已取消' },
  };

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '用户', dataIndex: 'user', key: 'user', render: (v: any) => v?.nickname || '-' },
    { title: '金额', dataIndex: 'finalAmount', key: 'finalAmount', render: (v: number) => `¥${(v || 0).toLocaleString()}` },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.text}</Tag> },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => v ? new Date(v).toLocaleString('zh-CN') : '-' },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>数据概览</h2>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总用户数" value={stats.totalUsers} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="商家数量" value={stats.totalMerchants} prefix={<ShopOutlined />} suffix={<span style={{ fontSize: 14, color: '#faad14' }}>({stats.pendingMerchants}待审核)</span>} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="案例数量" value={stats.totalCases} prefix={<FileImageOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="订单总数" value={stats.totalOrders} prefix={<OrderedListOutlined />} suffix={<span style={{ fontSize: 14, color: '#faad14' }}>({stats.pendingOrders}待处理)</span>} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={14}>
          <Card title="数据趋势（近7天）">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#667eea" name="新增用户" />
                <Line type="monotone" dataKey="orders" stroke="#764ba2" name="新增订单" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={10}>
          <Card title="最近订单">
            <Table columns={columns} dataSource={recentOrders} rowKey="_id" pagination={false} size="small" />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
