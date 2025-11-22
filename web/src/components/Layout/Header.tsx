import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, Button, Dropdown, Avatar, Input } from 'antd'
import { UserOutlined, SearchOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import styles from './Header.module.css'

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<{ nickname: string; avatar?: string } | null>(null)
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userInfo = localStorage.getItem('userInfo')
    if (token && userInfo) {
      setUser(JSON.parse(userInfo))
    }
  }, [])

  const menuItems: MenuProps['items'] = [
    { key: '/', label: <Link to="/">首页</Link> },
    { key: '/cases', label: <Link to="/cases">装修案例</Link> },
    { key: '/designers', label: <Link to="/designers">找设计师</Link> },
  ]

  const userMenuItems: MenuProps['items'] = [
    { key: 'center', icon: <UserOutlined />, label: '个人中心', onClick: () => navigate('/user') },
    { key: 'settings', icon: <SettingOutlined />, label: '账号设置' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
  ]

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    setUser(null)
    navigate('/')
  }

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/cases?search=${encodeURIComponent(searchValue)}`)
    }
  }

  const currentKey = '/' + location.pathname.split('/')[1]

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoText}>装修平台</span>
        </Link>

        <Menu
          mode="horizontal"
          selectedKeys={[currentKey]}
          items={menuItems}
          className={styles.menu}
        />

        <div className={styles.search}>
          <Input
            placeholder="搜索案例、设计师..."
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 240 }}
          />
        </div>

        <div className={styles.actions}>
          {user ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className={styles.userInfo}>
                <Avatar src={user.avatar} icon={<UserOutlined />} />
                <span className={styles.nickname}>{user.nickname}</span>
              </div>
            </Dropdown>
          ) : (
            <>
              <Button type="link" onClick={() => navigate('/login')}>登录</Button>
              <Button type="primary" onClick={() => navigate('/register')}>注册</Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
