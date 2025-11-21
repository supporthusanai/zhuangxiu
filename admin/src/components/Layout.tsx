import { Layout as AntLayout, Menu, Avatar, Dropdown, theme } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ShopOutlined,
  FileImageOutlined,
  OrderedListOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const menuItems: MenuProps['items'] = [
    { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
    { key: '/users', icon: <UserOutlined />, label: '用户管理' },
    { key: '/merchants', icon: <ShopOutlined />, label: '商家管理' },
    { key: '/cases', icon: <FileImageOutlined />, label: '案例管理' },
    { key: '/orders', icon: <OrderedListOutlined />, label: '订单管理' },
  ];

  const userMenuItems: MenuProps['items'] = [
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: onLogout },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={200}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: token.colorPrimary }}>装修管理后台</span>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <AntLayout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} src={user?.avatar} />
              <span>{user?.nickname || '管理员'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8, minHeight: 280 }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
