import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Row, Col, Rate, Pagination, Empty, Spin, Avatar, Tag } from 'antd'
import { UserOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { designerApi } from '@/services/api'
import styles from './index.module.css'

interface Designer {
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
}

const styleOptions = ['全部', '现代简约', '北欧风格', '中式风格', '轻奢风格', '日式风格', '美式风格']

const Designers = () => {
  const [designers, setDesigners] = useState<Designer[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [selectedStyle, setSelectedStyle] = useState('全部')
  const pageSize = 8

  useEffect(() => {
    fetchDesigners()
  }, [page, selectedStyle])

  const fetchDesigners = async () => {
    setLoading(true)
    try {
      const params: any = { page, pageSize }
      if (selectedStyle !== '全部') params.style = selectedStyle

      const res: any = await designerApi.getList(params)
      setDesigners(res.data?.list || [])
      setTotal(res.data?.total || 0)
    } catch (error) {
      console.error('Failed to fetch designers:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.designers}>
      <div className={styles.container}>
        {/* Page Header */}
        <div className={styles.header}>
          <h1>找设计师</h1>
          <p>优选专业设计师，为您打造理想家居</p>
        </div>

        {/* Style Filter */}
        <div className={styles.filters}>
          <span className={styles.filterLabel}>擅长风格：</span>
          <div className={styles.filterOptions}>
            {styleOptions.map((option) => (
              <span
                key={option}
                className={`${styles.filterOption} ${selectedStyle === option ? styles.active : ''}`}
                onClick={() => {
                  setSelectedStyle(option)
                  setPage(1)
                }}
              >
                {option}
              </span>
            ))}
          </div>
        </div>

        {/* Designer List */}
        <Spin spinning={loading}>
          {designers.length > 0 ? (
            <>
              <Row gutter={[24, 24]}>
                {designers.map((designer) => (
                  <Col key={designer._id} xs={24} sm={12} lg={6}>
                    <Link to={`/designers/${designer._id}`}>
                      <Card hoverable className={styles.designerCard}>
                        <div className={styles.cardHeader}>
                          <Avatar
                            size={80}
                            src={designer.avatar}
                            icon={<UserOutlined />}
                          />
                          <h3>{designer.name}</h3>
                          <p className={styles.title}>{designer.title}</p>
                          <Rate
                            disabled
                            defaultValue={designer.rating}
                            allowHalf
                            style={{ fontSize: 14 }}
                          />
                        </div>
                        <div className={styles.cardBody}>
                          <div className={styles.stats}>
                            <span>{designer.experience}年经验</span>
                            <span>{designer.caseCount}个案例</span>
                          </div>
                          {designer.styles && designer.styles.length > 0 && (
                            <div className={styles.styles}>
                              {designer.styles.slice(0, 3).map((style) => (
                                <Tag key={style}>{style}</Tag>
                              ))}
                            </div>
                          )}
                          {designer.location && (
                            <div className={styles.location}>
                              <EnvironmentOutlined /> {designer.location}
                            </div>
                          )}
                        </div>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
              <div className={styles.pagination}>
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  onChange={setPage}
                  showSizeChanger={false}
                />
              </div>
            </>
          ) : (
            !loading && <Empty description="暂无设计师" />
          )}
        </Spin>
      </div>
    </div>
  )
}

export default Designers
