import { useState, useEffect } from 'react';
import { Table, Card, Rate, Input, Button, Space, Popconfirm, message, Avatar } from 'antd';
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { getReviews, deleteReview } from '../services/api';

const Reviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState('');

  const fetchReviews = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (search) params.search = search;
      const res: any = await getReviews(params);
      if (res.success) {
        setReviews(res.data?.reviews || []);
        setPagination({
          current: res.data?.pagination?.page || 1,
          pageSize: res.data?.pagination?.limit || 10,
          total: res.data?.pagination?.total || 0,
        });
      }
    } catch (error) {
      console.error('获取评价列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res: any = await deleteReview(id);
      if (res.success) {
        message.success('删除成功');
        fetchReviews(pagination.current, pagination.pageSize);
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const columns = [
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      render: (user: any) => (
        <Space>
          <Avatar src={user?.avatar} size="small" />
          <span>{user?.nickname || '-'}</span>
        </Space>
      ),
    },
    {
      title: '商家',
      dataIndex: 'merchant',
      key: 'merchant',
      render: (merchant: any) => merchant?.companyName || '-',
    },
    {
      title: '订单号',
      dataIndex: 'order',
      key: 'order',
      render: (order: any) => order?.orderNo || '-',
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => <Rate disabled defaultValue={rating} />,
    },
    {
      title: '评价内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: 200,
    },
    {
      title: '评价时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Popconfirm
          title="确定要删除这条评价吗？"
          onConfirm={() => handleDelete(record._id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card title="评价管理">
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索评价内容"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={() => fetchReviews(1, pagination.pageSize)}
          style={{ width: 250 }}
        />
        <Button type="primary" onClick={() => fetchReviews(1, pagination.pageSize)}>
          搜索
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={reviews}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => fetchReviews(page, pageSize),
        }}
      />
    </Card>
  );
};

export default Reviews;
