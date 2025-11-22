import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Card, Row, Col, Select, Pagination, Empty, Spin, Tag } from 'antd'
import { caseApi } from '@/services/api'
import styles from './index.module.css'

interface CaseItem {
  _id: string
  title: string
  coverImage: string
  style: string
  area: number
  budget: string
  roomType: string
  location: string
}

const styleOptions = ['全部', '现代简约', '北欧风格', '中式风格', '轻奢风格', '日式风格', '美式风格']
const areaOptions = ['全部', '50-80m²', '80-120m²', '120-150m²', '150m²以上']
const budgetOptions = ['全部', '10万以下', '10-20万', '20-50万', '50万以上']

const Cases = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [cases, setCases] = useState<CaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 12

  const [filters, setFilters] = useState({
    style: searchParams.get('style') || '全部',
    area: '全部',
    budget: '全部',
  })

  useEffect(() => {
    fetchCases()
  }, [page, filters])

  const fetchCases = async () => {
    setLoading(true)
    try {
      const params: any = { page, limit: pageSize }
      if (filters.style !== '全部') params.style = filters.style
      if (filters.area !== '全部') {
        // 解析面积范围
        const areaMap: Record<string, { minArea?: number; maxArea?: number }> = {
          '50-80m²': { minArea: 50, maxArea: 80 },
          '80-120m²': { minArea: 80, maxArea: 120 },
          '120-150m²': { minArea: 120, maxArea: 150 },
          '150m²以上': { minArea: 150 },
        }
        const areaRange = areaMap[filters.area]
        if (areaRange) {
          if (areaRange.minArea) params.minArea = areaRange.minArea
          if (areaRange.maxArea) params.maxArea = areaRange.maxArea
        }
      }
      if (filters.budget !== '全部') {
        // 解析预算范围
        const budgetMap: Record<string, { minPrice?: number; maxPrice?: number }> = {
          '10万以下': { maxPrice: 100000 },
          '10-20万': { minPrice: 100000, maxPrice: 200000 },
          '20-50万': { minPrice: 200000, maxPrice: 500000 },
          '50万以上': { minPrice: 500000 },
        }
        const budgetRange = budgetMap[filters.budget]
        if (budgetRange) {
          if (budgetRange.minPrice) params.minPrice = budgetRange.minPrice
          if (budgetRange.maxPrice) params.maxPrice = budgetRange.maxPrice
        }
      }

      const res: any = await caseApi.getList(params)
      setCases(res.data?.cases || res.data?.list || [])
      setTotal(res.data?.pagination?.total || res.data?.total || 0)
    } catch (error) {
      console.error('Failed to fetch cases:', error)
      setCases([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  return (
    <div className={styles.cases}>
      <div className={styles.container}>
        {/* Page Header */}
        <div className={styles.header}>
          <h1>装修案例</h1>
          <p>精选真实装修案例，找到属于你的家居风格</p>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>风格：</span>
            <div className={styles.filterOptions}>
              {styleOptions.map((option) => (
                <span
                  key={option}
                  className={`${styles.filterOption} ${filters.style === option ? styles.active : ''}`}
                  onClick={() => handleFilterChange('style', option)}
                >
                  {option}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>面积：</span>
            <div className={styles.filterOptions}>
              {areaOptions.map((option) => (
                <span
                  key={option}
                  className={`${styles.filterOption} ${filters.area === option ? styles.active : ''}`}
                  onClick={() => handleFilterChange('area', option)}
                >
                  {option}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>预算：</span>
            <div className={styles.filterOptions}>
              {budgetOptions.map((option) => (
                <span
                  key={option}
                  className={`${styles.filterOption} ${filters.budget === option ? styles.active : ''}`}
                  onClick={() => handleFilterChange('budget', option)}
                >
                  {option}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Case List */}
        <Spin spinning={loading}>
          {cases.length > 0 ? (
            <>
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
                              {item.location && (
                                <span className={styles.location}>{item.location}</span>
                              )}
                            </div>
                          }
                        />
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
            !loading && <Empty description="暂无相关案例" />
          )}
        </Spin>
      </div>
    </div>
  )
}

export default Cases
