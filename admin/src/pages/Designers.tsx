import { useState, useEffect } from 'react';
import { Table, Card, Input, Button, Space, Popconfirm, message, Avatar, Tag } from 'antd';
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { getDesigners, deleteDesigner } from '../services/api';

const Designers = () => {
  const [designers, setDesigners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState('');

  const fetchDesigners = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (search) params.search = search;
      const res: any = await getDesigners(params);
      if (res.success) {
        setDesigners(res.data?.designers || []);
        setPagination({
          current: res.data?.pagination?.page || 1,
          pageSize: res.data?.pagination?.limit || 10,
          total: res.data?.pagination?.total || 0,
        });
      }
    } catch (error) {
      console.error('获取设计师列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigners();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res: any = await deleteDesigner(id);
      if (res.success) {
        message.success('删除成功');
        fetchDesigners(pagination.current, pagination.pageSize);
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const columns = [
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (avatar: string) => <Avatar src={avatar} size={48} />,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '职位',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '所属商家',
      dataIndex: 'merchant',
      key: 'merchant',
      render: (merchant: any) => merchant?.companyName || '-',
    },
    {
      title: '经验年限',
      dataIndex: 'experience',
      key: 'experience',
      render: (exp: number) => exp ? `${exp}年` : '-',
    },
    {
      title: '擅长风格',
      dataIndex: 'styles',
      key: 'styles',
      render: (styles: string[]) => (
        <Space wrap>
          {styles?.map((style: string) => (
            <Tag key={style}>{style}</Tag>
          )) || '-'}
        </Space>
      ),
    },
    {
      title: '作品数',
      dataIndex: 'caseCount',
      key: 'caseCount',
      render: (count: number) => count || 0,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Popconfirm
          title="确定要删除这个设计师吗？"
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
    <Card title="设计师管理">
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索设计师姓名/职位"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onPressEnter={() => fetchDesigners(1, pagination.pageSize)}
          style={{ width: 250 }}
        />
        <Button type="primary" onClick={() => fetchDesigners(1, pagination.pageSize)}>
          搜索
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={designers}
        rowKey="_id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => fetchDesigners(page, pageSize),
        }}
      />
    </Card>
  );
};

export default Designers;
