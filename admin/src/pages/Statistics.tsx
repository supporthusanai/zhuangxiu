import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, Table } from 'antd';
import {
  UserOutlined,
  ShopOutlined,
  FileImageOutlined,
  OrderedListOutlined,
  StarOutlined,
  CalendarOutlined,
  TeamOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { getDetailedStats } from '../services/api';

const Statistics = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res: any = await getDetailedStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (error) {
        console.error('获取统计数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  const overview = stats?.overview || {};
  const recent = stats?.recent || {};
  const distribution = stats?.distribution || {};

  const roleColumns = [
    { title: '用户角色', dataIndex: '_id', key: '_id', render: (role: string) => {
      const map: Record<string, string> = { user: '普通用户', merchant: '商家', admin: '管理员' };
      return map[role] || role;
    }},
    { title: '数量', dataIndex: 'count', key: 'count' },
  ];

  const statusColumns = [
    { title: '订单状态', dataIndex: '_id', key: '_id', render: (status: string) => {
      const map: Record<string, string> = {
        pending: '待处理', confirmed: '已确认', in_progress: '进行中',
        completed: '已完成', cancelled: '已取消',
      };
      return map[status] || status;
    }},
    { title: '数量', dataIndex: 'count', key: 'count' },
  ];

  return (
    <div>
      <Card title="数据概览" style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={12} sm={8} md={6}>
            <Statistic title="总用户数" value={overview.totalUsers || 0} prefix={<UserOutlined />} />
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Statistic title="认证商家" value={overview.totalMerchants || 0} prefix={<ShopOutlined />} />
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Statistic title="发布案例" value={overview.totalCases || 0} prefix={<FileImageOutlined />} />
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Statistic title="总订单数" value={overview.totalOrders || 0} prefix={<OrderedListOutlined />} />
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Statistic title="评价总数" value={overview.totalReviews || 0} prefix={<StarOutlined />} />
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Statistic title="预约总数" value={overview.totalAppointments || 0} prefix={<CalendarOutlined />} />
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Statistic title="设计师总数" value={overview.totalDesigners || 0} prefix={<TeamOutlined />} />
          </Col>
        </Row>
      </Card>

      <Card title="近7天数据" style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={12} sm={8} md={6}>
            <Statistic
              title="新增用户"
              value={recent.recentUsers || 0}
              prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={12} sm={8} md={6}>
            <Statistic
              title="新增订单"
              value={recent.recentOrders || 0}
              prefix={<RiseOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
        </Row>
      </Card>

      <Row gutter={24}>
        <Col xs={24} md={12}>
          <Card title="用户角色分布">
            <Table
              columns={roleColumns}
              dataSource={distribution.usersByRole || []}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="订单状态分布">
            <Table
              columns={statusColumns}
              dataSource={distribution.ordersByStatus || []}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Statistics;
