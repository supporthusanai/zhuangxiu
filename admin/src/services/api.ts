import axios from 'axios';
import { message } from 'antd';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const msg = error.response?.data?.message || '请求失败';
    message.error(msg);
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证
export const login = (data: { phone: string; code: string }) =>
  api.post('/auth/phone-login', data);

export const sendCode = (phone: string) =>
  api.post('/auth/send-code', { phone });

export const getCurrentUser = () => api.get('/auth/me');

// 用户管理
export const getUsers = (params?: any) => api.get('/admin/users', { params });
export const updateUser = (id: string, data: any) => api.put(`/admin/users/${id}`, data);

// 商家管理
export const getMerchants = (params?: any) => api.get('/admin/merchants', { params });
export const approveMerchant = (id: string, data: { status: string; reason?: string }) =>
  api.put(`/admin/merchants/${id}/approve`, data);

// 案例管理
export const getCases = (params?: any) => api.get('/cases', { params });
export const updateCaseStatus = (id: string, status: string) =>
  api.put(`/admin/cases/${id}/status`, { status });
export const deleteCase = (id: string) => api.delete(`/cases/${id}`);

// 订单管理
export const getOrders = (params?: any) => api.get('/admin/orders', { params });
export const getOrderDetail = (id: string) => api.get(`/orders/${id}`);

// 统计数据
export const getDashboardStats = () => api.get('/admin/stats/dashboard');
export const getDetailedStats = () => api.get('/admin/stats/detailed');
export const getOrderStats = () => api.get('/admin/stats/orders');
export const getUserStats = () => api.get('/admin/stats/users');

// 评价管理
export const getReviews = (params?: any) => api.get('/admin/reviews', { params });
export const deleteReview = (id: string) => api.delete(`/admin/reviews/${id}`);

// 预约管理
export const getAppointments = (params?: any) => api.get('/admin/appointments', { params });

// 设计师管理
export const getDesigners = (params?: any) => api.get('/admin/designers', { params });
export const deleteDesigner = (id: string) => api.delete(`/admin/designers/${id}`);

export default api;
