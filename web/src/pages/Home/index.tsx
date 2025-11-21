import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, Row, Col, Button, Carousel, Tag, Rate } from 'antd'
import { RightOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { caseApi, designerApi } from '@/services/api'
import styles from './index.module.css'

interface CaseItem {
  _id: string
  title: string
  coverImage: string
  style: string
  area: number
  budget: string
}

interface DesignerItem {
  _id: string
  name: string
  avatar: string
  title: string
  experience: number
  rating: number
  caseCount: number
}

const Home = () => {
  const [cases, setCases] = useState<CaseItem[]>([])
  const [designers, setDesigners] = useState<DesignerItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [casesRes, designersRes] = await Promise.all([
          caseApi.getRecommend(8),
          designerApi.getRecommend(4),
        ])
        setCases((casesRes as any).data || [])
        setDesigners((designersRes as any).data || [])
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const banners = [
    { id: 1, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=400&fit=crop', title: '精选装修案例' },
    { id: 2, image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=400&fit=crop', title: '专业设计师团队' },
    { id: 3, image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=400&fit=crop', title: '一站式装修服务' },
  ]

  const styleCategories = ['现代简约', '北欧风格', '中式风格', '轻奢风格', '日式风格', '美式风格']

  return (
    <div className={styles.home}>
      {/* Banner */}
      <section className={styles.banner}>
        <Carousel autoplay>
          {banners.map((banner) => (
            <div key={banner.id}>
              <div
                className={styles.bannerItem}
                style={{ backgroundImage: `url(${banner.image})` }}
              >
                <div className={styles.bannerOverlay}>
                  <h2>{banner.title}</h2>
                  <p>专业装修平台，让装修更简单</p>
                  <Button type="primary" size="large">
                    立即咨询
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </section>

      {/* Style Categories */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.categories}>
            {styleCategories.map((style) => (
              <Link key={style} to={`/cases?style=${style}`} className={styles.categoryItem}>
                <span>{style}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hot Cases */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>热门案例</h2>
            <Link to="/cases" className={styles.more}>
              查看更多 <RightOutlined />
            </Link>
          </div>
          <Row gutter={[24, 24]}>
            {cases.map((item) => (
              <Col key={item._id} xs={24} sm={12} md={8} lg={6}>
                <Link to={`/cases/${item._id}`}>
                  <Card
                    hoverable
                    cover={
                      <div
                        className={styles.cardCover}
                        style={{ backgroundImage: `url(${item.coverImage})` }}
                      />
                    }
                    className={styles.caseCard}
                  >
                    <Card.Meta
                      title={item.title}
                      description={
                        <div className={styles.caseMeta}>
                          <Tag color="blue">{item.style}</Tag>
                          <span>{item.area}m² | {item.budget}</span>
                        </div>
                      }
                    />
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Recommended Designers */}
      <section className={styles.section} style={{ background: '#f9f9f9' }}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>推荐设计师</h2>
            <Link to="/designers" className={styles.more}>
              查看更多 <RightOutlined />
            </Link>
          </div>
          <Row gutter={[24, 24]}>
            {designers.map((designer) => (
              <Col key={designer._id} xs={24} sm={12} md={6}>
                <Link to={`/designers/${designer._id}`}>
                  <Card hoverable className={styles.designerCard}>
                    <div className={styles.designerAvatar}>
                      <img src={designer.avatar || 'https://via.placeholder.com/100'} alt={designer.name} />
                    </div>
                    <h3 className={styles.designerName}>{designer.name}</h3>
                    <p className={styles.designerTitle}>{designer.title}</p>
                    <div className={styles.designerInfo}>
                      <Rate disabled defaultValue={designer.rating} allowHalf style={{ fontSize: 14 }} />
                      <span>{designer.experience}年经验 | {designer.caseCount}个案例</span>
                    </div>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Features */}
      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>我们的优势</h2>
          <Row gutter={[48, 24]}>
            <Col xs={24} sm={12} md={6}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>01</div>
                <h4>严选设计师</h4>
                <p>平台严格审核，确保设计师专业水平</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>02</div>
                <h4>透明报价</h4>
                <p>标准化报价体系，拒绝隐形消费</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>03</div>
                <h4>全程监督</h4>
                <p>专业监理服务，保障施工质量</p>
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>04</div>
                <h4>售后保障</h4>
                <p>完善的售后服务体系</p>
              </div>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  )
}

export default Home
