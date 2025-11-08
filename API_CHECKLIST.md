# API 接口检查清单

## 前后端接口匹配验证

### ✅ 认证模块 (Auth)

| 前端 API | 后端路由 | 方法 | 状态 |
|---------|---------|------|------|
| `wechatLogin()` | `/auth/wechat-login` | POST | ✅ 匹配 |
| `phoneLogin()` | `/auth/phone-login` | POST | ✅ 匹配 |
| `getCurrentUser()` | `/auth/me` | GET | ✅ 匹配 |
| `updateProfile()` | `/auth/profile` | PUT | ✅ 匹配 |
| `getWechatPhone()` | `/auth/wechat-phone` | POST | ✅ 匹配 |

**请求/响应格式：**
```typescript
// 微信登录
Request: { code: string; userInfo?: any }
Response: { success: boolean; message: string; data: { token: string; user: User } }

// 获取用户信息
Request: Headers { Authorization: 'Bearer <token>' }
Response: { success: boolean; data: User }

// 更新资料
Request: { nickname?: string; avatar?: string; gender?: string; region?: string; signature?: string }
Response: { success: boolean; message: string; data: User }
```

### ✅ 案例模块 (Cases)

| 前端 API | 后端路由 | 方法 | 状态 |
|---------|---------|------|------|
| `getCases()` | `/cases` | GET | ✅ 匹配 |
| `getCaseDetail()` | `/cases/:id` | GET | ✅ 匹配 |
| `searchCases()` | `/cases/search` | GET | ✅ 匹配 |
| `getHotCases()` | `/cases/hot` | GET | ✅ 匹配 |
| `createCase()` | `/cases` | POST | ✅ 匹配 |
| `updateCase()` | `/cases/:id` | PUT | ✅ 匹配 |
| `deleteCase()` | `/cases/:id` | DELETE | ✅ 匹配 |

**请求参数：**
```typescript
// 获取案例列表
Query: {
  page?: number;
  limit?: number;
  style?: string;
  minArea?: number;
  maxArea?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'createdAt' | 'viewCount' | 'favoriteCount';
  order?: 'asc' | 'desc';
}

// 创建案例
Body: {
  title: string;          // 必填
  description: string;    // 必填
  style: string;          // 必填
  rooms: string;          // 必填（户型）
  images: string[];       // 必填
  area?: number;
  price?: number;
  floor?: string;
  district?: string;
  tags?: string[];
  designer?: string;      // 设计师 ID
}
```

### ✅ 日记模块 (Diaries)

| 前端 API | 后端路由 | 方法 | 状态 |
|---------|---------|------|------|
| `getMyDiaries()` | `/diaries` | GET | ✅ 匹配 |
| `getDiaryDetail()` | `/diaries/:id` | GET | ✅ 匹配 |
| `createDiary()` | `/diaries` | POST | ✅ 匹配 |
| `updateDiary()` | `/diaries/:id` | PUT | ✅ 匹配 |
| `deleteDiary()` | `/diaries/:id` | DELETE | ✅ 匹配 |
| `getDiaryStats()` | `/diaries/stats` | GET | ✅ 匹配 |

**请求格式：**
```typescript
// 创建日记
Body: {
  title: string;        // 必填
  content: string;      // 必填
  images?: string[];
  tags?: string[];
  progress?: number;    // 0-100
}
```

### ✅ 收藏模块 (Favorites)

| 前端 API | 后端路由 | 方法 | 状态 |
|---------|---------|------|------|
| `getMyFavorites()` | `/favorites` | GET | ✅ 匹配 |
| `addFavorite()` | `/favorites` | POST | ✅ 匹配 |
| `removeFavorite()` | `/favorites/:targetType/:targetId` | DELETE | ✅ 匹配 |
| `checkFavorite()` | `/favorites/check/:targetType/:targetId` | GET | ✅ 匹配 |

**请求格式：**
```typescript
// 添加收藏
Body: {
  targetType: 'case' | 'designer';
  targetId: string;
}
```

### ✅ 推荐模块 (Recommend)

| 前端 API | 后端路由 | 方法 | 状态 |
|---------|---------|------|------|
| `getRecommendedCases()` | `/recommend/cases` | GET | ✅ 匹配 |
| `getRecommendedDesigners()` | `/recommend/designers` | GET | ✅ 匹配 |
| `getSimilarCases()` | `/recommend/similar/:id` | GET | ✅ 匹配 |

**智能推荐算法：**
- 基于用户收藏偏好
- 基于浏览历史
- 协同过滤
- 内容相似度

### ✅ 上传模块 (Upload)

| 前端 API | 后端路由 | 方法 | 状态 |
|---------|---------|------|------|
| `uploadImage()` | `/upload/image` | POST | ✅ 匹配 |

**文件限制：**
- 文件类型：image/jpeg, image/png, image/gif, image/webp
- 文件大小：最大 5MB
- 单次最多：10 个文件

### ✅ 商家模块 (Merchants)

| 前端 API | 后端路由 | 方法 | 状态 |
|---------|---------|------|------|
| `applyMerchant()` | `/merchants/apply` | POST | ✅ 匹配 |
| `getMyMerchant()` | `/merchants/me` | GET | ✅ 匹配 |
| `updateMerchant()` | `/merchants/me` | PUT | ✅ 匹配 |
| `addDesigner()` | `/merchants/designers` | POST | ✅ 匹配 |
| `getMyDesigners()` | `/merchants/designers` | GET | ✅ 匹配 |
| `updateDesigner()` | `/merchants/designers/:id` | PUT | ✅ 匹配 |
| `deleteDesigner()` | `/merchants/designers/:id` | DELETE | ✅ 匹配 |

**请求格式：**
```typescript
// 申请成为商家
Body: {
  companyName: string;        // 必填
  businessLicense: string;    // 必填（营业执照 URL）
  contactPerson: string;      // 必填
  contactPhone: string;       // 必填
  address: string;            // 必填
  logo?: string;
  description?: string;
}

// 添加设计师
Body: {
  name: string;
  avatar: string;
  title: string;
  experience: number;
  specialties: string[];
  introduction?: string;
}
```

### ✅ 聊天模块 (Chat)

| 前端 API | 后端路由 | 方法 | 状态 |
|---------|---------|------|------|
| `getConversations()` | `/chat/conversations` | GET | ✅ 匹配 |
| `getConversation()` | `/chat/conversations/:id` | GET | ✅ 匹配 |
| `getMessages()` | `/chat/conversations/:conversationId/messages` | GET | ✅ 匹配 |
| `createConversation()` | `/chat/conversations` | POST | ✅ 匹配 |
| `deleteConversation()` | `/chat/conversations/:id` | DELETE | ✅ 匹配 |
| `getUnreadCount()` | `/chat/unread-count` | GET | ✅ 匹配 |

**WebSocket 事件：**
```typescript
// 客户端 -> 服务器
- 'connection'           // 连接（需要 JWT）
- 'join_conversation'    // 加入对话
- 'send_message'         // 发送消息
- 'mark_read'            // 标记已读
- 'typing'               // 正在输入
- 'stop_typing'          // 停止输入
- 'disconnect'           // 断开连接

// 服务器 -> 客户端
- 'connected'            // 连接成功
- 'joined_conversation'  // 已加入对话
- 'message_sent'         // 消息已发送
- 'new_message'          // 新消息
- 'marked_read'          // 已标记已读
- 'user_typing'          // 用户正在输入
- 'user_stop_typing'     // 用户停止输入
- 'online'               // 用户上线
- 'offline'              // 用户下线
- 'error'                // 错误
```

## 统一响应格式

### 成功响应
```typescript
{
  success: true,
  message?: string,      // 可选的提示信息
  data?: any            // 返回的数据
}
```

### 错误响应
```typescript
{
  success: false,
  message: string,      // 错误信息
  error?: string        // 开发环境下的详细错误（可选）
}
```

### 分页响应
```typescript
{
  success: true,
  data: {
    items: any[],       // 数据列表
    pagination: {
      page: number,     // 当前页码
      limit: number,    // 每页数量
      total: number,    // 总数
      pages: number     // 总页数
    }
  }
}
```

## HTTP 状态码规范

| 状态码 | 含义 | 使用场景 |
|-------|------|---------|
| 200 | OK | 成功获取资源 |
| 201 | Created | 成功创建资源 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证或 Token 过期 |
| 403 | Forbidden | 权限不足 |
| 404 | Not Found | 资源不存在 |
| 500 | Internal Server Error | 服务器内部错误 |

## 认证机制

### JWT Token
```typescript
// 获取方式
POST /auth/wechat-login
Response: { token: string }

// 使用方式
Headers: {
  'Authorization': 'Bearer <token>'
}

// Token 有效期
默认：7 天（可配置）
```

### 权限级别
```typescript
- user: 普通用户
- merchant: 商家用户
- admin: 管理员（预留）
```

## 前端集成示例

### 基础使用
```typescript
import { wechatLogin, getCurrentUser, getCases } from '@/services/api';

// 登录
const { data } = await wechatLogin({ code: 'wx_code' });
setToken(data.token);

// 获取用户信息
const user = await getCurrentUser();

// 获取案例列表
const cases = await getCases({ page: 1, limit: 10 });
```

### WebSocket 使用
```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: getToken()
  }
});

socket.on('connected', (data) => {
  console.log('连接成功', data);
});

socket.emit('send_message', {
  conversationId: 'xxx',
  receiverId: 'yyy',
  content: '你好'
});

socket.on('new_message', (data) => {
  console.log('收到新消息', data);
});
```

## 验证检查清单

- [x] 所有前端 API 函数都有对应的后端路由
- [x] 请求/响应格式统一
- [x] 错误处理完整
- [x] 认证机制正确
- [x] 权限控制到位
- [x] 参数验证完善
- [x] WebSocket 事件定义清晰
- [x] 响应码使用规范

## 注意事项

1. **Token 管理**：前端需要在本地存储中保存 token，并在每次请求时自动添加到 Headers
2. **错误处理**：前端需要统一处理 401 错误，自动跳转到登录页
3. **超时设置**：建议设置 30 秒请求超时
4. **重试机制**：对于网络错误可以实现自动重试
5. **数据缓存**：可以使用 Redis 或本地缓存来提高性能
6. **文件上传**：注意文件大小限制和类型验证
7. **WebSocket**：需要实现断线重连机制

## API 文档访问

- **Swagger UI**：http://localhost:3000/api-docs
- **健康检查**：http://localhost:3000/api/v1/health
