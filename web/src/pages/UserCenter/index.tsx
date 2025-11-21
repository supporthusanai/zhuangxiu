import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, Row, Col, Avatar, Tabs, List, Tag, Empty, Button, message } from 'antd'
import { UserOutlined, HeartOutlined, CalendarOutlined, SettingOutlined } from '@ant-design/icons'
import { authApi, favoriteApi, appointmentApi } from '@/services/api'
import dayjs from 'dayjs'
import styles from './index.module.css'

interface UserInfo {
  _id: string
  nickname: string
  avatar: string
  phone: string
}

interface FavoriteItem {
  _id: string
  type: string
  target: {
    _id: string
    title?: string
    name?: string
    coverImage?: string
    avatar?: string
  }
}

interface AppointmentItem {
  _id: string
  merchant: {
    _id: string
    name: string
  }
  date: string
  time: string
  status: string
  createdAt: string
}

const UserCenter = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserInfo | null>(null)
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [appointments, setAppointments] = useState<AppointmentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const [profileRes, favoritesRes, appointmentsRes] = await Promise.all([
        authApi.getProfile(),
        favoriteApi.getList('all'),
        appointmentApi.getList(),
      ])
      setUser((profileRes as any).data)
      setFavorites((favoritesRes as any).data || [])
      setAppointments((appointmentsRes as any).data || [])
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    message.success('已退出登录')
    navigate('/')
  }

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: '待确认' },
      confirmed: { color: 'blue', text: '已确认' },
      completed: { color: 'green', text: '已完成' },
      cancelled: { color: 'default', text: '已取消' },
    }
    const { color, text } = statusMap[status] || { color: 'default', text: status }
    return <Tag color={color}>{text}</Tag>
  }

  const tabItems = [
    {
      key: 'favorites',
      label: (
        <span>
          <HeartOutlined />
          我的收藏
        </span>
      ),
      children: (
        <div className={styles.tabContent}>
          {favorites.length > 0 ? (
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
              dataSource={favorites}
              renderItem={(item) => (
                <List.Item>
                  <Link
                    to={item.type === 'case' ? `/cases/${item.target._id}` : `/designers/${item.target._id}`}
                  >
                    <Card
                      hoverable
                      cover={
                        item.target.coverImage ? (
                          <div
                            className={styles.cardCover}
                            style={{ backgroundImage: `url(${item.target.coverImage})` }}
                          />
                        ) : null
                      }
                    >
                      <Card.Meta
                        avatar={item.target.avatar ? <Avatar src={item.target.avatar} /> : null}
                        title={item.target.title || item.target.name}
                        description={<Tag>{item.type === 'case' ? '案例' : '设计师'}</Tag>}
                      />
                    </Card>
                  </Link>
                </List.Item>
              )}
            />
          ) : (
            <Empty description="暂无收藏" />
          )}
        </div>
      ),
    },
    {
      key: 'appointments',
      label: (
        <span>
          <CalendarOutlined />
          我的预约
        </span>
      ),
      children: (
        <div className={styles.tabContent}>
          {appointments.length > 0 ? (
            <List
              dataSource={appointments}
              renderItem={(item) => (
                <List.Item>
                  <Card style={{ width: '100%' }}>
                    <Row justify="space-between" align="middle">
                      <Col>
                        <h4>{item.merchant?.name || '设计师'}</h4>
                        <p className={styles.appointmentTime}>
                          预约时间：{item.date} {item.time}
                        </p>
                        <p className={styles.appointmentCreated}>
                          创建时间：{dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
                        </p>
                      </Col>
                      <Col>
                        {getStatusTag(item.status)}
                      </Col>
                    </Row>
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <Empty description="暂无预约" />
          )}
        </div>
      ),
    },
    {
      key: 'settings',
      label: (
        <span>
          <SettingOutlined />
          账号设置
        </span>
      ),
      children: (
        <div className={styles.tabContent}>
          <Card>
            <div className={styles.settingItem}>
              <span>手机号</span>
              <span>{user?.phone}</span>
            </div>
            <div className={styles.settingItem}>
              <span>昵称</span>
              <span>{user?.nickname}</span>
            </div>
            <div className={styles.settingActions}>
              <Button danger onClick={handleLogout}>
                退出登录
              </Button>
            </div>
          </Card>
        </div>
      ),
    },
  ]

  return (
    <div className={styles.userCenter}>
      <div className={styles.container}>
        <Row gutter={[32, 32]}>
          {/* Left: User Profile */}
          <Col xs={24} md={8}>
            <Card className={styles.profileCard}>
              <div className={styles.profile}>
                <Avatar size={100} src={user?.avatar} icon={<UserOutlined />} />
                <h2>{user?.nickname || '用户'}</h2>
                <p>{user?.phone}</p>
              </div>
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{favorites.length}</span>
                  <span className={styles.statLabel}>收藏</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{appointments.length}</span>
                  <span className={styles.statLabel}>预约</span>
                </div>
              </div>
            </Card>
          </Col>

          {/* Right: Tabs */}
          <Col xs={24} md={16}>
            <Card>
              <Tabs items={tabItems} />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default UserCenter
