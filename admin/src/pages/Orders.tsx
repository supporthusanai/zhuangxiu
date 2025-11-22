import { useState, useEffect } from 'react';
import { Table, Card, Input, Select, Tag, Space, Button, Modal, Descriptions, Timeline } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getOrders, getOrderDetail } from '../services/api';

interface Order {
  _id: string;
  orderNo: string;
  user?: { nickname: string; phone: string };
  merchant?: { companyName: string };
  projectName: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchOrders = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const res: any = await getOrders(params);
      if (res.success) {
        setOrders(res.data?.orders || []);
        setPagination({
          current: res.data?.pagination?.page || page,
          pageSize: res.data?.pagination?.limit || limit,
          total: res.data?.pagination?.total || 0,
        });
      }
    } catch (error) {
      console.error('获取订单列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearch = () => {
    fetchOrders(1, pagination.pageSize);
  };

  const handleTableChange = (pag: any) => {
    fetchOrders(pag.current, pag.pageSize);
  };

  const handleViewDetail = async (record: Order) => {
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      const res: any = await getOrderDetail(record._id);
      if (res.success) {
        setCurrentOrder(res.data);
      }
    } catch (error) {
      setCurrentOrder(record);
    } finally {
      setDetailLoading(false);
    }
  };

  const statusMap: Record<string, { color: string; text: string }> = {
    pending: { color: 'gold', text: '待确认' },
    confirmed: { color: 'blue', text: '已确认' },
    designing: { color: 'cyan', text: '设计中' },
    constructing: { color: 'purple', text: '施工中' },
    completed: { color: 'green', text: '已完成' },
    cancelled: { color: 'red', text: '已取消' },
  };

  const paymentMap: Record<string, { color: string; text: string }> = {
    unpaid: { color: 'red', text: '未支付' },
    partial: { color: 'orange', text: '部分支付' },
    paid: { color: 'green', text: '已支付' },
  };

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '用户', key: 'user', render: (_: any, r: Order) => r.user?.nickname || r.user?.phone || '-' },
    { title: '商家', key: 'merchant', render: (_: any, r: Order) => r.merchant?.companyName || '-' },
    { title: '项目', dataIndex: 'projectName', key: 'projectName' },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', render: (v: number) => v ? `¥${v.toLocaleString()}` : '-' },
    { title: '订单状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.text || v}</Tag> },
    { title: '支付状态', dataIndex: 'paymentStatus', key: 'paymentStatus', render: (v: string) => <Tag color={paymentMap[v]?.color}>{paymentMap[v]?.text || v}</Tag> },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => v ? new Date(v).toLocaleString() : '-' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Order) => (
        <Button type="link" onClick={() => handleViewDetail(record)}>详情</Button>
      ),
    },
  ];

  return (
    <>
      <Card
        title="订单管理"
        extra={
          <Space>
            <Input
              placeholder="搜索订单"
              prefix={<SearchOutlined />}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
            <Button type="primary" onClick={handleSearch}>搜索</Button>
            <Select placeholder="状态筛选" allowClear style={{ width: 120 }} value={statusFilter} onChange={setStatusFilter}>
              <Select.Option value="pending">待确认</Select.Option>
              <Select.Option value="confirmed">已确认</Select.Option>
              <Select.Option value="designing">设计中</Select.Option>
              <Select.Option value="constructing">施工中</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
              <Select.Option value="cancelled">已取消</Select.Option>
            </Select>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title="订单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
        loading={detailLoading}
      >
        {currentOrder && (
          <>
            <Descriptions column={2} bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="订单号" span={2}>{currentOrder.orderNo}</Descriptions.Item>
              <Descriptions.Item label="用户">{currentOrder.user?.nickname || currentOrder.user?.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="商家">{currentOrder.merchant?.companyName || '-'}</Descriptions.Item>
              <Descriptions.Item label="项目名称" span={2}>{currentOrder.projectName}</Descriptions.Item>
              <Descriptions.Item label="订单金额">¥{(currentOrder.totalAmount || 0).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="订单状态">
                <Tag color={statusMap[currentOrder.status]?.color}>{statusMap[currentOrder.status]?.text || currentOrder.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="支付状态">
                <Tag color={paymentMap[currentOrder.paymentStatus]?.color}>{paymentMap[currentOrder.paymentStatus]?.text || currentOrder.paymentStatus}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">{currentOrder.createdAt ? new Date(currentOrder.createdAt).toLocaleString() : '-'}</Descriptions.Item>
            </Descriptions>
            <Card title="订单进度" size="small">
              <Timeline
                items={[
                  { color: 'green', children: '订单创建 - ' + (currentOrder.createdAt ? new Date(currentOrder.createdAt).toLocaleString() : '-') },
                  { color: currentOrder.status !== 'pending' ? 'green' : 'gray', children: '商家确认' },
                  { color: ['designing', 'constructing', 'completed'].includes(currentOrder.status) ? 'green' : 'gray', children: '设计阶段' },
                  { color: ['constructing', 'completed'].includes(currentOrder.status) ? 'green' : 'gray', children: '施工阶段' },
                  { color: currentOrder.status === 'completed' ? 'green' : 'gray', children: '订单完成' },
                ]}
              />
            </Card>
          </>
        )}
      </Modal>
    </>
  );
};

export default Orders;
