import { useState, useEffect } from 'react';
import { Table, Card, Input, Select, Tag, Avatar, Space, Button, Modal, message } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { getUsers, updateUser } from '../services/api';

interface User {
  _id: string;
  nickname: string;
  avatar: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchUsers = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;

      const res: any = await getUsers(params);
      if (res.success) {
        setUsers(res.data?.users || []);
        setPagination({
          current: res.data?.pagination?.page || page,
          pageSize: res.data?.pagination?.limit || limit,
          total: res.data?.pagination?.total || 0,
        });
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = () => {
    fetchUsers(1, pagination.pageSize);
  };

  const handleToggleStatus = (record: User) => {
    Modal.confirm({
      title: record.isActive ? '禁用用户' : '启用用户',
      content: `确定要${record.isActive ? '禁用' : '启用'}用户「${record.nickname}」吗？`,
      onOk: async () => {
        try {
          const res: any = await updateUser(record._id, { isActive: !record.isActive });
          if (res.success) {
            message.success('操作成功');
            fetchUsers(pagination.current, pagination.pageSize);
          }
        } catch (error) {
          message.error('操作失败');
        }
      },
    });
  };

  const handleTableChange = (pag: any) => {
    fetchUsers(pag.current, pag.pageSize);
  };

  const columns = [
    {
      title: '用户',
      key: 'user',
      render: (_: any, record: User) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.avatar} />
          <span>{record.nickname || '未设置昵称'}</span>
        </Space>
      ),
    },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (v: string) => {
        const map: Record<string, { color: string; text: string }> = {
          user: { color: 'blue', text: '普通用户' },
          merchant: { color: 'purple', text: '商家' },
          admin: { color: 'red', text: '管理员' },
        };
        return <Tag color={map[v]?.color}>{map[v]?.text || v}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v: boolean) => <Tag color={v !== false ? 'green' : 'red'}>{v !== false ? '正常' : '已禁用'}</Tag>,
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => v ? new Date(v).toLocaleDateString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Button type="link" danger={record.isActive !== false} onClick={() => handleToggleStatus(record)}>
          {record.isActive !== false ? '禁用' : '启用'}
        </Button>
      ),
    },
  ];

  return (
    <Card
      title="用户管理"
      extra={
        <Space>
          <Input
            placeholder="搜索用户"
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
          />
          <Button type="primary" onClick={handleSearch}>搜索</Button>
          <Select placeholder="角色筛选" allowClear style={{ width: 120 }} value={roleFilter} onChange={setRoleFilter}>
            <Select.Option value="user">普通用户</Select.Option>
            <Select.Option value="merchant">商家</Select.Option>
            <Select.Option value="admin">管理员</Select.Option>
          </Select>
        </Space>
      }
    >
      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />
    </Card>
  );
};

export default Users;
