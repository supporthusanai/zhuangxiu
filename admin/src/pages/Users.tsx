import { useState } from 'react';
import { Table, Card, Input, Select, Tag, Avatar, Space, Button, Modal, message } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';

const mockUsers = [
  { id: '1', nickname: '张三', avatar: '', phone: '138****1234', role: 'user', isActive: true, createdAt: '2024-01-15' },
  { id: '2', nickname: '李四', avatar: '', phone: '139****5678', role: 'merchant', isActive: true, createdAt: '2024-01-14' },
  { id: '3', nickname: '王五', avatar: '', phone: '136****9012', role: 'user', isActive: false, createdAt: '2024-01-13' },
  { id: '4', nickname: '赵六', avatar: '', phone: '137****3456', role: 'admin', isActive: true, createdAt: '2024-01-10' },
];

const Users: React.FC = () => {
  const [users, setUsers] = useState(mockUsers);
  const [loading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>();

  const handleToggleStatus = (record: any) => {
    Modal.confirm({
      title: record.isActive ? '禁用用户' : '启用用户',
      content: `确定要${record.isActive ? '禁用' : '启用'}用户「${record.nickname}」吗？`,
      onOk: () => {
        setUsers(users.map(u => u.id === record.id ? { ...u, isActive: !u.isActive } : u));
        message.success('操作成功');
      },
    });
  };

  const filteredUsers = users.filter(u => {
    if (search && !u.nickname.includes(search) && !u.phone.includes(search)) return false;
    if (roleFilter && u.role !== roleFilter) return false;
    return true;
  });

  const columns = [
    {
      title: '用户',
      key: 'user',
      render: (_: any, record: any) => (
        <Space>
          <Avatar icon={<UserOutlined />} src={record.avatar} />
          <span>{record.nickname}</span>
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
        return <Tag color={map[v]?.color}>{map[v]?.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? '正常' : '已禁用'}</Tag>,
    },
    { title: '注册时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button type="link" danger={record.isActive} onClick={() => handleToggleStatus(record)}>
          {record.isActive ? '禁用' : '启用'}
        </Button>
      ),
    },
  ];

  return (
    <Card
      title="用户管理"
      extra={
        <Space>
          <Input placeholder="搜索用户" prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} allowClear />
          <Select placeholder="角色筛选" allowClear style={{ width: 120 }} value={roleFilter} onChange={setRoleFilter}>
            <Select.Option value="user">普通用户</Select.Option>
            <Select.Option value="merchant">商家</Select.Option>
            <Select.Option value="admin">管理员</Select.Option>
          </Select>
        </Space>
      }
    >
      <Table columns={columns} dataSource={filteredUsers} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
    </Card>
  );
};

export default Users;
