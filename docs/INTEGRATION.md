# 前后端集成完整指南

本文档包含装修小程序前后端集成的所有必要信息，包括环境配置、使用示例、集成检查清单和最佳实践。

---

## 目录

- [环境配置](#环境配置)
- [使用示例](#使用示例)
- [集成检查清单](#集成检查清单)
- [错误处理](#错误处理)
- [性能优化](#性能优化)
- [测试指南](#测试指南)

---

## 环境配置

### 1. 前端配置

#### 创建 API 配置文件

在 `src` 目录下创建 `config.ts`:

```typescript
export const API_CONFIG = {
  // 开发环境
  development: {
    apiUrl: 'http://localhost:3000/api/v1',
  },
  // 生产环境
  production: {
    apiUrl: 'https://api.yourdomain.com/api/v1',
  },
};

const env = process.env.NODE_ENV || 'development';
export const API_URL = API_CONFIG[env].apiUrl;
```

#### 环境变量配置

创建 `.env.development` 和 `.env.production`:

```bash
# .env.development
TARO_APP_API_URL=http://localhost:3000/api/v1

# .env.production
TARO_APP_API_URL=https://api.yourdomain.com/api/v1
```

### 2. 后端配置

#### 环境变量配置

```bash
# server/.env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/zhuangxiu
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
WECHAT_APP_ID=your-app-id
WECHAT_APP_SECRET=your-app-secret
ALLOWED_ORIGINS=http://localhost:10200
LOG_DIR=logs
```

#### 依赖安装

```bash
# 后端
cd server
npm install

# 前端
cd ..
npm install
```

### 3. 数据库准备

```bash
# 启动 MongoDB (Docker)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# 启动 Redis (Docker)
docker run -d -p 6379:6379 --name redis redis:latest

# 或使用本地安装
mongod
redis-server
```

### 4. 微信小程序配置

在微信公众平台配置服务器域名：

```javascript
request 合法域名：https://your-domain.com
uploadFile 合法域名：https://your-domain.com
downloadFile 合法域名：https://your-domain.com
socket 合法域名：wss://your-domain.com
```

---

## 使用示例

### 1. 微信登录流程

```typescript
import Taro from '@tarojs/taro';
import { wechatLogin, setToken } from '@/services/api';

const handleWechatLogin = async () => {
  try {
    // 1. 获取微信登录 code
    const { code } = await Taro.login();

    // 2. 获取用户信息
    const { userInfo } = await Taro.getUserProfile({
      desc: '用于完善会员资料',
    });

    // 3. 调用后端登录接口
    const response = await wechatLogin({
      code,
      userInfo: {
        nickname: userInfo.nickName,
        avatar: userInfo.avatarUrl,
        gender: userInfo.gender === 1 ? 'male' : userInfo.gender === 2 ? 'female' : 'unknown',
      },
    });

    // 4. 保存 token
    if (response.success && response.data?.token) {
      setToken(response.data.token);
      Taro.showToast({
        title: '登录成功',
        icon: 'success',
      });
      Taro.switchTab({ url: '/pages/index/index' });
    }
  } catch (error) {
    console.error('登录失败:', error);
  }
};
```

### 2. 获取案例列表

```typescript
import { useState, useEffect } from 'react';
import { getCases } from '@/services/api';

const CaseList = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCases = async () => {
    try {
      setLoading(true);
      const response = await getCases({
        page: 1,
        limit: 10,
        style: '现代简约',
      });

      if (response.success && response.data) {
        setCases(response.data.cases);
      }
    } catch (error) {
      console.error('获取案例失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  return (
    <View>
      {loading && <View>加载中...</View>}
      {cases.map(item => (
        <View key={item.id}>{item.title}</View>
      ))}
    </View>
  );
};
```

### 3. 创建装修日记

```typescript
import { useState } from 'react';
import { createDiary, uploadImage } from '@/services/api';

const CreateDiary = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // 选择并上传图片
  const handleChooseImage = async () => {
    try {
      const { tempFilePaths } = await Taro.chooseImage({
        count: 9 - images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });

      // 批量上传
      const uploadPromises = tempFilePaths.map(filePath => uploadImage(filePath));
      const results = await Promise.all(uploadPromises);

      const urls = results
        .filter(res => res.success)
        .map(res => res.data?.url)
        .filter(Boolean);

      setImages([...images, ...urls]);
    } catch (error) {
      console.error('上传图片失败:', error);
    }
  };

  // 提交日记
  const handleSubmit = async () => {
    try {
      const response = await createDiary({
        title,
        content,
        images,
        tags: ['水电'],
        progress: 50,
      });

      if (response.success) {
        Taro.showToast({ title: '发布成功', icon: 'success' });
        Taro.navigateBack();
      }
    } catch (error) {
      console.error('发布失败:', error);
    }
  };

  return (
    <View>
      <Input value={title} onInput={(e) => setTitle(e.detail.value)} />
      <Textarea value={content} onInput={(e) => setContent(e.detail.value)} />
      <Button onClick={handleChooseImage}>选择图片</Button>
      <Button onClick={handleSubmit}>发布</Button>
    </View>
  );
};
```

### 4. 收藏功能

```typescript
import { useState, useEffect } from 'react';
import { checkFavorite, addFavorite, removeFavorite } from '@/services/api';

const CaseDetail = ({ caseId }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  // 检查收藏状态
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await checkFavorite('case', caseId);
        if (response.success && response.data) {
          setIsFavorited(response.data.isFavorited);
        }
      } catch (error) {
        console.error('检查收藏状态失败:', error);
      }
    };
    checkStatus();
  }, [caseId]);

  // 切换收藏
  const toggleFavorite = async () => {
    try {
      if (isFavorited) {
        await removeFavorite('case', caseId);
        setIsFavorited(false);
        Taro.showToast({ title: '已取消收藏', icon: 'success' });
      } else {
        await addFavorite({ targetType: 'case', targetId: caseId });
        setIsFavorited(true);
        Taro.showToast({ title: '收藏成功', icon: 'success' });
      }
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  return (
    <Button onClick={toggleFavorite}>
      {isFavorited ? '已收藏' : '收藏'}
    </Button>
  );
};
```

### 5. 智能推荐

```typescript
import { useState, useEffect } from 'react';
import { getRecommendedCases } from '@/services/api';

const RecommendSection = () => {
  const [recommendedCases, setRecommendedCases] = useState([]);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const response = await getRecommendedCases(10);
        if (response.success && response.data) {
          setRecommendedCases(response.data);
        }
      } catch (error) {
        console.error('获取推荐失败:', error);
      }
    };
    loadRecommendations();
  }, []);

  return (
    <View>
      {recommendedCases.map(item => (
        <View key={item.id}>{item.title}</View>
      ))}
    </View>
  );
};
```

### 6. 商家申请

```typescript
import { useState } from 'react';
import { applyMerchant, uploadImage } from '@/services/api';

const MerchantApply = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    businessLicense: '',
    contactPerson: '',
    contactPhone: '',
    address: '',
    description: '',
  });

  // 上传营业执照
  const handleUploadLicense = async () => {
    try {
      const { tempFilePaths } = await Taro.chooseImage({
        count: 1,
        sourceType: ['album', 'camera'],
      });

      const response = await uploadImage(tempFilePaths[0]);

      if (response.success && response.data) {
        setFormData({ ...formData, businessLicense: response.data.url });
      }
    } catch (error) {
      console.error('上传失败:', error);
    }
  };

  // 提交申请
  const handleSubmit = async () => {
    try {
      const response = await applyMerchant(formData);

      if (response.success) {
        Taro.showToast({ title: '申请已提交', icon: 'success' });
        Taro.navigateBack();
      }
    } catch (error) {
      console.error('申请失败:', error);
    }
  };

  return (
    <View>
      <Button onClick={handleUploadLicense}>上传营业执照</Button>
      <Button onClick={handleSubmit}>提交申请</Button>
    </View>
  );
};
```

---

## 集成检查清单

### ✅ 1. 环境配置

- [x] 后端环境变量配置 (`.env`)
- [x] 前端环境变量配置
- [x] MongoDB 连接配置
- [x] Redis 连接配置
- [x] 微信 AppID/Secret 配置

### ✅ 2. 依赖安装

**后端核心依赖**:
- [x] express@^4.18.2
- [x] mongoose@^8.0.3
- [x] redis@^4.6.12
- [x] socket.io@^4.6.1
- [x] bull@^4.12.0
- [x] sharp@^0.33.1
- [x] winston@^3.11.0
- [x] swagger-ui-express@^5.0.0

**前端核心依赖**:
- [x] @tarojs/taro@4.1.8
- [x] react@^18.3.1

### ✅ 3. 数据模型一致性

#### Case 模型字段
```typescript
{
  title: string;           ✅
  description: string;     ✅
  style: string;           ✅
  area: number;            ✅
  price: number;           ✅
  images: string[];        ✅
  tags: string[];          ✅
  rooms: string;           ✅
  floor: string;           ✅
  district: string;        ✅
  designer: ObjectId;      ✅
  merchant: ObjectId;      ✅
  status: enum;            ✅
  viewCount: number;       ✅
  favoriteCount: number;   ✅
  isHot: boolean;          ✅
  isRecommended: boolean;  ✅
}
```

#### User 模型
```typescript
{
  openid: string;
  phone: string;
  nickname: string;
  avatar: string;
  gender: 'male' | 'female' | 'unknown';
  region: string;
  signature: string;
  role: 'user' | 'merchant' | 'admin';
  isActive: boolean;
}
```

### ✅ 4. API 路由注册

- [x] `/auth` - 认证路由
- [x] `/cases` - 案例路由
- [x] `/diaries` - 日记路由
- [x] `/favorites` - 收藏路由
- [x] `/recommend` - 推荐路由
- [x] `/upload` - 上传路由
- [x] `/merchants` - 商家路由
- [x] `/chat` - 聊天路由

### ✅ 5. 认证流程

```
前端小程序 → wx.login() → 获取 code
    ↓
POST /auth/wechat-login
    ↓
code → 微信API → openid
    ↓
创建/查找用户 → 生成 JWT token
    ↓
前端存储 token
    ↓
后续请求携带 Authorization: Bearer <token>
```

### ✅ 6. 文件上传流程

```
1. 前端: Taro.chooseImage() 选择图片
2. 前端: uploadFile(filePath) 调用上传
3. 后端: Multer 中间件处理
4. 后端: 文件类型验证
5. 后端: 文件大小验证 (5MB)
6. 后端: 保存到 uploads/ 目录
7. 后端: 返回文件 URL
8. 前端: 接收并使用 URL
```

### ✅ 7. WebSocket 连接

**前端连接**:
```typescript
const socket = io('http://localhost:3000', {
  auth: { token: getToken() }
});
```

**后端功能**:
- [x] Socket.io JWT 认证中间件
- [x] 在线用户跟踪 (Map)
- [x] 房间管理 (用户房间 + 对话房间)
- [x] 消息持久化 (MongoDB)
- [x] 已读状态同步

### ✅ 8. 日志系统

```bash
server/logs/
├── error-YYYY-MM-DD.log      # 错误日志
├── combined-YYYY-MM-DD.log   # 综合日志
└── http-YYYY-MM-DD.log       # HTTP 请求日志
```

**日志级别**:
- error - 错误信息
- warn - 警告信息
- info - 一般信息
- http - HTTP 请求
- debug - 调试信息

### ✅ 9. 消息队列 (Bull)

- [x] emailQueue - 邮件发送
- [x] notificationQueue - 微信通知
- [x] imageQueue - 图片处理
- [x] syncQueue - 数据同步

### ✅ 10. 性能优化

**数据库**:
- [x] MongoDB 索引优化
- [x] Redis 缓存配置
- [x] 连接池管理

**中间件**:
- [x] Compression 响应压缩
- [x] Helmet 安全头
- [x] CORS 跨域配置

**异步处理**:
- [x] 图片处理队列化
- [x] 日志异步写入

### ✅ 11. 安全性

**认证**:
- [x] JWT Token (7天有效期)
- [x] bcrypt 密码加密
- [x] Token 自动过期处理

**验证**:
- [x] express-validator 参数验证
- [x] Multer 文件类型验证
- [x] 文件大小限制

**防护**:
- [x] Helmet 安全头
- [x] CORS 白名单
- [x] XSS 防护 (输入验证)
- [x] SQL 注入防护 (Mongoose ORM)

### ✅ 12. API 文档

- [x] Swagger UI: `http://localhost:3000/api-docs`
- [x] 完整的 API 端点定义
- [x] 请求/响应格式说明
- [x] 参数类型和验证规则
- [x] 示例请求和响应

---

## 错误处理

### 统一错误处理

所有 API 请求的错误在 `src/services/request.ts` 中统一处理：

- **401**: 自动清除 token 并跳转登录页
- **403**: 显示权限不足提示
- **404**: 显示资源不存在提示
- **500**: 显示服务器错误
- **网络错误**: 显示网络请求失败

### 自定义错误处理

```typescript
try {
  const response = await getCases();
  // 处理成功响应
} catch (error) {
  // 自定义错误处理
  console.error('请求失败:', error);
  Taro.showModal({
    title: '提示',
    content: '加载失败，是否重试？',
    success: (res) => {
      if (res.confirm) {
        // 重试逻辑
      }
    },
  });
}
```

---

## 性能优化

### 1. 请求缓存

对于不常变化的数据，使用本地缓存：

```typescript
const getCasesWithCache = async () => {
  const cacheKey = 'cases_list';
  const cached = Taro.getStorageSync(cacheKey);

  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    // 5分钟内的缓存有效
    return cached.data;
  }

  const response = await getCases();
  Taro.setStorageSync(cacheKey, {
    data: response.data,
    timestamp: Date.now(),
  });

  return response.data;
};
```

### 2. 防抖节流

对于频繁触发的请求，使用防抖：

```typescript
import { useMemo } from 'react';
import { debounce } from 'lodash';

const SearchPage = () => {
  const handleSearch = useMemo(
    () =>
      debounce(async (keyword: string) => {
        const response = await searchCases({ keyword });
        // 处理结果
      }, 300),
    []
  );

  return <Input onInput={(e) => handleSearch(e.detail.value)} />;
};
```

### 3. 分页加载

```typescript
const CaseList = () => {
  const [page, setPage] = useState(1);
  const [cases, setCases] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = async () => {
    try {
      const response = await getCases({ page, limit: 10 });

      if (response.success && response.data) {
        setCases([...cases, ...response.data.cases]);
        setHasMore(response.data.pagination.page < response.data.pagination.pages);
        setPage(page + 1);
      }
    } catch (error) {
      console.error('加载失败:', error);
    }
  };

  return (
    <ScrollView onScrollToLower={hasMore ? loadMore : undefined}>
      {cases.map(item => (
        <View key={item.id}>{item.title}</View>
      ))}
    </ScrollView>
  );
};
```

---

## 测试指南

### 1. 本地开发测试

```bash
# 启动后端服务
cd server
npm run dev

# 启动前端 (另一个终端)
cd ..
npm run dev:weapp
```

### 2. 真机调试

在微信开发者工具中配置：
- 不校验合法域名
- 启用调试模式

### 3. 生产环境部署

- 配置域名白名单
- 启用 HTTPS
- 配置 SSL 证书

### 4. 功能测试清单

- [ ] 后端服务启动成功
- [ ] MongoDB 连接正常
- [ ] Redis 连接正常
- [ ] API 文档可访问 (`/api-docs`)
- [ ] 健康检查接口 (`/api/v1/health`)
- [ ] 微信登录流程
- [ ] JWT 认证流程
- [ ] 文件上传功能
- [ ] WebSocket 连接
- [ ] 图片处理队列
- [ ] 日志文件生成
- [ ] 错误处理正确
- [ ] 权限控制有效

---

## 快速启动

### 完整启动步骤

```bash
# 1. 安装依赖
cd server && npm install
cd .. && npm install

# 2. 配置环境
cp server/.env.example server/.env
# 编辑 server/.env 文件，配置数据库和微信信息

# 3. 启动数据库 (Docker)
docker run -d -p 27017:27017 --name mongodb mongo
docker run -d -p 6379:6379 --name redis redis

# 4. 启动后端
cd server && npm run dev

# 5. 启动前端 (新终端)
npm run dev:weapp
```

### 验证服务

```bash
# 健康检查
curl http://localhost:3000/api/v1/health

# API 文档
open http://localhost:3000/api-docs
```

---

## 代码质量评分

| 项目 | 评分 | 说明 |
|------|------|------|
| 架构设计 | ⭐⭐⭐⭐⭐ | 清晰的分层架构 |
| 代码规范 | ⭐⭐⭐⭐⭐ | TypeScript + ESLint |
| 错误处理 | ⭐⭐⭐⭐⭐ | 统一的错误处理机制 |
| 日志系统 | ⭐⭐⭐⭐⭐ | 生产级 Winston |
| API 文档 | ⭐⭐⭐⭐⭐ | 完整的 Swagger |
| 类型安全 | ⭐⭐⭐⭐☆ | 部分需要完善 |
| 测试覆盖 | ⭐☆☆☆☆ | 需要添加测试 |
| 性能优化 | ⭐⭐⭐⭐☆ | 已做基础优化 |

---

## 常见问题

### 1. 端口冲突

```bash
# 修改后端端口
# server/.env
PORT=3001
```

### 2. 数据库连接失败

```bash
# 检查 MongoDB 是否运行
docker ps | grep mongo

# 检查连接字符串
# server/.env
MONGODB_URI=mongodb://localhost:27017/zhuangxiu
```

### 3. 微信登录失败

- 检查 `WECHAT_APP_ID` 和 `WECHAT_APP_SECRET` 配置
- 确认微信小程序已配置服务器域名
- 查看后端日志中的详细错误信息

### 4. 文件上传失败

- 检查 `uploads/` 目录是否存在且有写入权限
- 确认文件大小未超过 5MB
- 验证文件类型是否支持

---

**文档版本**: v1.0
**最后更新**: 2025-11-22
**维护者**: 装修小程序开发团队
