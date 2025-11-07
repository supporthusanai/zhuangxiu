# 微信小程序登录实现指南

## 登录流程说明

### 前端流程

```
┌─────────────┐
│  用户点击   │
│"微信登录"   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ 1. 调用 wx.login()          │
│    获取临时登录凭证 code     │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ 2. 调用 wx.getUserProfile() │
│    获取用户信息              │
│    (昵称、头像等)            │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ 3. 将 code + userInfo       │
│    发送到后端服务器          │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ 4. 接收后端返回的           │
│    token 和用户信息          │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ 5. 保存到本地存储           │
│    并跳转到首页              │
└─────────────────────────────┘
```

### 后端流程

```
┌─────────────────────────────┐
│ 1. 接收前端传来的 code      │
│    和 userInfo               │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ 2. 使用 code 调用微信接口               │
│    https://api.weixin.qq.com/           │
│    sns/jscode2session                   │
│    获取 openid 和 session_key           │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ 3. 根据 openid 查询数据库   │
│    - 存在：更新用户信息      │
│    - 不存在：创建新用户      │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ 4. 生成自定义登录态 token   │
│    (JWT、Session 等)         │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ 5. 返回 token 和用户信息    │
│    给前端                    │
└─────────────────────────────┘
```

---

## 代码实现

### 前端代码（已实现）

#### 1. 工具函数 (`src/utils/user.ts`)

```typescript
/**
 * 完整的微信登录流程
 */
export const wechatLoginComplete = async (): Promise<UserInfo> => {
  try {
    // 1. 获取 code
    const { code } = await wechatLogin()

    // 2. 获取用户信息
    const wxUserInfo = await getWechatUserProfile()

    // 3. 调用后端接口（需要自行实现）
    const response = await fetch('/api/wechat-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code, userInfo: wxUserInfo })
    })

    const result = await response.json()

    // 4. 保存用户信息
    const userInfo: UserInfo = {
      id: result.data.userInfo.id,
      nickname: result.data.userInfo.nickname,
      avatar: result.data.userInfo.avatar,
      phone: result.data.userInfo.phone,
      isLogin: true
    }

    saveUserInfo(userInfo)
    return userInfo
  } catch (error) {
    console.error('微信登录失败', error)
    throw error
  }
}
```

#### 2. 登录页面调用 (`src/pages/login/index.tsx`)

```typescript
const handleWechatLogin = async () => {
  try {
    setLoading(true)

    // 使用标准的微信登录流程
    const userInfo = await wechatLoginComplete()

    Taro.showToast({
      title: '登录成功',
      icon: 'success'
    })

    // 跳转
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  } catch (error) {
    Taro.showToast({
      title: error.message || '登录失败',
      icon: 'none'
    })
  } finally {
    setLoading(false)
  }
}
```

### 后端代码（需要实现）

#### Node.js + Express 示例

```javascript
const axios = require('axios')
const jwt = require('jsonwebtoken')

// 微信小程序配置
const WECHAT_CONFIG = {
  appId: 'your_appid',
  appSecret: 'your_app_secret'
}

// 微信登录接口
app.post('/api/auth/wechat-login', async (req, res) => {
  try {
    const { code, userInfo } = req.body

    // 1. 调用微信接口获取 openid 和 session_key
    const wxResponse = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: WECHAT_CONFIG.appId,
        secret: WECHAT_CONFIG.appSecret,
        js_code: code,
        grant_type: 'authorization_code'
      }
    })

    const { openid, session_key, errcode, errmsg } = wxResponse.data

    if (errcode) {
      return res.status(400).json({
        code: 400,
        message: errmsg
      })
    }

    // 2. 根据 openid 查询或创建用户
    let user = await User.findOne({ openid })

    if (!user) {
      // 创建新用户
      user = await User.create({
        openid,
        nickname: userInfo.nickName,
        avatar: userInfo.avatarUrl,
        sessionKey: session_key
      })
    } else {
      // 更新用户信息
      user.nickname = userInfo.nickName
      user.avatar = userInfo.avatarUrl
      user.sessionKey = session_key
      await user.save()
    }

    // 3. 生成 token
    const token = jwt.sign(
      { userId: user._id, openid: user.openid },
      'your_jwt_secret',
      { expiresIn: '7d' }
    )

    // 4. 返回响应
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        userInfo: {
          id: user._id,
          nickname: user.nickname,
          avatar: user.avatar,
          phone: user.phone || '',
          isLogin: true
        }
      }
    })
  } catch (error) {
    console.error('微信登录失败', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
})
```

---

## 配置要求

### 1. 微信小程序后台配置

1. 登录[微信公众平台](https://mp.weixin.qq.com/)
2. 进入小程序后台
3. 开发 → 开发管理 → 开发设置
4. 获取 `AppID` 和 `AppSecret`
5. 配置服务器域名（request 合法域名）

### 2. 项目配置文件

创建 `config/wechat.ts` 或使用环境变量：

```typescript
export const WECHAT_CONFIG = {
  appId: process.env.WECHAT_APP_ID,
  appSecret: process.env.WECHAT_APP_SECRET
}
```

### 3. 微信接口调用

**获取 openid 和 session_key**:

```
GET https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=CODE&grant_type=authorization_code
```

**响应示例**:

```json
{
  "openid": "oUpF8uMuAJO_M2pxb1Q9zNjWeS6o",
  "session_key": "sessionkey",
  "unionid": "unionid"
}
```

---

## 注意事项

### 1. 用户授权变更

从 2021年4月13日起，微信小程序取消了 `wx.getUserInfo` 的自动授权功能，必须使用 `wx.getUserProfile` 并且需要用户主动点击按钮触发。

**旧的方式（已废弃）**:
```javascript
wx.getUserInfo() // ❌ 不再支持
```

**新的方式（正确）**:
```javascript
// 必须由用户点击按钮触发
<button @click="handleGetUserProfile">获取用户信息</button>

const handleGetUserProfile = () => {
  wx.getUserProfile({
    desc: '用于完善用户资料'
  })
}
```

### 2. code 的有效期

- code 的有效期为 **5 分钟**
- code 只能使用 **一次**
- 如果 code 过期或已使用，会返回错误码 40163

### 3. session_key 的作用

`session_key` 用于：
- 解密微信开放数据（如手机号）
- 数据签名校验
- 建议保存在后端，不要传给前端

### 4. openid 和 unionid

- `openid`: 用户在当前小程序的唯一标识
- `unionid`: 用户在同一开放平台账号下的唯一标识（需要绑定开放平台）

### 5. 安全建议

✅ **推荐做法**:
- AppSecret 保存在后端，不要写在前端代码中
- 使用 HTTPS 传输数据
- token 设置合理的过期时间
- 实施接口限流和防刷策略

❌ **不要这样做**:
- 不要在前端代码中写 AppSecret
- 不要将 session_key 返回给前端
- 不要信任前端传来的用户信息，应从微信服务器获取

---

## 测试流程

### 1. 开发阶段

在微信开发者工具中测试：
1. 打开微信开发者工具
2. 运行 `npm run dev:weapp`
3. 点击"微信一键登录"按钮
4. 查看控制台输出的 code 和用户信息

### 2. 真机测试

1. 点击"预览"生成二维码
2. 使用手机微信扫码
3. 测试登录流程
4. 注意：必须配置合法的服务器域名才能在真机上请求接口

---

## 常见错误

### 错误码 40029

```json
{
  "errcode": 40029,
  "errmsg": "invalid code"
}
```

**原因**: code 无效、过期或已使用
**解决**: 重新调用 `wx.login()` 获取新的 code

### 错误码 40163

```json
{
  "errcode": 40163,
  "errmsg": "code been used"
}
```

**原因**: code 已被使用
**解决**: 每次登录都要获取新的 code，不要重复使用

### 错误码 -1

```json
{
  "errcode": -1,
  "errmsg": "system error"
}
```

**原因**: 微信服务器繁忙
**解决**: 稍后重试

---

## 参考资料

- [微信小程序登录官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html)
- [wx.login API](https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/wx.login.html)
- [wx.getUserProfile API](https://developers.weixin.qq.com/miniprogram/dev/api/open-api/user-info/wx.getUserProfile.html)
- [code2Session 接口文档](https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html)
