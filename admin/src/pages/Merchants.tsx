import { useState } from 'react';
import { Table, Card, Input, Select, Tag, Space, Button, Modal, message, Descriptions, Image } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const mockMerchants = [
  { id: '1', companyName: '优家装饰', contactPerson: '张总', contactPhone: '138****1234', status: 'approved', caseCount: 25, createdAt: '2024-01-10' },
  { id: '2', companyName: '美居设计', contactPerson: '李总', contactPhone: '139****5678', status: 'pending', caseCount: 0, createdAt: '2024-01-18' },
  { id: '3', companyName: '匠心装饰', contactPerson: '王总', contactPhone: '136****9012', status: 'approved', caseCount: 42, createdAt: '2024-01-05' },
  { id: '4', companyName: '简约空间', contactPerson: '赵总', contactPhone: '137****3456', status: 'rejected', caseCount: 0, createdAt: '2024-01-15' },
];

const Merchants: React.FC = () => {
  const [merchants, setMerchants] = useState(mockMerchants);
  const [loading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentMerchant, setCurrentMerchant] = useState<any>(null);

  const handleApprove = (record: any, approved: boolean) => {
    Modal.confirm({
      title: approved ? '审核通过' : '审核拒绝',
      content: approved ? `确定通过「${record.companyName}」的入驻申请吗？` : `确定拒绝「${record.companyName}」的入驻申请吗？`,
      onOk: () => {
        setMerchants(merchants.map(m => m.id === record.id ? { ...m, status: approved ? 'approved' : 'rejected' } : m));
        message.success('操作成功');
      },
    });
  };

  const filteredMerchants = merchants.filter(m => {
    if (search && !m.companyName.includes(search)) return false;
    if (statusFilter && m.status !== statusFilter) return false;
    return true;
  });

  const statusMap: Record<string, { color: string; text: string }> = {
    pending: { color: 'gold', text: '待审核' },
    approved: { color: 'green', text: '已通过' },
    rejected: { color: 'red', text: '已拒绝' },
  };

  const columns = [
    { title: '公司名称', dataIndex: 'companyName', key: 'companyName' },
    { title: '联系人', dataIndex: 'contactPerson', key: 'contactPerson' },
    { title: '联系电话', dataIndex: 'contactPhone', key: 'contactPhone' },
    { title: '案例数', dataIndex: 'caseCount', key: 'caseCount' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.text}</Tag> },
    { title: '申请时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" onClick={() => { setCurrentMerchant(record); setDetailVisible(true); }}>详情</Button>
          {record.status === 'pending' && (
            <>
              <Button type="link" onClick={() => handleApprove(record, true)}>通过</Button>
              <Button type="link" danger onClick={() => handleApprove(record, false)}>拒绝</Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="商家管理"
        extra={
          <Space>
            <Input placeholder="搜索商家" prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} allowClear />
            <Select placeholder="状态筛选" allowClear style={{ width: 120 }} value={statusFilter} onChange={setStatusFilter}>
              <Select.Option value="pending">待审核</Select.Option>
              <Select.Option value="approved">已通过</Select.Option>
              <Select.Option value="rejected">已拒绝</Select.Option>
            </Select>
          </Space>
        }
      >
        <Table columns={columns} dataSource={filteredMerchants} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title="商家详情" open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={600}>
        {currentMerchant && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="公司名称" span={2}>{currentMerchant.companyName}</Descriptions.Item>
            <Descriptions.Item label="联系人">{currentMerchant.contactPerson}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{currentMerchant.contactPhone}</Descriptions.Item>
            <Descriptions.Item label="案例数">{currentMerchant.caseCount}</Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={statusMap[currentMerchant.status]?.color}>{statusMap[currentMerchant.status]?.text}</Tag></Descriptions.Item>
            <Descriptions.Item label="申请时间" span={2}>{currentMerchant.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

export default Merchants;
