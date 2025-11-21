import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

// Auth APIs
export const authApi = {
  // 密码登录
  login: (data: { phone: string; password: string }) => api.post('/auth/login', data),
  // 验证码登录
  phoneLogin: (data: { phone: string; code: string }) => api.post('/auth/phone-login', data),
  // 发送验证码
  sendCode: (phone: string) => api.post('/auth/send-code', { phone }),
  // 注册
  register: (data: { phone: string; password: string; nickname?: string }) => api.post('/auth/register', data),
  // 获取用户信息
  getProfile: () => api.get('/auth/me'),
  // 修改密码
  changePassword: (data: { oldPassword?: string; newPassword: string }) => api.put('/auth/password', data),
}

// Case APIs
export const caseApi = {
  getList: (params?: { page?: number; pageSize?: number; style?: string; area?: string; budget?: string }) =>
    api.get('/cases', { params }),
  getDetail: (id: string) => api.get(`/cases/${id}`),
  getRecommend: (limit?: number) => api.get('/recommend/cases', { params: { limit } }),
}

// Designer APIs
export const designerApi = {
  getList: (params?: { page?: number; pageSize?: number; style?: string }) =>
    api.get('/merchants', { params: { ...params, type: 'designer' } }),
  getDetail: (id: string) => api.get(`/merchants/${id}`),
  getRecommend: (limit?: number) => api.get('/recommend/designers', { params: { limit } }),
}

// Review APIs
export const reviewApi = {
  getList: (params: { targetType: string; targetId: string; page?: number }) =>
    api.get('/reviews', { params }),
  create: (data: { targetType: string; targetId: string; rating: number; content: string }) =>
    api.post('/reviews', data),
}

// Favorite APIs
export const favoriteApi = {
  getList: (type: string) => api.get('/favorites', { params: { type } }),
  add: (data: { type: string; targetId: string }) => api.post('/favorites', data),
  remove: (id: string) => api.delete(`/favorites/${id}`),
  check: (type: string, targetId: string) => api.get('/favorites/check', { params: { type, targetId } }),
}

// Appointment APIs
export const appointmentApi = {
  getList: () => api.get('/appointments'),
  create: (data: { merchantId: string; date: string; time: string; remark?: string }) =>
    api.post('/appointments', data),
}

export default api
