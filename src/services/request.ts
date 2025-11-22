import Taro from '@tarojs/taro';

// API 基础地址配置
// H5 环境下：开发模式使用相对路径（通过代理），生产模式使用完整 URL
// 小程序环境下：始终使用完整 URL
const getBaseUrl = (): string => {
  const env = process.env.NODE_ENV;
  const isH5 = process.env.TARO_ENV === 'h5';

  // 优先使用环境变量配置
  if (process.env.TARO_APP_API_URL) {
    // H5 开发模式下，如果配置了完整 URL，但可以使用代理，则使用相对路径
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

// Token 存储 key
const TOKEN_KEY = 'auth_token';

// 请求拦截器
interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: any;
  needAuth?: boolean;
}

interface Response<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// 获取 Token
export const getToken = (): string | null => {
  try {
    return Taro.getStorageSync(TOKEN_KEY) || null;
  } catch (error) {
    return null;
  }
};

// 保存 Token
export const setToken = (token: string): void => {
  try {
    Taro.setStorageSync(TOKEN_KEY, token);
  } catch (error) {
    console.error('保存 Token 失败', error);
  }
};

// 清除 Token
export const clearToken = (): void => {
  try {
    Taro.removeStorageSync(TOKEN_KEY);
  } catch (error) {
    console.error('清除 Token 失败', error);
  }
};

// 通用请求方法
export const request = async <T = any>(config: RequestConfig): Promise<Response<T>> => {
  const { url, method = 'GET', data, header = {}, needAuth = false } = config;

  // 构建完整 URL
  let fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

  // 构建请求头
  const headers: any = {
    'Content-Type': 'application/json',
    ...header,
  };

  // 添加 Token
  if (needAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // 需要认证但没有 token，跳转到登录
      Taro.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 1500,
      });
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/login/index' });
      }, 1500);
      throw new Error('未登录');
    }
  }

  // GET 请求参数处理：将 data 转换为查询字符串
  let requestData = data;
  if (method === 'GET' && data) {
    const params = new URLSearchParams();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        params.append(key, String(data[key]));
      }
    });
    const queryString = params.toString();
    if (queryString) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
    }
    requestData = undefined; // GET 请求不需要 body
  }

  try {
    const res = await Taro.request({
      url: fullUrl,
      method,
      data: requestData,
      header: headers,
      timeout: 30000,
    });

    // 处理响应
    const response = res.data as Response<T>;

    if (res.statusCode === 200 || res.statusCode === 201) {
      if (response.success) {
        return response;
      } else {
        // 业务错误
        Taro.showToast({
          title: response.message || '请求失败',
          icon: 'none',
          duration: 2000,
        });
        throw new Error(response.message || '请求失败');
      }
    } else if (res.statusCode === 401) {
      // 未授权，清除 Token 并跳转登录
      clearToken();
      Taro.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none',
        duration: 1500,
      });
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/login/index' });
      }, 1500);
      throw new Error('未授权');
    } else if (res.statusCode === 403) {
      Taro.showToast({
        title: '权限不足',
        icon: 'none',
        duration: 2000,
      });
      throw new Error('权限不足');
    } else if (res.statusCode === 404) {
      Taro.showToast({
        title: '资源不存在',
        icon: 'none',
        duration: 2000,
      });
      throw new Error('资源不存在');
    } else {
      Taro.showToast({
        title: response.message || '请求失败',
        icon: 'none',
        duration: 2000,
      });
      throw new Error(response.message || '请求失败');
    }
  } catch (error) {
    console.error('请求错误:', error);

    if (error instanceof Error && error.message === '未登录') {
      throw error;
    }

    Taro.showToast({
      title: '网络请求失败',
      icon: 'none',
      duration: 2000,
    });
    throw error;
  }
};

// GET 请求
export const get = <T = any>(url: string, data?: any, needAuth = false): Promise<Response<T>> => {
  return request<T>({ url, method: 'GET', data, needAuth });
};

// POST 请求
export const post = <T = any>(url: string, data?: any, needAuth = false): Promise<Response<T>> => {
  return request<T>({ url, method: 'POST', data, needAuth });
};

// PUT 请求
export const put = <T = any>(url: string, data?: any, needAuth = false): Promise<Response<T>> => {
  return request<T>({ url, method: 'PUT', data, needAuth });
};

// DELETE 请求
export const del = <T = any>(url: string, data?: any, needAuth = false): Promise<Response<T>> => {
  return request<T>({ url, method: 'DELETE', data, needAuth });
};

// 文件上传
export const uploadFile = async (filePath: string, needAuth = true): Promise<Response> => {
  const token = getToken();

  if (needAuth && !token) {
    Taro.showToast({
      title: '请先登录',
      icon: 'none',
      duration: 1500,
    });
    setTimeout(() => {
      Taro.navigateTo({ url: '/pages/login/index' });
    }, 1500);
    throw new Error('未登录');
  }

  try {
    const res = await Taro.uploadFile({
      url: `${BASE_URL}/upload/image`,
      filePath,
      name: 'image',
      header: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response = JSON.parse(res.data) as Response;

    if (res.statusCode === 200 && response.success) {
      return response;
    } else {
      Taro.showToast({
        title: response.message || '上传失败',
        icon: 'none',
        duration: 2000,
      });
      throw new Error(response.message || '上传失败');
    }
  } catch (error) {
    console.error('上传错误:', error);
    Taro.showToast({
      title: '上传失败',
      icon: 'none',
      duration: 2000,
    });
    throw error;
  }
};
