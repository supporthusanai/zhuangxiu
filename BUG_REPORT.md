# Bug 报告 - 装修小程序

**检查日期**: 2025-11-22
**检查范围**: 前端代码、后端代码、配置文件、API 对接、安全性
**项目版本**: Latest (branch: claude/claude-md-mi9pyunnxawokt63-01HCtUhvp17h4e2Qc4bybQWL)

---

## 🔴 严重问题 (Critical)

### 1. User 模型中 comparePassword 方法引用不存在的字段

**位置**: `/server/src/models/User.ts:80`

**问题描述**:
```typescript
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password); // ❌ password 字段不存在
};
```

**影响**:
- 如果调用此方法会导致运行时错误
- TypeScript 不会检测到此问题，因为使用了 `this` 访问

**原因**:
- User Schema 中没有定义 `password` 字段
- 当前项目使用微信登录和手机验证码登录，不需要密码
- 此方法可能是预留的，但实现不完整

**建议修复**:
```typescript
// 选项 1: 删除此方法（推荐）
// 如果不需要密码登录功能，直接删除第 76-81 行

// 选项 2: 添加 password 字段（如果需要密码登录）
const UserSchema = new Schema<IUser>({
  // ... 其他字段
  password: {
    type: String,
    select: false, // 默认查询不返回密码
  },
});

// 并在保存时添加密码加密
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});
```

**优先级**: 🔴 高 - 会导致运行时崩溃（如果被调用）

---

## 🟡 中等问题 (Medium)

### 2. GET 请求参数传递方式可能不兼容

**位置**: `/src/services/request.ts:159-160`

**问题描述**:
```typescript
export const get = <T = any>(url: string, data?: any, needAuth = false): Promise<Response<T>> => {
  return request<T>({ url, method: 'GET', data, needAuth });
};
```

在 `request` 函数中（第 88 行），GET 请求的 `data` 字段直接传递给 `Taro.request`:
```typescript
const res = await Taro.request({
  url: fullUrl,
  method,
  data,  // ⚠️ GET 请求应使用查询参数
  // ...
});
```

**影响**:
- 微信小程序的 `Taro.request` 在 GET 请求中，`data` 会被自动转换为查询字符串，通常能正常工作
- 但在某些情况下可能会有兼容性问题
- 不符合 HTTP 标准最佳实践

**建议修复**:
```typescript
// 在 request 函数中区分 GET 和其他方法
const requestData = method === 'GET' ? undefined : data;
const requestParams = method === 'GET' ? data : undefined;

const res = await Taro.request({
  url: fullUrl,
  method,
  data: requestData,
  params: requestParams,  // Taro 3.x+ 支持 params
  // 或者手动拼接查询字符串到 URL
});
```

**优先级**: 🟡 中 - 功能可能受影响

---

### 3. 内存泄漏风险 - 未清理的定时器

**位置**: `/src/pages/login/index.tsx:43-49`

**问题描述**:
```typescript
const handleSendCode = () => {
  // ...
  const timer = setInterval(() => {
    count--
    setCountdown(count)
    if (count <= 0) {
      clearInterval(timer)
    }
  }, 1000)  // ❌ timer 可能在组件卸载时未清理
}
```

**影响**:
- 如果用户在倒计时过程中离开登录页面，定时器会继续运行
- 造成内存泄漏和不必要的性能消耗
- `setState` 在组件卸载后被调用会触发 React 警告

**建议修复**:
```typescript
import { useRef, useEffect } from 'react'

export default function Login() {
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleSendCode = () => {
    // ... 验证逻辑

    let count = 60
    setCountdown(count)
    timerRef.current = setInterval(() => {
      count--
      setCountdown(count)
      if (count <= 0 && timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }, 1000)
  }

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // ...
}
```

**优先级**: 🟡 中 - 影响性能和用户体验

---

### 4. JWT Secret 使用不安全的默认值

**位置**:
- `/server/src/middleware/auth.ts:31`
- `/server/src/controllers/authController.ts:10`
- `/server/src/config/socket.ts:26`

**问题描述**:
```typescript
const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
```

**影响**:
- 如果环境变量 `JWT_SECRET` 未设置，会使用 'secret' 作为密钥
- 在生产环境中极度不安全，任何人都可以伪造 token
- 可能导致身份验证被绕过

**建议修复**:
```typescript
// 在应用启动时检查必需的环境变量
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-secret-key-here') {
  logger.error('❌ JWT_SECRET 未设置或使用默认值，服务器拒绝启动');
  process.exit(1);
}

// 在使用时不提供默认值
const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
```

或在 `/server/src/index.ts` 的启动函数中添加：
```typescript
const startServer = async (): Promise<void> => {
  // 环境变量验证
  const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI', 'WECHAT_APP_ID', 'WECHAT_APP_SECRET'];
  const missingVars = requiredEnvVars.filter(v => !process.env[v] || process.env[v] === 'your-secret-key-here' || process.env[v] === 'your-app-id');

  if (missingVars.length > 0) {
    logger.error(`❌ 缺少必需的环境变量: ${missingVars.join(', ')}`);
    process.exit(1);
  }

  // ... 其余启动逻辑
}
```

**优先级**: 🟡 中 - 安全风险

---

## 🟢 轻微问题 (Minor)

### 5. 前端代码中存在大量 console.log

**位置**: 前端代码中共 40 处

**问题描述**:
```
src/app.tsx:1
src/services/request.ts:4
src/utils/recommendation.ts:9
src/utils/user.ts:7
src/utils/favorite.ts:7
src/utils/merchant.ts:3
src/pages/search/index.tsx:3
src/pages/diary/index.tsx:2
src/pages/diary-edit/index.tsx:2
src/pages/login/index.tsx:2
```

**影响**:
- 在生产环境中暴露敏感信息
- 增加包大小
- 可能影响性能

**建议修复**:
```typescript
// 选项 1: 创建条件日志工具
// /src/utils/logger.ts
export const logger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
  },
};

// 替换所有 console.log 为 logger.log

// 选项 2: 使用 babel 插件在生产构建时自动移除
// 安装 babel-plugin-transform-remove-console
```

**优先级**: 🟢 低 - 可选优化

---

### 6. 路由顺序潜在冲突（虽然当前正确）

**位置**: `/server/src/routes/caseRoutes.ts:16-19`

**问题描述**:
```typescript
router.get('/', optionalAuth, getCases);       // ✅
router.get('/hot', getHotCases);               // ✅
router.get('/search', searchCases);            // ✅
router.get('/:id', optionalAuth, getCaseById); // ⚠️ 应该在最后
```

**影响**:
- 当前顺序是正确的，`/search` 和 `/hot` 在 `/:id` 之前
- 但容易被误改导致 bug（例如有人重新排序路由）

**建议改进**:
```typescript
// 选项 1: 使用更明确的路径
router.get('/detail/:id', optionalAuth, getCaseById);

// 选项 2: 添加注释警告
// ⚠️ 注意：动态路由 /:id 必须放在最后，否则会拦截 /hot 和 /search
router.get('/:id', optionalAuth, getCaseById);

// 选项 3: 使用路由分组
const specificRoutes = express.Router();
specificRoutes.get('/hot', getHotCases);
specificRoutes.get('/search', searchCases);

const dynamicRoutes = express.Router();
dynamicRoutes.get('/:id', optionalAuth, getCaseById);

router.use('/', specificRoutes);
router.use('/', dynamicRoutes);
```

**优先级**: 🟢 低 - 预防性改进

---

### 7. TypeScript any 类型使用过多

**位置**: 多处

**示例**:
```typescript
// /src/services/api.ts:69
export const createCase = (data: any) => {  // ❌ 应该有明确的类型
  return post('/cases', data, true);
};

// /src/services/api.ts:192
export const updateMerchant = (data: any) => {
  return put('/merchants/me', data, true);
};
```

**影响**:
- 失去 TypeScript 的类型检查优势
- 容易传递错误的参数
- IDE 自动补全功能失效

**建议修复**:
```typescript
// 定义类型接口
interface CreateCaseData {
  title: string;
  style: string;
  area: number;
  price: number;
  images: string[];
  description: string;
  tags?: string[];
  rooms: string;
  floor?: string;
  district?: string;
  designer: string;
}

export const createCase = (data: CreateCaseData) => {
  return post('/cases', data, true);
};
```

**优先级**: 🟢 低 - 代码质量改进

---

## 📋 潜在改进建议

### 8. 缺少请求重试机制

**建议**: 在 `/src/services/request.ts` 中为关键请求添加自动重试：

```typescript
async function requestWithRetry<T>(
  config: RequestConfig,
  retries = 3
): Promise<Response<T>> {
  for (let i = 0; i < retries; i++) {
    try {
      return await request<T>(config);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

### 9. 缺少 API 响应缓存

**建议**: 为不常变化的数据（如案例列表、设计师列表）添加缓存：

```typescript
// /src/utils/cache.ts
const cache = new Map<string, { data: any; timestamp: number }>();

export function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 5 * 60 * 1000  // 5分钟
): Promise<T> {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return Promise.resolve(cached.data);
  }

  return fetcher().then(data => {
    cache.set(key, { data, timestamp: Date.now() });
    return data;
  });
}
```

---

### 10. 图片上传缺少进度显示

**建议**: 在 `/src/services/request.ts:179` 的 uploadFile 函数中添加进度回调：

```typescript
export const uploadFile = async (
  filePath: string,
  needAuth = true,
  onProgress?: (progress: number) => void
): Promise<Response> => {
  // ...
  const uploadTask = Taro.uploadFile({
    url: `${BASE_URL}/upload/image`,
    filePath,
    name: 'image',
    header: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (onProgress) {
    uploadTask.progress((res) => {
      onProgress(res.progress);
    });
  }

  const res = await uploadTask;
  // ...
}
```

---

## 🎯 优先级总结

### 立即修复（1-2天内）
1. ✅ User 模型 comparePassword 方法问题 - **删除或完善**
2. ✅ 内存泄漏 - 登录页定时器清理
3. ✅ JWT Secret 验证 - 添加启动时环境变量检查

### 短期修复（1周内）
4. ✅ GET 请求参数传递优化
5. ✅ console.log 替换为条件日志

### 中期改进（2-4周内）
6. ✅ TypeScript any 类型替换为具体类型
7. ✅ 添加请求重试机制
8. ✅ 添加 API 响应缓存

### 长期优化（可选）
9. ✅ 路由顺序优化和注释
10. ✅ 图片上传进度显示

---

## 📊 代码质量评分

| 维度 | 评分 | 说明 |
|------|------|------|
| 架构设计 | ⭐⭐⭐⭐⭐ | 清晰的前后端分离，MVC 模式 |
| 类型安全 | ⭐⭐⭐☆☆ | 使用 TypeScript 但 any 过多 |
| 错误处理 | ⭐⭐⭐⭐☆ | 统一的错误处理，但缺少重试 |
| 安全性 | ⭐⭐⭐☆☆ | 基础安全措施，但 JWT 默认值有风险 |
| 性能优化 | ⭐⭐⭐☆☆ | 有索引和压缩，缺少缓存 |
| 代码规范 | ⭐⭐⭐⭐☆ | 后端使用 logger，前端有改进空间 |
| 内存管理 | ⭐⭐⭐☆☆ | 存在定时器泄漏风险 |

**总体评分**: ⭐⭐⭐⭐☆ (4/5) - **良好**

---

## 🔧 快速修复脚本

以下问题可以批量修复：

### 删除 User.ts 中的 comparePassword 方法
```bash
# 编辑 /server/src/models/User.ts
# 删除 76-81 行
```

### 添加环境变量验证
在 `/server/src/index.ts` 的 `startServer` 函数开头添加验证逻辑。

### 修复登录页定时器
在 `/src/pages/login/index.tsx` 中添加 useEffect 清理逻辑。

---

**报告生成时间**: 2025-11-22
**检查工具**: 人工代码审查 + 静态分析
**下一次检查建议**: 修复完成后 1 周
