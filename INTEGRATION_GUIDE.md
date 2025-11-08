# 前后端集成指南

## 环境配置

### 1. 前端配置

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

### 2. 环境变量

创建 `.env.development` 和 `.env.production`:

```bash
# .env.development
TARO_APP_API_URL=http://localhost:3000/api/v1

# .env.production
TARO_APP_API_URL=https://api.yourdomain.com/api/v1
```

## 使用示例

### 1. 用户登录

```typescript
import Taro from '@tarojs/taro';
import { wechatLogin, setToken } from '@/services/api';

// 微信登录
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

      // 跳转到首页
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

  // 选择图片
  const handleChooseImage = async () => {
    try {
      const { tempFilePaths } = await Taro.chooseImage({
        count: 9 - images.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });

      // 上传图片
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
        Taro.showToast({
          title: '发布成功',
          icon: 'success',
        });

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

### 5. 获取推荐内容

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
        Taro.showToast({
          title: '申请已提交',
          icon: 'success',
        });

        Taro.navigateBack();
      }
    } catch (error) {
      console.error('申请失败:', error);
    }
  };

  return (
    <View>
      {/* 表单字段 */}
      <Button onClick={handleUploadLicense}>上传营业执照</Button>
      <Button onClick={handleSubmit}>提交申请</Button>
    </View>
  );
};
```

## 错误处理

### 统一错误处理

所有 API 请求的错误都会在 `request.ts` 中统一处理：

- **401**: 自动清除 token 并跳转登录页
- **403**: 显示权限不足提示
- **404**: 显示资源不存在提示
- **其他错误**: 显示错误信息

### 自定义错误处理

如果需要自定义错误处理，使用 try-catch:

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

## 性能优化

### 1. 请求缓存

对于不常变化的数据，可以使用本地缓存：

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

## 测试建议

### 1. 本地开发测试

```bash
# 启动后端服务
cd server
npm run dev

# 启动前端
cd ..
npm run dev:weapp
```

### 2. 真机调试

在微信开发者工具中配置：
- 不校验合法域名
- 启用调试模式

### 3. 生产环境

- 配置域名白名单
- 启用 HTTPS
- 配置 SSL 证书
