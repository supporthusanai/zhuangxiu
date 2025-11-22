import { useState, useEffect } from 'react';
import { Table, Card, Tag, Select, Space, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getAppointments } from '../services/api';

const statusMap: Record<string, { text: string; color: string }> = {
  pending: { text: '待确认', color: 'orange' },
  confirmed: { text: '已确认', color: 'blue' },
  completed: { text: '已完成', color: 'green' },
  cancelled: { text: '已取消', color: 'red' },
};

const Appointments = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [status, setStatus] = useState<string | undefined>();

  const fetchAppointments = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (status) params.status = status;
      const res: any = await getAppointments(params);
      if (res.success) {
        setAppointments(res.data?.appointments || []);
        setPagination({
          current: res.data?.pagination?.page || 1,
          pageSize: res.data?.pagination?.limit || 10,
          total: res.data?.pagination?.total || 0,
        });
      }
    } catch (error) {
      console.error('获取预约列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const columns = [
    {
      title: '预约用户',
      dataIndex: 'user',
      key: 'user',
      render: (user: any) => (
        <div>
          <div>{user?.nickname || '-'}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{user?.phone || '-'}</div>
        </div>
      ),
    },
    {
      title: '商家',
      dataIndex: 'merchant',
      key: 'merchant',
      render: (merchant: any) => merchant?.companyName || '-',
    },
    {
      title: '预约时间',
      dataIndex: 'appointmentTime',
      key: 'appointmentTime',
      render: (date: string) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => {
        const info = statusMap[s] || { text: s, color: 'default' };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <Card title="预约管理">
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="筛选状态"
          allowClear
          style={{ width: 150 }}
          value={status}
          onChange={(v) => setStatus(v)}
          options={[
            { value: 'pending', label: '待确认' },
            { value: 'confirmed', label: '已确认' },
            { value: 'completed', label: '已完成' },
            { value: 'cancelled', label: '已取消' },
          ]}
        />
        <Button type="primary" icon={<SearchOutlined />} onClick={() => fetchAppointments(1, pagination.pageSize)}>
          筛选
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={appointments}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => fetchAppointments(page, pageSize),
        }}
      />
    </Card>
  );
};

export default Appointments;
