import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Row, Col, Image, Tag, Button, Rate, Divider, Card, Avatar, message, Spin } from 'antd'
import { HeartOutlined, HeartFilled, ShareAltOutlined, UserOutlined } from '@ant-design/icons'
import { caseApi, favoriteApi } from '@/services/api'
import styles from './index.module.css'

interface CaseDetail {
  _id: string
  title: string
  description: string
  coverImage: string
  images: string[]
  style: string
  area: number
  budget: string
  roomType: string
  location: string
  designer: {
    _id: string
    name: string
    avatar: string
    title: string
    rating: number
  }
  createdAt: string
}

const CaseDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [caseData, setCaseData] = useState<CaseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (id) {
      fetchCaseDetail()
      checkFavorite()
    }
  }, [id])

  const fetchCaseDetail = async () => {
    try {
      const res: any = await caseApi.getDetail(id!)
      setCaseData(res.data)
    } catch (error) {
      console.error('Failed to fetch case detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkFavorite = async () => {
    try {
      const res: any = await favoriteApi.check('case', id!)
      setIsFavorite(res.data?.isFavorite || false)
    } catch (error) {
      // User not logged in
    }
  }

  const handleFavorite = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      message.warning('请先登录')
      return
    }

    try {
      if (isFavorite) {
        await favoriteApi.remove(id!)
        setIsFavorite(false)
        message.success('已取消收藏')
      } else {
        await favoriteApi.add({ type: 'case', targetId: id! })
        setIsFavorite(true)
        message.success('收藏成功')
      }
    } catch (error) {
      message.error('操作失败')
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spin size="large" />
      </div>
    )
  }

  if (!caseData) {
    return <div className={styles.notFound}>案例不存在</div>
  }

  return (
    <div className={styles.caseDetail}>
      <div className={styles.container}>
        <Row gutter={[32, 32]}>
          {/* Left: Images */}
          <Col xs={24} lg={16}>
            <div className={styles.mainImage}>
              <Image src={caseData.coverImage} alt={caseData.title} />
            </div>
            <div className={styles.imageGallery}>
              <Image.PreviewGroup>
                {caseData.images?.map((img, index) => (
                  <Image key={index} src={img} alt={`${caseData.title} ${index + 1}`} />
                ))}
              </Image.PreviewGroup>
            </div>

            <Divider />

            <div className={styles.content}>
              <h2>案例介绍</h2>
              <p>{caseData.description}</p>
            </div>
          </Col>

          {/* Right: Info */}
          <Col xs={24} lg={8}>
            <Card className={styles.infoCard}>
              <h1 className={styles.title}>{caseData.title}</h1>
              <div className={styles.tags}>
                <Tag color="blue">{caseData.style}</Tag>
                <Tag>{caseData.roomType}</Tag>
              </div>
              <div className={styles.meta}>
                <div className={styles.metaItem}>
                  <span className={styles.label}>面积</span>
                  <span className={styles.value}>{caseData.area}m²</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.label}>预算</span>
                  <span className={styles.value}>{caseData.budget}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.label}>位置</span>
                  <span className={styles.value}>{caseData.location}</span>
                </div>
              </div>

              <div className={styles.actions}>
                <Button
                  icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
                  onClick={handleFavorite}
                  type={isFavorite ? 'primary' : 'default'}
                >
                  {isFavorite ? '已收藏' : '收藏'}
                </Button>
                <Button icon={<ShareAltOutlined />}>分享</Button>
              </div>
            </Card>

            {/* Designer Card */}
            {caseData.designer && (
              <Card className={styles.designerCard}>
                <h3>设计师</h3>
                <Link to={`/designers/${caseData.designer._id}`} className={styles.designer}>
                  <Avatar
                    size={64}
                    src={caseData.designer.avatar}
                    icon={<UserOutlined />}
                  />
                  <div className={styles.designerInfo}>
                    <h4>{caseData.designer.name}</h4>
                    <p>{caseData.designer.title}</p>
                    <Rate disabled defaultValue={caseData.designer.rating} allowHalf style={{ fontSize: 12 }} />
                  </div>
                </Link>
                <Button type="primary" block style={{ marginTop: 16 }}>
                  在线咨询
                </Button>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default CaseDetail
