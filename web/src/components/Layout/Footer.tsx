import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.columns}>
          <div className={styles.column}>
            <h4>关于我们</h4>
            <ul>
              <li><Link to="/about">公司介绍</Link></li>
              <li><Link to="/contact">联系我们</Link></li>
              <li><Link to="/join">加入我们</Link></li>
            </ul>
          </div>
          <div className={styles.column}>
            <h4>帮助中心</h4>
            <ul>
              <li><Link to="/help/faq">常见问题</Link></li>
              <li><Link to="/help/guide">装修指南</Link></li>
              <li><Link to="/help/process">服务流程</Link></li>
            </ul>
          </div>
          <div className={styles.column}>
            <h4>商家入驻</h4>
            <ul>
              <li><Link to="/merchant/apply">入驻申请</Link></li>
              <li><Link to="/merchant/rules">入驻规则</Link></li>
              <li><Link to="/merchant/support">商家支持</Link></li>
            </ul>
          </div>
          <div className={styles.column}>
            <h4>联系方式</h4>
            <ul>
              <li>客服电话：400-888-8888</li>
              <li>工作时间：9:00-18:00</li>
              <li>邮箱：support@zhuangxiu.com</li>
            </ul>
          </div>
        </div>
        <div className={styles.bottom}>
          <p>Copyright 2024 装修平台 All Rights Reserved</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
