# 装修小程序 API 接口文档

## 概述

本文档描述装修小程序后端需要实现的 API 接口。

## 基础信息

- **Base URL**: `https://api.yourdomain.com/api/v1`
- **请求格式**: JSON
- **响应格式**: JSON
- **字符编码**: UTF-8

## 通用响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 状态码，200 表示成功 |
| message | string | 响应消息 |
| data | object | 响应数据 |

## 常见状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

---

## 1. 用户认证

### 1.1 微信小程序登录

**接口说明**: 用户使用微信小程序登录

**请求方式**: `POST /auth/wechat-login`

**请求参数**:

```json
{
  "code": "021Abc123def",
  "userInfo": {
    "nickName": "张三",
    "avatarUrl": "https://example.com/avatar.jpg"
  }
}
```

**参数说明**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | 微信登录凭证 |
| userInfo | object | 是 | 用户信息 |
| userInfo.nickName | string | 是 | 用户昵称 |
| userInfo.avatarUrl | string | 是 | 用户头像 |

**响应示例**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": "123456",
      "nickname": "张三",
      "avatar": "https://example.com/avatar.jpg",
      "phone": "",
      "isLogin": true
    }
  }
}
```

**后端处理流程**:

1. 使用 `code` 调用微信接口获取 `openid` 和 `session_key`
   ```
   GET https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=CODE&grant_type=authorization_code
   ```

2. 根据 `openid` 查询用户是否存在
   - 如果存在：更新用户信息，生成 token
   - 如果不存在：创建新用户，生成 token

3. 返回 token 和用户信息

### 1.2 手机号登录

**接口说明**: 用户使用手机号和验证码登录

**请求方式**: `POST /auth/phone-login`

**请求参数**:

```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

**参数说明**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 是 | 手机号 |
| code | string | 是 | 验证码 |

**响应示例**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": "123456",
      "nickname": "用户8000",
      "avatar": "https://example.com/default-avatar.jpg",
      "phone": "13800138000",
      "isLogin": true
    }
  }
}
```

### 1.3 发送验证码

**接口说明**: 发送手机验证码

**请求方式**: `POST /auth/send-code`

**请求参数**:

```json
{
  "phone": "13800138000"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "验证码已发送",
  "data": {
    "expire": 300
  }
}
```

### 1.4 获取用户信息

**接口说明**: 获取当前登录用户信息

**请求方式**: `GET /user/info`

**请求头**:

```
Authorization: Bearer {token}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "123456",
    "nickname": "张三",
    "avatar": "https://example.com/avatar.jpg",
    "phone": "13800138000",
    "isLogin": true
  }
}
```

---

## 2. 案例管理

### 2.1 获取案例列表

**接口说明**: 获取装修案例列表

**请求方式**: `GET /cases`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 10 |
| style | string | 否 | 风格筛选：modern, nordic, chinese, luxury 等 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "list": [
      {
        "id": 1,
        "title": "现代简约 · 三居室",
        "image": "https://example.com/case1.jpg",
        "style": "现代简约",
        "area": "120㎡",
        "price": "15万",
        "designer": "张设计师"
      }
    ]
  }
}
```

### 2.2 获取案例详情

**接口说明**: 获取装修案例详细信息

**请求方式**: `GET /cases/:id`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 案例 ID |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "title": "现代简约 · 三居室",
    "style": "现代简约",
    "area": "120㎡",
    "price": "15万",
    "images": [
      "https://example.com/case1-1.jpg",
      "https://example.com/case1-2.jpg"
    ],
    "description": "本案例采用现代简约风格...",
    "tags": ["简约", "舒适", "温馨"],
    "designer": {
      "id": "1",
      "name": "张设计师",
      "avatar": "https://example.com/designer1.jpg",
      "title": "首席设计师 · 10年经验"
    },
    "specs": [
      { "label": "户型", "value": "三室两厅一卫" },
      { "label": "面积", "value": "120㎡" }
    ]
  }
}
```

---

## 3. 设计师管理

### 3.1 获取设计师列表

**接口说明**: 获取设计师列表

**请求方式**: `GET /designers`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 10 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "page": 1,
    "pageSize": 10,
    "list": [
      {
        "id": "1",
        "name": "张设计师",
        "avatar": "https://example.com/designer1.jpg",
        "title": "首席设计师",
        "experience": "10年经验",
        "caseCount": 156,
        "styles": ["现代简约", "北欧风"],
        "rating": 4.9
      }
    ]
  }
}
```

---

## 4. 收藏管理

### 4.1 收藏案例

**接口说明**: 收藏装修案例

**请求方式**: `POST /favorites`

**请求头**:

```
Authorization: Bearer {token}
```

**请求参数**:

```json
{
  "caseId": 1
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "收藏成功",
  "data": {}
}
```

### 4.2 取消收藏

**接口说明**: 取消收藏案例

**请求方式**: `DELETE /favorites/:caseId`

**请求头**:

```
Authorization: Bearer {token}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "已取消收藏",
  "data": {}
}
```

---

## 5. 预约管理

### 5.1 预约设计师

**接口说明**: 预约设计师咨询

**请求方式**: `POST /appointments`

**请求头**:

```
Authorization: Bearer {token}
```

**请求参数**:

```json
{
  "designerId": "1",
  "phone": "13800138000",
  "appointmentTime": "2024-01-15 14:00:00",
  "message": "想咨询现代简约风格装修"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "预约成功",
  "data": {
    "id": "123",
    "status": "pending"
  }
}
```

---

## 注意事项

1. **Token 认证**: 需要登录的接口，请在请求头中携带 `Authorization: Bearer {token}`

2. **微信登录**:
   - AppID 和 AppSecret 需要在微信小程序后台获取
   - code 有效期为 5 分钟，使用一次后失效
   - 需要配置服务器域名白名单

3. **验证码**:
   - 验证码有效期建议 5 分钟
   - 同一手机号 1 分钟内只能发送一次
   - 建议接入第三方短信服务（阿里云、腾讯云等）

4. **安全性**:
   - 所有接口建议使用 HTTPS
   - 敏感数据需要加密传输
   - 实施接口限流和防刷策略

## 相关资源

- [微信小程序登录文档](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html)
- [微信小程序授权文档](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/authorize.html)
