import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import { UserOutlined, ShopOutlined, FileImageOutlined, OrderedListOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// 模拟数据（实际应从API获取）
const mockStats = {
  totalUsers: 1256,
  totalMerchants: 48,
  totalCases: 320,
  totalOrders: 186,
  pendingMerchants: 5,
  pendingOrders: 12,
};

const mockChartData = [
  { date: '01-15', users: 30, orders: 5 },
  { date: '01-16', users: 45, orders: 8 },
  { date: '01-17', users: 38, orders: 6 },
  { date: '01-18', users: 52, orders: 12 },
  { date: '01-19', users: 48, orders: 9 },
  { date: '01-20', users: 65, orders: 15 },
  { date: '01-21', users: 78, orders: 18 },
];

const mockRecentOrders = [
  { id: '1', orderNo: 'ZX20240121ABC', user: '张三', amount: 150000, status: 'pending', createdAt: '2024-01-21 14:30' },
  { id: '2', orderNo: 'ZX20240121DEF', user: '李四', amount: 280000, status: 'confirmed', createdAt: '2024-01-21 10:15' },
  { id: '3', orderNo: 'ZX20240120GHI', user: '王五', amount: 95000, status: 'designing', createdAt: '2024-01-20 16:45' },
];

const Dashboard: React.FC = () => {
  const [stats] = useState(mockStats);
  const [chartData] = useState(mockChartData);
  const [recentOrders] = useState(mockRecentOrders);

  useEffect(() => {
    // 这里应该调用API获取真实数据
    // getDashboardStats().then(res => setStats(res.data));
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
    { title: '用户', dataIndex: 'user', key: 'user' },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${(v / 100).toLocaleString()}` },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.text}</Tag> },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
  ];

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
            <Table columns={columns} dataSource={recentOrders} rowKey="id" pagination={false} size="small" />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
