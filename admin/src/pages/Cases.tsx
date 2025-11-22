import { useState, useEffect } from 'react';
import { Table, Card, Input, Select, Tag, Space, Button, Modal, message, Image } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getCases, updateCaseStatus, deleteCase } from '../services/api';

interface CaseItem {
  _id: string;
  title: string;
  style: string;
  area: number;
  budget: number;
  images: string[];
  merchant?: { companyName: string };
  status: string;
  viewCount: number;
  createdAt: string;
}

const Cases: React.FC = () => {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchCases = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (search) params.keyword = search;

      const res: any = await getCases(params);
      if (res.success) {
        setCases(res.data?.cases || []);
        setPagination({
          current: res.data?.pagination?.page || page,
          pageSize: res.data?.pagination?.limit || limit,
          total: res.data?.pagination?.total || 0,
        });
      }
    } catch (error) {
      console.error('获取案例列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [statusFilter]);

  const handleSearch = () => {
    fetchCases(1, pagination.pageSize);
  };

  const handleDelete = (record: CaseItem) => {
    Modal.confirm({
      title: '删除案例',
      content: `确定要删除「${record.title}」吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          const res: any = await deleteCase(record._id);
          if (res.success) {
            message.success('删除成功');
            fetchCases(pagination.current, pagination.pageSize);
          }
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleUpdateStatus = async (record: CaseItem, status: string) => {
    try {
      const res: any = await updateCaseStatus(record._id, status);
      if (res.success) {
        message.success('状态更新成功');
        fetchCases(pagination.current, pagination.pageSize);
      }
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const handleTableChange = (pag: any) => {
    fetchCases(pag.current, pag.pageSize);
  };

  const statusMap: Record<string, { color: string; text: string }> = {
    draft: { color: 'default', text: '草稿' },
    published: { color: 'green', text: '已发布' },
    archived: { color: 'orange', text: '已归档' },
  };

  const columns = [
    {
      title: '封面',
      key: 'cover',
      width: 80,
      render: (_: any, record: CaseItem) => (
        <Image src={record.images?.[0]} width={60} height={40} style={{ objectFit: 'cover' }} />
      ),
    },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '风格', dataIndex: 'style', key: 'style' },
    { title: '面积', dataIndex: 'area', key: 'area', render: (v: number) => v ? `${v}㎡` : '-' },
    { title: '预算', dataIndex: 'budget', key: 'budget', render: (v: number) => v ? `¥${v}万` : '-' },
    { title: '商家', key: 'merchant', render: (_: any, r: CaseItem) => r.merchant?.companyName || '-' },
    { title: '浏览量', dataIndex: 'viewCount', key: 'viewCount' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.text || v}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => v ? new Date(v).toLocaleDateString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: CaseItem) => (
        <Space>
          {record.status === 'published' && (
            <Button type="link" onClick={() => handleUpdateStatus(record, 'archived')}>下架</Button>
          )}
          {record.status === 'archived' && (
            <Button type="link" onClick={() => handleUpdateStatus(record, 'published')}>上架</Button>
          )}
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
          <Input
            placeholder="搜索案例"
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
          />
          <Button type="primary" onClick={handleSearch}>搜索</Button>
          <Select placeholder="状态筛选" allowClear style={{ width: 120 }} value={statusFilter} onChange={setStatusFilter}>
            <Select.Option value="draft">草稿</Select.Option>
            <Select.Option value="published">已发布</Select.Option>
            <Select.Option value="archived">已归档</Select.Option>
          </Select>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={cases}
        rowKey="_id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />
    </Card>
  );
};

export default Cases;
