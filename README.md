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

## 待完善功能

- [ ] 案例详情页
- [ ] 设计师详情页
- [ ] 用户登录功能
- [ ] 订单管理系统
- [ ] 预约功能
- [ ] 装修计算器
- [ ] 在线客服
- [ ] 图片上传
- [ ] 评论系统
- [ ] 支付功能

## 注意事项

1. 图片资源使用的是占位符，实际开发需要替换为真实图片
2. TabBar 图标需要准备相应的图标资源
3. 数据目前是静态 Mock 数据，需要对接后端 API
4. 需要配置小程序的 AppID 才能真机预览

## License

MIT
