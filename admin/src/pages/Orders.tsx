import { useState } from 'react';
import { Table, Card, Input, Select, Tag, Space, Button, Modal, Descriptions, Timeline } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const mockOrders = [
  { id: '1', orderNo: 'ZX20240121ABC', user: '张三', merchant: '优家装饰', projectName: '阳光小区3栋', amount: 150000, status: 'pending', paymentStatus: 'unpaid', createdAt: '2024-01-21 14:30' },
  { id: '2', orderNo: 'ZX20240121DEF', user: '李四', merchant: '美居设计', projectName: '花园洋房B座', amount: 280000, status: 'confirmed', paymentStatus: 'partial', createdAt: '2024-01-21 10:15' },
  { id: '3', orderNo: 'ZX20240120GHI', user: '王五', merchant: '匠心装饰', projectName: '城市公寓12层', amount: 95000, status: 'designing', paymentStatus: 'partial', createdAt: '2024-01-20 16:45' },
  { id: '4', orderNo: 'ZX20240118JKL', user: '赵六', merchant: '简约空间', projectName: '翡翠城5期', amount: 450000, status: 'constructing', paymentStatus: 'partial', createdAt: '2024-01-18 09:20' },
  { id: '5', orderNo: 'ZX20240115MNO', user: '钱七', merchant: '优家装饰', projectName: '明珠花园A栋', amount: 180000, status: 'completed', paymentStatus: 'paid', createdAt: '2024-01-15 11:30' },
];

const Orders: React.FC = () => {
  const [orders] = useState(mockOrders);
  const [loading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  const filteredOrders = orders.filter(o => {
    if (search && !o.orderNo.includes(search) && !o.user.includes(search) && !o.projectName.includes(search)) return false;
    if (statusFilter && o.status !== statusFilter) return false;
    return true;
  });

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
    { title: '用户', dataIndex: 'user', key: 'user' },
    { title: '商家', dataIndex: 'merchant', key: 'merchant' },
    { title: '项目', dataIndex: 'projectName', key: 'projectName' },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '订单状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.text}</Tag> },
    { title: '支付状态', dataIndex: 'paymentStatus', key: 'paymentStatus', render: (v: string) => <Tag color={paymentMap[v]?.color}>{paymentMap[v]?.text}</Tag> },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => { setCurrentOrder(record); setDetailVisible(true); }}>详情</Button>
      ),
    },
  ];

  return (
    <>
      <Card
        title="订单管理"
        extra={
          <Space>
            <Input placeholder="搜索订单" prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} allowClear />
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
        <Table columns={columns} dataSource={filteredOrders} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title="订单详情" open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={700}>
        {currentOrder && (
          <>
            <Descriptions column={2} bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="订单号" span={2}>{currentOrder.orderNo}</Descriptions.Item>
              <Descriptions.Item label="用户">{currentOrder.user}</Descriptions.Item>
              <Descriptions.Item label="商家">{currentOrder.merchant}</Descriptions.Item>
              <Descriptions.Item label="项目名称" span={2}>{currentOrder.projectName}</Descriptions.Item>
              <Descriptions.Item label="订单金额">¥{currentOrder.amount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="订单状态"><Tag color={statusMap[currentOrder.status]?.color}>{statusMap[currentOrder.status]?.text}</Tag></Descriptions.Item>
              <Descriptions.Item label="支付状态"><Tag color={paymentMap[currentOrder.paymentStatus]?.color}>{paymentMap[currentOrder.paymentStatus]?.text}</Tag></Descriptions.Item>
              <Descriptions.Item label="创建时间">{currentOrder.createdAt}</Descriptions.Item>
            </Descriptions>
            <Card title="订单进度" size="small">
              <Timeline
                items={[
                  { color: 'green', children: '订单创建 - ' + currentOrder.createdAt },
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
