# 商家相关 API 接口文档

## 概述

本文档描述装修小程序商家模块相关的 API 接口。

---

## 6. 商家管理

### 6.1 提交商家申请

**接口说明**: 提交商家入驻申请

**请求方式**: `POST /merchant/apply`

**请求头**:

```
Authorization: Bearer {token}
```

**请求参数**:

```json
{
  "type": "company",
  "companyName": "某某装修公司",
  "contactName": "张三",
  "contactPhone": "13800138000",
  "businessLicense": "https://example.com/license.jpg",
  "address": "北京市朝阳区某某大厦",
  "description": "专注高端家装20年",
  "serviceArea": ["朝阳区", "海淀区"]
}
```

**参数说明**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 商家类型：company-装修公司, designer-独立设计师, material-材料商, worker-施工队 |
| companyName | string | 是 | 公司/个人名称 |
| contactName | string | 是 | 联系人姓名 |
| contactPhone | string | 是 | 联系电话 |
| businessLicense | string | 是 | 营业执照图片URL |
| address | string | 是 | 公司地址 |
| description | string | 否 | 公司简介 |
| serviceArea | array | 是 | 服务区域数组 |

**响应示例**:

```json
{
  "code": 200,
  "message": "提交成功，等待审核",
  "data": {
    "id": "123456",
    "status": "pending"
  }
}
```

### 6.2 获取商家信息

**接口说明**: 获取当前用户的商家信息

**请求方式**: `GET /merchant/info`

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
    "userId": "789",
    "type": "company",
    "status": "approved",
    "companyName": "某某装修公司",
    "contactName": "张三",
    "contactPhone": "13800138000",
    "businessLicense": "https://example.com/license.jpg",
    "address": "北京市朝阳区某某大厦",
    "description": "专注高端家装20年",
    "serviceArea": ["朝阳区", "海淀区"],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z"
  }
}
```

**商家状态说明**:

| 状态值 | 说明 |
|--------|------|
| pending | 审核中 |
| approved | 已通过 |
| rejected | 已拒绝 |
| none | 未申请 |

### 6.3 更新商家信息

**接口说明**: 更新商家信息（仅审核通过的商家可以更新）

**请求方式**: `PUT /merchant/info`

**请求头**:

```
Authorization: Bearer {token}
```

**请求参数**:

```json
{
  "contactName": "李四",
  "contactPhone": "13900139000",
  "address": "北京市海淀区某某大厦",
  "description": "更新后的公司简介",
  "serviceArea": ["朝阳区", "海淀区", "丰台区"]
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": {}
}
```

### 6.4 上传营业执照

**接口说明**: 上传营业执照图片

**请求方式**: `POST /merchant/upload-license`

**请求头**:

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | file | 是 | 图片文件（jpg/png，最大5MB） |

**响应示例**:

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://example.com/uploads/license-123456.jpg"
  }
}
```

### 6.5 商家案例管理

#### 6.5.1 获取商家案例列表

**接口说明**: 获取商家发布的案例列表

**请求方式**: `GET /merchant/cases`

**请求头**:

```
Authorization: Bearer {token}
```

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 10 |
| status | string | 否 | 状态筛选：published-已发布, draft-草稿 |

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
        "id": 1,
        "title": "现代简约 · 三居室",
        "image": "https://example.com/case1.jpg",
        "status": "published",
        "views": 1286,
        "likes": 89,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### 6.5.2 创建案例

**接口说明**: 商家发布新案例

**请求方式**: `POST /merchant/cases`

**请求头**:

```
Authorization: Bearer {token}
```

**请求参数**:

```json
{
  "title": "现代简约 · 三居室",
  "style": "现代简约",
  "area": "120㎡",
  "price": "15万",
  "images": [
    "https://example.com/case1-1.jpg",
    "https://example.com/case1-2.jpg"
  ],
  "description": "本案例采用现代简约风格...",
  "tags": ["简约", "舒适"],
  "status": "published"
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "发布成功",
  "data": {
    "id": 123,
    "status": "published"
  }
}
```

### 6.6 商家订单管理

#### 6.6.1 获取商家订单列表

**接口说明**: 获取商家的订单列表

**请求方式**: `GET /merchant/orders`

**请求头**:

```
Authorization: Bearer {token}
```

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 10 |
| status | string | 否 | 状态筛选：pending, confirmed, completed, cancelled |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 89,
    "page": 1,
    "pageSize": 10,
    "list": [
      {
        "id": "ORD123456",
        "userId": "789",
        "userName": "张三",
        "userPhone": "13800138000",
        "caseId": 1,
        "caseTitle": "现代简约 · 三居室",
        "amount": 150000,
        "status": "pending",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### 6.7 商家咨询管理

#### 6.7.1 获取咨询列表

**接口说明**: 获取用户咨询列表

**请求方式**: `GET /merchant/inquiries`

**请求头**:

```
Authorization: Bearer {token}
```

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 10 |
| replied | boolean | 否 | 是否已回复 |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 25,
    "unreadCount": 5,
    "list": [
      {
        "id": "INQ123456",
        "userId": "789",
        "userName": "张三",
        "userPhone": "13800138000",
        "message": "想咨询现代简约风格装修",
        "replied": false,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### 6.7.2 回复咨询

**接口说明**: 商家回复用户咨询

**请求方式**: `POST /merchant/inquiries/:id/reply`

**请求头**:

```
Authorization: Bearer {token}
```

**请求参数**:

```json
{
  "reply": "您好，我们非常擅长现代简约风格..."
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "回复成功",
  "data": {}
}
```

### 6.8 商家数据统计

**接口说明**: 获取商家数据统计

**请求方式**: `GET /merchant/statistics`

**请求头**:

```
Authorization: Bearer {token}
```

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | string | 否 | 开始日期 YYYY-MM-DD |
| endDate | string | 否 | 结束日期 YYYY-MM-DD |

**响应示例**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "overview": {
      "caseCount": 156,
      "orderCount": 89,
      "rating": 4.8,
      "viewCount": 12860
    },
    "orders": {
      "pending": 5,
      "confirmed": 10,
      "completed": 70,
      "cancelled": 4
    },
    "revenue": {
      "total": 1350000,
      "thisMonth": 150000,
      "lastMonth": 120000
    },
    "trend": [
      {
        "date": "2024-01-01",
        "orders": 3,
        "revenue": 45000,
        "views": 320
      }
    ]
  }
}
```

---

## 商家审核流程

### 审核状态流转

```
用户提交申请 (pending)
    ↓
平台审核
    ↓
    ├─→ 审核通过 (approved)
    │      ↓
    │   开通商家功能
    │      ↓
    │   可以发布案例、管理订单等
    │
    └─→ 审核拒绝 (rejected)
           ↓
        用户可重新申请
```

### 审核时间

- 工作日提交：1-3个工作日内审核
- 节假日提交：顺延至下一个工作日

### 审核标准

1. **营业执照**：清晰可见，有效期内
2. **联系信息**：真实有效，可以联系
3. **服务区域**：合理，不能过大
4. **公司简介**：真实，无虚假宣传

---

## 商家权限说明

### 未认证商家（pending/rejected）

- ❌ 不能发布案例
- ❌ 不能接收订单
- ❌ 不能回复咨询
- ✅ 可以查看申请状态
- ✅ 可以修改申请信息

### 已认证商家（approved）

- ✅ 可以发布案例
- ✅ 可以接收和管理订单
- ✅ 可以回复咨询
- ✅ 可以查看数据统计
- ✅ 可以修改商家信息
- ✅ 可以管理预约

---

## 相关字段说明

### 商家类型 (type)

| 值 | 说明 | 需要资质 |
|----|------|----------|
| company | 装修公司 | 营业执照 |
| designer | 独立设计师 | 设计师资格证 |
| material | 材料商 | 营业执照 |
| worker | 施工队 | 施工资质证 |

### 商家状态 (status)

| 值 | 说明 | 可操作 |
|----|------|--------|
| none | 未申请 | 可以申请 |
| pending | 审核中 | 只能查看 |
| approved | 已通过 | 全部功能 |
| rejected | 已拒绝 | 可重新申请 |

---

## 注意事项

1. **商家认证**：
   - 必须先登录才能申请
   - 一个用户只能申请一个商家账号
   - 申请信息需真实有效

2. **资质审核**：
   - 营业执照必须清晰可见
   - 经营范围需包含装修相关业务
   - 联系信息需可验证

3. **安全性**：
   - 所有商家接口需要 token 认证
   - 敏感操作需要二次验证
   - 定期审查商家资质

4. **数据保护**：
   - 用户隐私信息加密存储
   - 商家不能批量导出用户信息
   - 遵守数据保护法规

---

## 相关文档

- [API 接口文档](./API.md)
- [微信登录实现指南](./WECHAT_LOGIN.md)
