# 装修小程序 API 接口文档

## 概述

本文档描述装修小程序后端 API 接口。

## 基础信息

- **Base URL**: `/api/v1`
- **请求格式**: JSON
- **响应格式**: JSON
- **字符编码**: UTF-8

## 通用响应格式

```json
{
  "success": true,
  "message": "操作成功",
  "data": {}
}
```

## 认证方式

需要认证的接口请在请求头中携带：
```
Authorization: Bearer {token}
```

---

## 1. 认证模块 `/auth`

### 1.1 微信登录
- **POST** `/auth/wechat-login`
- **参数**: `{ code, userInfo: { nickName, avatarUrl } }`

### 1.2 手机号登录
- **POST** `/auth/phone-login`
- **参数**: `{ phone, code }`

### 1.3 发送验证码
- **POST** `/auth/send-code`
- **参数**: `{ phone }`
- **限流**: 60秒/次

### 1.4 获取当前用户
- **GET** `/auth/me` 🔐
- **返回**: 用户信息

### 1.5 更新个人资料
- **PUT** `/auth/profile` 🔐
- **参数**: `{ nickname?, avatar?, phone? }`

---

## 2. 案例模块 `/cases`

### 2.1 获取案例列表
- **GET** `/cases`
- **查询参数**: `page, limit, style, roomType, minArea, maxArea, minPrice, maxPrice, search`

### 2.2 获取案例详情
- **GET** `/cases/:id`

### 2.3 搜索案例
- **GET** `/cases/search`
- **查询参数**: `keyword, page, limit`

### 2.4 获取热门案例
- **GET** `/cases/hot`

### 2.5 创建案例 (商家)
- **POST** `/cases` 🔐🏪
- **参数**: `{ title, description, images, style, roomType, area, price, designer, tags }`

### 2.6 更新案例 (商家)
- **PUT** `/cases/:id` 🔐🏪

### 2.7 删除案例 (商家)
- **DELETE** `/cases/:id` 🔐🏪

---

## 3. 日记模块 `/diaries`

### 3.1 获取我的日记
- **GET** `/diaries/my` 🔐
- **查询参数**: `page, limit`

### 3.2 获取日记详情
- **GET** `/diaries/:id` 🔐

### 3.3 创建日记
- **POST** `/diaries` 🔐
- **参数**: `{ title, content, images, stage, isPublic }`

### 3.4 更新日记
- **PUT** `/diaries/:id` 🔐

### 3.5 删除日记
- **DELETE** `/diaries/:id` 🔐

### 3.6 获取日记统计
- **GET** `/diaries/stats` 🔐

---

## 4. 收藏模块 `/favorites`

### 4.1 获取收藏列表
- **GET** `/favorites` 🔐
- **查询参数**: `targetType, page, limit`

### 4.2 添加收藏
- **POST** `/favorites` 🔐
- **参数**: `{ targetType: 'case'|'designer', targetId }`

### 4.3 取消收藏
- **DELETE** `/favorites/:targetType/:targetId` 🔐

### 4.4 检查是否收藏
- **GET** `/favorites/check/:targetType/:targetId` 🔐

---

## 5. 推荐模块 `/recommend`

### 5.1 推荐案例
- **GET** `/recommend/cases`

### 5.2 推荐设计师
- **GET** `/recommend/designers`

### 5.3 相似案例
- **GET** `/recommend/similar/:caseId`

---

## 6. 上传模块 `/upload`

### 6.1 上传图片
- **POST** `/upload/image` 🔐
- **Content-Type**: `multipart/form-data`
- **字段**: `image` (文件)
- **返回**: `{ url }`

---

## 7. 商家模块 `/merchants`

### 7.1 申请成为商家
- **POST** `/merchants/apply` 🔐
- **参数**: `{ companyName, businessLicense, contactPerson, contactPhone, address, description }`

### 7.2 获取我的商家信息
- **GET** `/merchants/my` 🔐🏪

### 7.3 更新商家信息
- **PUT** `/merchants/my` 🔐🏪

### 7.4 添加设计师
- **POST** `/merchants/designers` 🔐🏪
- **参数**: `{ name, avatar, title, experience, specialties, introduction }`

### 7.5 获取设计师列表
- **GET** `/merchants/designers` 🔐🏪

### 7.6 更新设计师
- **PUT** `/merchants/designers/:id` 🔐🏪

### 7.7 删除设计师
- **DELETE** `/merchants/designers/:id` 🔐🏪

---

## 8. 聊天模块 `/chat`

### 8.1 获取会话列表
- **GET** `/chat/conversations` 🔐

### 8.2 获取会话详情
- **GET** `/chat/conversations/:id` 🔐

### 8.3 创建会话
- **POST** `/chat/conversations` 🔐
- **参数**: `{ receiverId, caseId?, designerId? }`

### 8.4 删除会话
- **DELETE** `/chat/conversations/:id` 🔐

### 8.5 获取消息历史
- **GET** `/chat/conversations/:conversationId/messages` 🔐
- **查询参数**: `page, limit`

### 8.6 发送消息
- **POST** `/chat/conversations/:conversationId/messages` 🔐
- **参数**: `{ content, type?: 'text'|'image'|'file', mediaUrl? }`

### 8.7 标记已读
- **PUT** `/chat/conversations/:conversationId/read` 🔐

### 8.8 获取未读数量
- **GET** `/chat/unread-count` 🔐

---

## 9. 订单模块 `/orders`

### 9.1 创建订单
- **POST** `/orders` 🔐
- **参数**:
```json
{
  "merchant": "商家ID",
  "designer": "设计师ID (可选)",
  "case": "案例ID (可选)",
  "projectName": "项目名称",
  "projectAddress": "项目地址",
  "projectArea": 120,
  "projectStyle": "现代简约",
  "projectRooms": "三室两厅",
  "items": [
    { "name": "项目名", "quantity": 1, "unit": "项", "unitPrice": 1000, "totalPrice": 1000 }
  ],
  "contactName": "联系人",
  "contactPhone": "联系电话"
}
```

### 9.2 获取我的订单
- **GET** `/orders/my` 🔐
- **查询参数**: `page, limit, status`

### 9.3 获取订单详情
- **GET** `/orders/:id` 🔐

### 9.4 取消订单
- **POST** `/orders/:id/cancel` 🔐
- **参数**: `{ reason? }`

### 9.5 商家：获取订单列表
- **GET** `/orders/merchant/list` 🔐🏪
- **查询参数**: `page, limit, status, paymentStatus`

### 9.6 商家：更新订单状态
- **PUT** `/orders/:id/status` 🔐🏪
- **参数**: `{ status: 'confirmed'|'designing'|'constructing'|'completed', merchantNote? }`

### 9.7 商家：添加支付记录
- **POST** `/orders/:id/payment` 🔐🏪
- **参数**: `{ amount, method: 'wechat'|'alipay'|'bank'|'cash', transactionId?, note? }`

### 9.8 商家：获取订单统计
- **GET** `/orders/merchant/stats` 🔐🏪

---

## 10. 评价模块 `/reviews`

### 10.1 获取评价列表 (公开)
- **GET** `/reviews/:targetType/:targetId`
- **查询参数**: `page, limit, sort: 'newest'|'oldest'|'highest'|'lowest'|'popular'`

### 10.2 创建评价
- **POST** `/reviews` 🔐
- **参数**: `{ targetType: 'case'|'merchant'|'order', targetId, orderId?, rating: 1-5, content, images?, tags?, isAnonymous? }`

### 10.3 获取我的评价
- **GET** `/reviews/my/list` 🔐

### 10.4 点赞评价
- **POST** `/reviews/:id/like` 🔐

### 10.5 删除评价
- **DELETE** `/reviews/:id` 🔐

### 10.6 商家回复评价
- **POST** `/reviews/:id/reply` 🔐🏪
- **参数**: `{ content }`

---

## 11. 预约模块 `/appointments`

### 11.1 获取可用时间槽 (公开)
- **GET** `/appointments/slots`
- **查询参数**: `merchantId, date`

### 11.2 创建预约
- **POST** `/appointments` 🔐
- **参数**:
```json
{
  "merchantId": "商家ID",
  "designerId": "设计师ID (可选)",
  "type": "consultation|site_visit|design_review|construction_check",
  "date": "2024-01-20",
  "timeSlot": "09:00-10:00",
  "contactName": "联系人",
  "contactPhone": "联系电话",
  "address": "地址 (可选)",
  "projectArea": 120,
  "projectStyle": "现代简约",
  "note": "备注"
}
```

### 11.3 获取我的预约
- **GET** `/appointments/my` 🔐
- **查询参数**: `page, limit, status`

### 11.4 获取预约详情
- **GET** `/appointments/:id` 🔐

### 11.5 取消预约
- **POST** `/appointments/:id/cancel` 🔐
- **参数**: `{ reason? }`

### 11.6 商家：获取预约列表
- **GET** `/appointments/merchant/list` 🔐🏪
- **查询参数**: `page, limit, status, date`

### 11.7 商家：更新预约状态
- **PUT** `/appointments/:id/status` 🔐🏪
- **参数**: `{ status: 'confirmed'|'cancelled'|'completed'|'no_show', merchantNote? }`

---

## 12. 管理后台 `/admin` 🔐👮

### 12.1 获取仪表盘统计
- **GET** `/admin/stats/dashboard`

### 12.2 用户管理
- **GET** `/admin/users` - 获取用户列表
- **PUT** `/admin/users/:id` - 更新用户状态

### 12.3 商家管理
- **GET** `/admin/merchants` - 获取商家列表
- **PUT** `/admin/merchants/:id/approve` - 审核商家

### 12.4 订单管理
- **GET** `/admin/orders` - 获取所有订单

### 12.5 案例管理
- **PUT** `/admin/cases/:id/status` - 更新案例状态

---

## 图例

- 🔐 需要登录认证
- 🏪 需要商家权限
- 👮 需要管理员权限

---

## 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器错误 |

---

## 订单状态流转

```
pending → confirmed → designing → constructing → completed
    ↓         ↓           ↓            ↓
 cancelled cancelled  cancelled   cancelled
```

## 预约类型说明

| 类型 | 说明 |
|------|------|
| consultation | 咨询 |
| site_visit | 量房 |
| design_review | 设计评审 |
| construction_check | 工程检查 |

## 预约状态说明

| 状态 | 说明 |
|------|------|
| pending | 待确认 |
| confirmed | 已确认 |
| cancelled | 已取消 |
| completed | 已完成 |
| no_show | 未到场 |
