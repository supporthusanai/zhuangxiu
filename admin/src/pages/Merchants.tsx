import { useState, useEffect } from 'react';
import { Table, Card, Input, Select, Tag, Space, Button, Modal, message, Descriptions } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { getMerchants, approveMerchant } from '../services/api';

interface Merchant {
  _id: string;
  companyName: string;
  contactPerson: string;
  contactPhone: string;
  address: string;
  description: string;
  status: string;
  createdAt: string;
  user?: { nickname: string; phone: string };
}

const Merchants: React.FC = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentMerchant, setCurrentMerchant] = useState<Merchant | null>(null);

  const fetchMerchants = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const res: any = await getMerchants(params);
      if (res.success) {
        setMerchants(res.data?.merchants || []);
        setPagination({
          current: res.data?.pagination?.page || page,
          pageSize: res.data?.pagination?.limit || limit,
          total: res.data?.pagination?.total || 0,
        });
      }
    } catch (error) {
      console.error('获取商家列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, [statusFilter]);

  const handleSearch = () => {
    fetchMerchants(1, pagination.pageSize);
  };

  const handleTableChange = (pag: any) => {
    fetchMerchants(pag.current, pag.pageSize);
  };

  const handleApprove = (record: Merchant, approved: boolean) => {
    Modal.confirm({
      title: approved ? '审核通过' : '审核拒绝',
      content: approved
        ? `确定通过「${record.companyName}」的入驻申请吗？`
        : `确定拒绝「${record.companyName}」的入驻申请吗？`,
      onOk: async () => {
        try {
          const res: any = await approveMerchant(record._id, {
            status: approved ? 'approved' : 'rejected',
          });
          if (res.success) {
            message.success('操作成功');
            fetchMerchants(pagination.current, pagination.pageSize);
          }
        } catch (error) {
          message.error('操作失败');
        }
      },
    });
  };

  const statusMap: Record<string, { color: string; text: string }> = {
    pending: { color: 'gold', text: '待审核' },
    approved: { color: 'green', text: '已通过' },
    rejected: { color: 'red', text: '已拒绝' },
  };

  const columns = [
    { title: '公司名称', dataIndex: 'companyName', key: 'companyName' },
    { title: '联系人', dataIndex: 'contactPerson', key: 'contactPerson' },
    { title: '联系电话', dataIndex: 'contactPhone', key: 'contactPhone' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.text || v}</Tag>,
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => v ? new Date(v).toLocaleDateString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Merchant) => (
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
            <Input
              placeholder="搜索商家"
              prefix={<SearchOutlined />}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
            <Button type="primary" onClick={handleSearch}>搜索</Button>
            <Select placeholder="状态筛选" allowClear style={{ width: 120 }} value={statusFilter} onChange={setStatusFilter}>
              <Select.Option value="pending">待审核</Select.Option>
              <Select.Option value="approved">已通过</Select.Option>
              <Select.Option value="rejected">已拒绝</Select.Option>
            </Select>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={merchants}
          rowKey="_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      <Modal title="商家详情" open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={600}>
        {currentMerchant && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="公司名称" span={2}>{currentMerchant.companyName}</Descriptions.Item>
            <Descriptions.Item label="联系人">{currentMerchant.contactPerson}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{currentMerchant.contactPhone}</Descriptions.Item>
            <Descriptions.Item label="地址" span={2}>{currentMerchant.address || '-'}</Descriptions.Item>
            <Descriptions.Item label="简介" span={2}>{currentMerchant.description || '-'}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusMap[currentMerchant.status]?.color}>{statusMap[currentMerchant.status]?.text}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="申请时间">
              {currentMerchant.createdAt ? new Date(currentMerchant.createdAt).toLocaleString() : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

export default Merchants;
