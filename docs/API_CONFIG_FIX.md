# API 配置问题修复说明

## 问题描述

管理后台在开发环境下请求失败，原因是 API 配置存在以下问题：

1. **跨域问题**：前端 H5 开发服务器运行在 `http://localhost:10086`，后端 API 运行在 `http://localhost:3000`，直接请求会遇到跨域限制
2. **缺少代理配置**：H5 开发模式下没有配置 webpack-dev-server 代理
3. **环境变量缺失**：没有创建 `.env` 配置文件

## 解决方案

### 1. 添加 H5 开发服务器代理配置

**文件**: `config/dev.ts`

```typescript
export default {
  logger: {
    quiet: false,
    stats: true
  },
  mini: {},
  h5: {
    devServer: {
      port: 10086,
      host: 'localhost',
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          pathRewrite: {
            // 不需要重写路径，因为后端已经使用 /api/v1 作为基础路径
          }
        }
      }
    }
  }
}
```

**作用**：
- 将前端 `/api` 开头的请求代理到后端 `http://localhost:3000`
- `changeOrigin: true` 解决跨域问题
- 适用于 H5 开发模式

### 2. 创建环境变量配置文件

**文件**: `.env.development`（开发环境）

```env
# API 基础地址
# H5 开发模式下使用相对路径，会通过开发服务器代理到后端
# 小程序开发模式下需要使用完整地址
TARO_APP_API_URL=http://localhost:3000/api/v1
```

**文件**: `.env.production`（生产环境）

```env
# API 基础地址（请替换为实际的生产环境地址）
TARO_APP_API_URL=https://your-domain.com/api/v1
```

### 3. 优化 API 基础地址配置逻辑

**文件**: `src/services/request.ts`

```typescript
// API 基础地址配置
// H5 环境下：开发模式使用相对路径（通过代理），生产模式使用完整 URL
// 小程序环境下：始终使用完整 URL
const getBaseUrl = (): string => {
  const env = process.env.NODE_ENV;
  const isH5 = process.env.TARO_ENV === 'h5';

  // 优先使用环境变量配置
  if (process.env.TARO_APP_API_URL) {
    // H5 开发模式下，使用相对路径走代理
    if (isH5 && env === 'development') {
      return '/api/v1';
    }
    return process.env.TARO_APP_API_URL;
  }

  // 默认配置
  if (isH5) {
    // H5 开发模式使用相对路径（通过 webpack-dev-server 代理）
    if (env === 'development') {
      return '/api/v1';
    }
    // H5 生产模式需要配置实际域名
    return 'https://your-domain.com/api/v1';
  }

  // 小程序环境始终使用完整 URL
  return 'http://localhost:3000/api/v1';
};

const BASE_URL = getBaseUrl();
```

**逻辑说明**：
- **H5 开发模式**：使用相对路径 `/api/v1`，请求通过 webpack-dev-server 代理到后端
- **H5 生产模式**：使用完整域名（需在生产环境配置）
- **小程序模式**：始终使用完整 URL（小程序不支持相对路径请求）

## 技术原理

### 为什么 H5 需要代理？

1. **同源策略**：浏览器限制跨域请求
   - 前端：`http://localhost:10086`
   - 后端：`http://localhost:3000`
   - 不同端口视为跨域

2. **代理原理**：
   ```
   浏览器 → [/api/v1/cases] → webpack-dev-server (10086)
                                      ↓ (proxy)
                            后端 API (http://localhost:3000/api/v1/cases)
                                      ↓
                              返回数据
   ```

3. **优势**：
   - 开发环境无跨域问题
   - 前端代码使用相对路径，更简洁
   - 生产环境直接替换 BASE_URL 即可

### 为什么小程序不需要代理？

- 小程序不受浏览器同源策略限制
- 可以直接请求任何域名的 API（需在管理后台配置白名单）
- 必须使用完整 URL（不支持相对路径）

## 使用说明

### 开发环境启动步骤

1. **启动后端服务**：
   ```bash
   cd server
   npm install  # 首次需要安装依赖
   npm run dev  # 启动后端，运行在 http://localhost:3000
   ```

2. **启动前端 H5 开发服务器**：
   ```bash
   npm install  # 首次需要安装依赖
   npm run dev:h5  # 启动 H5 开发模式，运行在 http://localhost:10086
   ```

3. **访问应用**：
   - 打开浏览器访问 `http://localhost:10086`
   - API 请求会自动通过代理转发到后端

### 小程序开发模式

```bash
npm run dev:weapp  # 微信小程序
```

- 使用微信开发者工具导入 `/dist` 目录
- API 直接请求 `http://localhost:3000/api/v1`
- 需在微信开发者工具中勾选"不校验合法域名"

### 生产部署

1. **配置生产环境 API 地址**：
   - 编辑 `.env.production`
   - 修改 `TARO_APP_API_URL` 为实际生产域名

2. **构建生产版本**：
   ```bash
   npm run build:h5      # H5 版本
   npm run build:weapp   # 微信小程序
   ```

## 相关文件清单

| 文件 | 作用 | 修改内容 |
|------|------|----------|
| `config/dev.ts` | 开发环境配置 | 添加 H5 devServer 代理配置 |
| `.env.development` | 开发环境变量 | 新建，配置 API 地址 |
| `.env.production` | 生产环境变量 | 新建，配置生产 API 地址 |
| `src/services/request.ts` | API 请求封装 | 优化 BASE_URL 逻辑，根据平台和环境自动选择 |

## 测试验证

### H5 开发模式测试

1. 启动后端和前端服务
2. 打开浏览器控制台 → Network 标签
3. 访问管理后台页面
4. 查看请求：
   - 请求 URL 应为：`http://localhost:10086/api/v1/...`
   - 实际转发到：`http://localhost:3000/api/v1/...`
   - 状态码：200（成功）

### 小程序模式测试

1. 启动后端服务
2. 运行 `npm run dev:weapp`
3. 微信开发者工具 → 控制台 → Network
4. 查看请求：
   - 请求 URL 应为：`http://localhost:3000/api/v1/...`
   - 状态码：200（成功）

## 常见问题

### Q1: H5 开发模式下还是请求失败？

**检查清单**：
- [ ] 后端服务是否已启动（`http://localhost:3000`）
- [ ] 前端服务是否已启动（`http://localhost:10086`）
- [ ] 浏览器控制台是否有错误信息
- [ ] Network 标签中请求的实际 URL 是什么

### Q2: 小程序请求失败？

**检查清单**：
- [ ] 后端服务是否已启动
- [ ] 微信开发者工具是否勾选"不校验合法域名"
- [ ] 请求 URL 是否为完整地址（`http://localhost:3000/api/v1/...`）

### Q3: 生产环境部署后 API 请求失败？

**检查清单**：
- [ ] `.env.production` 中的 `TARO_APP_API_URL` 是否正确
- [ ] 后端服务器是否已部署并可访问
- [ ] 是否启用了 HTTPS（生产环境推荐）
- [ ] 小程序：是否在微信公众平台配置了服务器域名白名单

## 总结

通过以上修改：

✅ **解决了跨域问题**：H5 开发模式通过 webpack-dev-server 代理
✅ **统一了配置管理**：环境变量集中管理 API 地址
✅ **支持多平台**：H5 和小程序使用不同的请求策略
✅ **简化了开发**：开发者无需手动处理跨域

---

**最后更新**: 2025-11-22
**相关文档**:
- `/CLAUDE.md` - 完整的项目文档
- `/server/README.md` - 后端服务文档
- `/docs/INTEGRATION.md` - 集成指南
