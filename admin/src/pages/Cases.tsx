import { useState } from 'react';
import { Table, Card, Input, Select, Tag, Space, Button, Modal, message, Image } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const mockCases = [
  { id: '1', title: '现代简约·三居室', style: '现代简约', area: 120, price: 150000, merchant: '优家装饰', status: 'published', viewCount: 1286, createdAt: '2024-01-15' },
  { id: '2', title: '北欧风格·两居室', style: '北欧风格', area: 95, price: 98000, merchant: '美居设计', status: 'draft', viewCount: 0, createdAt: '2024-01-18' },
  { id: '3', title: '新中式·四居室', style: '新中式', area: 180, price: 280000, merchant: '匠心装饰', status: 'published', viewCount: 2156, createdAt: '2024-01-10' },
  { id: '4', title: '轻奢风格·复式', style: '轻奢风格', area: 220, price: 450000, merchant: '简约空间', status: 'archived', viewCount: 856, createdAt: '2024-01-05' },
];

const Cases: React.FC = () => {
  const [cases, setCases] = useState(mockCases);
  const [loading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '删除案例',
      content: `确定要删除「${record.title}」吗？此操作不可恢复。`,
      onOk: () => {
        setCases(cases.filter(c => c.id !== record.id));
        message.success('删除成功');
      },
    });
  };

  const handleUpdateStatus = (record: any, status: string) => {
    setCases(cases.map(c => c.id === record.id ? { ...c, status } : c));
    message.success('状态更新成功');
  };

  const filteredCases = cases.filter(c => {
    if (search && !c.title.includes(search) && !c.merchant.includes(search)) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    return true;
  });

  const statusMap: Record<string, { color: string; text: string }> = {
    draft: { color: 'default', text: '草稿' },
    published: { color: 'green', text: '已发布' },
    archived: { color: 'orange', text: '已归档' },
  };

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '风格', dataIndex: 'style', key: 'style' },
    { title: '面积', dataIndex: 'area', key: 'area', render: (v: number) => `${v}㎡` },
    { title: '价格', dataIndex: 'price', key: 'price', render: (v: number) => `¥${v.toLocaleString()}` },
    { title: '商家', dataIndex: 'merchant', key: 'merchant' },
    { title: '浏览量', dataIndex: 'viewCount', key: 'viewCount' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.text}</Tag> },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          {record.status === 'published' && <Button type="link" onClick={() => handleUpdateStatus(record, 'archived')}>下架</Button>}
          {record.status === 'archived' && <Button type="link" onClick={() => handleUpdateStatus(record, 'published')}>上架</Button>}
          <Button type="link" danger onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="案例管理"
      extra={
        <Space>
          <Input placeholder="搜索案例" prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} allowClear />
          <Select placeholder="状态筛选" allowClear style={{ width: 120 }} value={statusFilter} onChange={setStatusFilter}>
            <Select.Option value="draft">草稿</Select.Option>
            <Select.Option value="published">已发布</Select.Option>
            <Select.Option value="archived">已归档</Select.Option>
          </Select>
        </Space>
      }
    >
      <Table columns={columns} dataSource={filteredCases} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
    </Card>
  );
};

export default Cases;
