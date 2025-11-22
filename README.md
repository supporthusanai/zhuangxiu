# 装修小程序

基于 Taro + React + TypeScript 开发的装修服务小程序

## 技术栈

- **框架**: Taro 4.x
- **UI库**: React 18
- **语言**: TypeScript
- **样式**: SCSS

## 功能特性

### 📱 主要功能

- **首页**: 轮播展示、服务介绍、精品案例、设计师推荐
- **案例展示**: 分类浏览装修案例，多种风格筛选
- **设计师**: 浏览和预约专业设计师
- **个人中心**: 订单管理、预约记录、收藏管理

### 🎨 设计风格

- 现代简约的UI设计
- 渐变色主题（紫色系）
- 卡片式布局
- 流畅的交互体验

## 项目结构

```
zhuangxiu-miniapp/
├── src/
│   ├── pages/              # 页面文件
│   │   ├── index/         # 首页
│   │   ├── cases/         # 案例页
│   │   ├── designers/     # 设计师页
│   │   └── mine/          # 我的页面
│   ├── components/        # 公共组件
│   ├── app.config.ts     # 应用配置
│   ├── app.tsx           # 应用入口
│   └── app.scss          # 全局样式
├── config/               # Taro配置
├── package.json
└── tsconfig.json
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 微信小程序
npm run dev:weapp

# 支付宝小程序
npm run dev:alipay

# H5
npm run dev:h5
```

### 生产构建

```bash
# 微信小程序
npm run build:weapp

# 支付宝小程序
npm run build:alipay

# H5
npm run build:h5
```

## 开发说明

### 微信开发者工具

1. 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 运行 `npm run dev:weapp`
3. 在微信开发者工具中导入项目根目录下的 `dist` 文件夹

### 目录说明

- `src/pages`: 页面文件，每个页面包含 `.tsx` 和 `.scss` 文件
- `src/components`: 可复用的组件
- `config`: Taro 编译配置
- `src/app.config.ts`: 小程序全局配置（页面路由、tabBar等）

## 文档索引

本项目包含完整的开发文档，帮助你快速上手和开发：

### 📚 核心文档

- **[CLAUDE.md](./CLAUDE.md)** - AI 助手开发指南
  - 完整的代码库结构说明
  - 开发工作流程和最佳实践
  - 常见任务操作指南
  - 适合 AI 助手和新团队成员快速了解项目

### 🔧 技术文档

位于 `/docs` 目录：

- **[API.md](./docs/API.md)** - 后端 API 接口文档
  - 完整的 RESTful API 端点定义
  - 请求/响应格式说明
  - 认证和错误处理

- **[MERCHANT_API.md](./docs/MERCHANT_API.md)** - 商家功能 API 文档
  - 商家注册和管理接口
  - 案例管理功能
  - 设计师管理功能

- **[WECHAT_LOGIN.md](./docs/WECHAT_LOGIN.md)** - 微信登录集成指南
  - 微信 OAuth 流程说明
  - 前后端集成步骤
  - 常见问题解决

- **[INTEGRATION.md](./docs/INTEGRATION.md)** - 前后端集成完整指南
  - 环境配置详解
  - 代码使用示例
  - 集成检查清单
  - 性能优化建议

### 🚀 后端文档

位于 `/server` 目录：

- **[server/README.md](./server/README.md)** - 后端项目说明
  - 技术栈和架构
  - 快速开始指南
  - API 使用说明

- **[server/DEPLOYMENT.md](./server/DEPLOYMENT.md)** - 部署指南
  - PM2 集群部署
  - Docker 容器化部署
  - 生产环境配置

## 功能状态

### ✅ 已完成功能

- [x] 微信登录和认证系统
- [x] 案例浏览和详情页
- [x] 设计师浏览和详情页
- [x] 装修日记 CRUD
- [x] 收藏功能
- [x] 智能推荐系统
- [x] 实时聊天功能
- [x] 商家管理系统
- [x] 图片上传和处理
- [x] 用户个人中心

### 🚧 待完善功能

- [ ] 订单管理系统
- [ ] 预约功能
- [ ] 装修计算器
- [ ] 评论系统
- [ ] 支付功能
- [ ] 单元测试

## 注意事项

1. **图标资源**: TabBar 图标目前是 SVG 格式，需要转换为 PNG（81x81px）或更新配置使用 SVG
2. **环境配置**:
   - 前端需配置微信小程序 AppID
   - 后端需配置 `.env` 文件（参考 `server/.env.example`）
3. **数据库**: 确保 MongoDB 和 Redis 服务已启动
4. **API 文档**: 访问 `http://localhost:3000/api-docs` 查看 Swagger 文档

## 快速开始

```bash
# 1. 安装依赖
npm install
cd server && npm install

# 2. 配置环境
cp server/.env.example server/.env
# 编辑 server/.env 配置数据库和微信信息

# 3. 启动后端
cd server && npm run dev

# 4. 启动前端（新终端）
cd .. && npm run dev:weapp
```

详细步骤请参考 [docs/INTEGRATION.md](./docs/INTEGRATION.md)

## License

MIT
