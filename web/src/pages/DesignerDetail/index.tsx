import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Row, Col, Card, Avatar, Rate, Tag, Button, Tabs, Spin, Empty, Modal, DatePicker, TimePicker, Input, message } from 'antd'
import { UserOutlined, EnvironmentOutlined, PhoneOutlined, MessageOutlined } from '@ant-design/icons'
import { designerApi, caseApi, appointmentApi } from '@/services/api'
import dayjs from 'dayjs'
import styles from './index.module.css'

interface DesignerDetail {
  _id: string
  name: string
  avatar: string
  title: string
  experience: number
  rating: number
  caseCount: number
  styles: string[]
  location: string
  introduction: string
  phone: string
}

interface CaseItem {
  _id: string
  title: string
  coverImage: string
  style: string
}

const DesignerDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [designer, setDesigner] = useState<DesignerDetail | null>(null)
  const [cases, setCases] = useState<CaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false)
  const [appointmentForm, setAppointmentForm] = useState({
    date: '',
    time: '',
    remark: '',
  })

  useEffect(() => {
    if (id) {
      fetchDesignerDetail()
    }
  }, [id])

  const fetchDesignerDetail = async () => {
    try {
      const res: any = await designerApi.getDetail(id!)
      setDesigner(res.data)
      setCases(res.data?.cases || [])
    } catch (error) {
      console.error('Failed to fetch designer detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAppointment = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      message.warning('请先登录')
      return
    }

    if (!appointmentForm.date || !appointmentForm.time) {
      message.warning('请选择预约时间')
      return
    }

    try {
      await appointmentApi.create({
        merchantId: id!,
        date: appointmentForm.date,
        time: appointmentForm.time,
        remark: appointmentForm.remark,
      })
      message.success('预约成功，我们会尽快与您联系')
      setAppointmentModalVisible(false)
      setAppointmentForm({ date: '', time: '', remark: '' })
    } catch (error) {
      message.error('预约失败，请稍后重试')
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    )
  }

  if (!designer) {
    return <div className={styles.notFound}>设计师不存在</div>
  }

  const tabItems = [
    {
      key: 'cases',
      label: `设计作品 (${cases.length})`,
      children: (
        <div className={styles.casesGrid}>
          {cases.length > 0 ? (
            <Row gutter={[24, 24]}>
              {cases.map((item) => (
                <Col key={item._id} xs={24} sm={12} md={8}>
                  <Link to={`/cases/${item._id}`}>
                    <Card
                      hoverable
                      cover={
                        <div
                          className={styles.caseCover}
                          style={{ backgroundImage: `url(${item.coverImage})` }}
                        />
                      }
                    >
                      <Card.Meta title={item.title} description={<Tag>{item.style}</Tag>} />
                    </Card>
                  </Link>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="暂无作品" />
          )}
        </div>
      ),
    },
    {
      key: 'intro',
      label: '个人介绍',
      children: (
        <div className={styles.introduction}>
          <p>{designer.introduction || '暂无介绍'}</p>
        </div>
      ),
    },
  ]

  return (
    <div className={styles.designerDetail}>
      <div className={styles.container}>
        <Row gutter={[32, 32]}>
          {/* Left: Designer Info */}
          <Col xs={24} lg={8}>
            <Card className={styles.profileCard}>
              <div className={styles.profile}>
                <Avatar size={120} src={designer.avatar} icon={<UserOutlined />} />
                <h1>{designer.name}</h1>
                <p className={styles.title}>{designer.title}</p>
                <Rate disabled value={designer.rating} allowHalf />
                <div className={styles.stats}>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{designer.experience}</span>
                    <span className={styles.statLabel}>年经验</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{designer.caseCount}</span>
                    <span className={styles.statLabel}>个案例</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{designer.rating}</span>
                    <span className={styles.statLabel}>评分</span>
                  </div>
                </div>
              </div>

              {designer.styles && designer.styles.length > 0 && (
                <div className={styles.section}>
                  <h3>擅长风格</h3>
                  <div className={styles.tags}>
                    {designer.styles.map((style) => (
                      <Tag key={style} color="blue">{style}</Tag>
                    ))}
                  </div>
                </div>
              )}

              {designer.location && (
                <div className={styles.section}>
                  <h3>服务区域</h3>
                  <p><EnvironmentOutlined /> {designer.location}</p>
                </div>
              )}

              <div className={styles.actions}>
                <Button
                  type="primary"
                  icon={<PhoneOutlined />}
                  block
                  onClick={() => setAppointmentModalVisible(true)}
                >
                  预约咨询
                </Button>
                <Button icon={<MessageOutlined />} block>
                  在线沟通
                </Button>
              </div>
            </Card>
          </Col>

          {/* Right: Cases & Introduction */}
          <Col xs={24} lg={16}>
            <Card>
              <Tabs items={tabItems} />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Appointment Modal */}
      <Modal
        title="预约咨询"
        open={appointmentModalVisible}
        onOk={handleAppointment}
        onCancel={() => setAppointmentModalVisible(false)}
        okText="确认预约"
        cancelText="取消"
      >
        <div className={styles.appointmentForm}>
          <div className={styles.formItem}>
            <label>预约日期</label>
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
              onChange={(_, dateString) => setAppointmentForm((prev) => ({ ...prev, date: dateString as string }))}
            />
          </div>
          <div className={styles.formItem}>
            <label>预约时间</label>
            <TimePicker
              style={{ width: '100%' }}
              format="HH:mm"
              minuteStep={30}
              onChange={(_, timeString) => setAppointmentForm((prev) => ({ ...prev, time: timeString as string }))}
            />
          </div>
          <div className={styles.formItem}>
            <label>备注</label>
            <Input.TextArea
              rows={3}
              placeholder="请输入您的装修需求或问题"
              onChange={(e) => setAppointmentForm((prev) => ({ ...prev, remark: e.target.value }))}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default DesignerDetail
