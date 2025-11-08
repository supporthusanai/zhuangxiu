# 部署指南

## 生产环境部署

### 1. 使用 PM2 部署

#### 安装 PM2
```bash
npm install -g pm2
```

#### PM2 配置文件
创建 `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'zhuangxiu-api',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
```

#### 启动命令
```bash
# 构建
npm run build

# 启动
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启
pm2 restart zhuangxiu-api

# 停止
pm2 stop zhuangxiu-api
```

### 2. Docker 部署

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/zhuangxiu
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - mongo
      - redis
    restart: unless-stopped

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  mongo-data:
  redis-data:
```

#### 启动 Docker
```bash
docker-compose up -d
```

### 3. Nginx 反向代理

#### Nginx 配置
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io 支持
    location /socket.io/ {
        proxy_pass http://localhost:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 静态文件
    location /uploads/ {
        alias /path/to/app/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4. SSL 证书（Let's Encrypt）

```bash
# 安装 certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d api.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

### 5. 环境变量配置

生产环境 `.env` 文件：
```env
NODE_ENV=production
PORT=3000

# MongoDB
MONGODB_URI=mongodb://username:password@host:27017/zhuangxiu

# Redis
REDIS_HOST=redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT
JWT_SECRET=your-very-secret-key-change-this
JWT_EXPIRES_IN=7d

# 微信
WECHAT_APP_ID=your-production-app-id
WECHAT_APP_SECRET=your-production-app-secret

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# 文件上传
UPLOAD_DIR=/var/www/uploads
MAX_FILE_SIZE=10485760
```

### 6. 数据库备份

#### MongoDB 备份脚本
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/mongodb"
mongodump --uri="mongodb://username:password@host:27017/zhuangxiu" --out="$BACKUP_DIR/backup_$DATE"

# 保留最近7天的备份
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

#### 设置定时任务
```bash
crontab -e

# 每天凌晨2点备份
0 2 * * * /path/to/backup-mongodb.sh
```

### 7. 监控和日志

#### 日志收集
使用 PM2 或 Docker logs：
```bash
# PM2
pm2 logs zhuangxiu-api --lines 100

# Docker
docker-compose logs -f api
```

#### 性能监控
```bash
# PM2 监控
pm2 monit

# 或使用 PM2 Plus
pm2 link <secret> <public>
```

### 8. 安全建议

1. **防火墙配置**
```bash
# 只开放必要端口
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

2. **限流配置**
使用 express-rate-limit 中间件

3. **HTTPS 强制**
在 Nginx 中配置重定向

4. **定期更新依赖**
```bash
npm audit
npm audit fix
```

### 9. 性能优化

1. **启用 Gzip 压缩** (已在代码中实现)

2. **Redis 缓存策略**
   - 热门数据缓存
   - 推荐结果缓存
   - Session 存储

3. **数据库索引优化**
   - 已在 Model 中定义索引
   - 定期分析慢查询

4. **CDN 加速**
   - 静态文件使用 CDN
   - 图片压缩和优化

### 10. 健康检查

API 提供健康检查端点：
```
GET /api/v1/health
```

在负载均衡器中配置：
```nginx
location /health {
    access_log off;
    proxy_pass http://localhost:3000/api/v1/health;
}
```

## 故障排查

### 常见问题

1. **端口被占用**
```bash
lsof -i :3000
kill -9 <PID>
```

2. **MongoDB 连接失败**
- 检查 MongoDB 服务状态
- 验证连接字符串
- 检查网络连接

3. **Redis 连接失败**
- 检查 Redis 服务状态
- 验证密码配置

4. **内存溢出**
- 增加 PM2 max_memory_restart
- 检查内存泄漏
- 优化查询

## 回滚策略

```bash
# PM2
pm2 restart zhuangxiu-api --update-env

# Docker
docker-compose down
docker-compose up -d

# 快速回滚到上一个版本
git checkout <previous-commit>
npm run build
pm2 restart zhuangxiu-api
```
