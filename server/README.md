# 装修小程序后端服务

基于 Express + TypeScript + MongoDB + Redis 构建的装修小程序后端 API 服务。

## 技术栈

- **Node.js** - 运行环境
- **Express.js** - Web 框架
- **TypeScript** - 类型安全
- **MongoDB** - 主数据库
- **Mongoose** - MongoDB ODM
- **Redis** - 缓存和会话存储
- **JWT** - 用户认证
- **bcryptjs** - 密码加密
- **Helmet** - 安全头
- **Morgan** - 日志记录
- **Compression** - 响应压缩

## 项目结构

```
server/
├── src/
│   ├── config/          # 配置文件
│   │   └── database.ts  # 数据库连接
│   ├── controllers/     # 控制器
│   │   ├── authController.ts
│   │   ├── caseController.ts
│   │   ├── diaryController.ts
│   │   ├── favoriteController.ts
│   │   └── recommendController.ts
│   ├── middleware/      # 中间件
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── models/          # 数据模型
│   │   ├── User.ts
│   │   ├── Case.ts
│   │   ├── Designer.ts
│   │   ├── Diary.ts
│   │   ├── Favorite.ts
│   │   ├── BrowseHistory.ts
│   │   └── Merchant.ts
│   ├── routes/          # 路由
│   │   ├── index.ts
│   │   ├── authRoutes.ts
│   │   ├── caseRoutes.ts
│   │   ├── diaryRoutes.ts
│   │   ├── favoriteRoutes.ts
│   │   └── recommendRoutes.ts
│   └── index.ts         # 应用入口
├── .env.example         # 环境变量示例
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# MongoDB 配置
MONGODB_URI=mongodb://localhost:27017/zhuangxiu

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT 配置
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# CORS 配置
ALLOWED_ORIGINS=http://localhost:10200
```

### 3. 启动 MongoDB

```bash
# 使用 Docker
docker run -d -p 27017:27017 --name mongodb mongo

# 或使用本地安装的 MongoDB
mongod
```

### 4. 启动 Redis

```bash
# 使用 Docker
docker run -d -p 6379:6379 --name redis redis

# 或使用本地安装的 Redis
redis-server
```

### 5. 运行开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动

### 6. 构建生产版本

```bash
npm run build
npm start
```

## API 文档

### 认证相关

#### 微信登录
```http
POST /api/v1/auth/wechat-login
Content-Type: application/json

{
  "code": "微信登录code",
  "userInfo": {
    "nickname": "用户昵称",
    "avatar": "头像URL",
    "gender": "male|female|unknown"
  }
}
```

#### 获取当前用户信息
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

#### 更新用户资料
```http
PUT /api/v1/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "nickname": "新昵称",
  "avatar": "新头像URL",
  "gender": "male",
  "region": "北京市",
  "signature": "个性签名"
}
```

### 案例相关

#### 获取案例列表
```http
GET /api/v1/cases?page=1&limit=10&style=现代简约&minArea=80&maxArea=150
```

#### 获取案例详情
```http
GET /api/v1/cases/:id
```

#### 搜索案例
```http
GET /api/v1/cases/search?keyword=现代简约&page=1&limit=10
```

#### 获取热门案例
```http
GET /api/v1/cases/hot?limit=10
```

### 装修日记相关

#### 获取我的日记列表
```http
GET /api/v1/diaries?page=1&limit=20
Authorization: Bearer <token>
```

#### 创建日记
```http
POST /api/v1/diaries
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "日记标题",
  "content": "日记内容",
  "images": ["图片URL1", "图片URL2"],
  "tags": ["水电", "泥瓦"],
  "progress": 50
}
```

#### 更新日记
```http
PUT /api/v1/diaries/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "新标题",
  "progress": 80
}
```

#### 删除日记
```http
DELETE /api/v1/diaries/:id
Authorization: Bearer <token>
```

#### 获取统计信息
```http
GET /api/v1/diaries/stats
Authorization: Bearer <token>
```

### 收藏相关

#### 获取我的收藏
```http
GET /api/v1/favorites?targetType=case&page=1&limit=20
Authorization: Bearer <token>
```

#### 添加收藏
```http
POST /api/v1/favorites
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetType": "case|designer",
  "targetId": "目标ID"
}
```

#### 取消收藏
```http
DELETE /api/v1/favorites/:targetType/:targetId
Authorization: Bearer <token>
```

#### 检查收藏状态
```http
GET /api/v1/favorites/check/:targetType/:targetId
Authorization: Bearer <token>
```

### 智能推荐相关

#### 获取推荐案例
```http
GET /api/v1/recommend/cases?limit=10
Authorization: Bearer <token>
```

#### 获取推荐设计师
```http
GET /api/v1/recommend/designers?limit=10
Authorization: Bearer <token>
```

#### 获取相似案例
```http
GET /api/v1/recommend/similar/:id?limit=5
Authorization: Bearer <token>
```

## 数据模型

### User（用户）
- nickname: 昵称
- avatar: 头像
- phone: 手机号
- openid: 微信openid
- gender: 性别
- region: 地区
- signature: 个性签名
- role: 角色（user/merchant/admin）

### Case（案例）
- title: 标题
- style: 风格
- area: 面积
- price: 价格
- images: 图片数组
- description: 描述
- tags: 标签
- designer: 设计师引用
- viewCount: 浏览次数
- favoriteCount: 收藏次数

### Diary（装修日记）
- user: 用户引用
- title: 标题
- content: 内容
- images: 图片数组
- tags: 标签
- progress: 进度（0-100）

### Favorite（收藏）
- user: 用户引用
- targetType: 类型（case/designer）
- targetId: 目标ID

### BrowseHistory（浏览历史）
- user: 用户引用
- targetType: 类型（case/designer）
- targetId: 目标ID

## 功能特性

- ✅ JWT 用户认证
- ✅ 微信小程序登录
- ✅ 案例 CRUD 操作
- ✅ 装修日记管理
- ✅ 收藏功能
- ✅ 浏览历史追踪
- ✅ 智能推荐算法
- ✅ Redis 缓存
- ✅ 分页查询
- ✅ 搜索过滤
- ✅ 错误处理
- ✅ 请求日志
- ✅ 响应压缩
- ✅ CORS 支持
- ✅ 安全头配置

## 开发命令

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 生产模式
npm start

# 代码检查
npm run lint
```

## 环境要求

- Node.js >= 16
- MongoDB >= 5.0
- Redis >= 6.0

## 许可证

MIT
