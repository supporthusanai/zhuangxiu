import { get, post, put, del, uploadFile } from './request';

// ============ 认证相关 ============

// 微信登录
export const wechatLogin = (data: { code: string; userInfo?: any }) => {
  return post('/auth/wechat-login', data);
};

// 手机号登录
export const phoneLogin = (data: { phone: string; code: string }) => {
  return post('/auth/phone-login', data);
};

// 获取当前用户信息
export const getCurrentUser = () => {
  return get('/auth/me', undefined, true);
};

// 更新用户资料
export const updateProfile = (data: {
  nickname?: string;
  avatar?: string;
  gender?: string;
  region?: string;
  signature?: string;
}) => {
  return put('/auth/profile', data, true);
};

// 获取微信手机号
export const getWechatPhone = (data: { code: string }) => {
  return post('/auth/wechat-phone', data, true);
};

// ============ 案例相关 ============

// 获取案例列表
export const getCases = (params?: {
  page?: number;
  limit?: number;
  style?: string;
  minArea?: number;
  maxArea?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: string;
}) => {
  return get('/cases', params);
};

// 获取案例详情
export const getCaseDetail = (id: number | string) => {
  return get(`/cases/${id}`);
};

// 搜索案例
export const searchCases = (params: { keyword: string; page?: number; limit?: number }) => {
  return get('/cases/search', params);
};

// 获取热门案例
export const getHotCases = (limit?: number) => {
  return get('/cases/hot', { limit });
};

// 创建案例（商家）
export const createCase = (data: any) => {
  return post('/cases', data, true);
};

// 更新案例（商家）
export const updateCase = (id: number | string, data: any) => {
  return put(`/cases/${id}`, data, true);
};

// 删除案例（商家）
export const deleteCase = (id: number | string) => {
  return del(`/cases/${id}`, undefined, true);
};

// ============ 日记相关 ============

// 获取我的日记列表
export const getMyDiaries = (params?: { page?: number; limit?: number }) => {
  return get('/diaries', params, true);
};

// 获取日记详情
export const getDiaryDetail = (id: number | string) => {
  return get(`/diaries/${id}`, undefined, true);
};

// 创建日记
export const createDiary = (data: {
  title: string;
  content: string;
  images?: string[];
  tags?: string[];
  progress?: number;
}) => {
  return post('/diaries', data, true);
};

// 更新日记
export const updateDiary = (id: number | string, data: any) => {
  return put(`/diaries/${id}`, data, true);
};

// 删除日记
export const deleteDiary = (id: number | string) => {
  return del(`/diaries/${id}`, undefined, true);
};

// 获取日记统计
export const getDiaryStats = () => {
  return get('/diaries/stats', undefined, true);
};

// ============ 收藏相关 ============

// 获取我的收藏
export const getMyFavorites = (params?: {
  targetType?: 'case' | 'designer';
  page?: number;
  limit?: number;
}) => {
  return get('/favorites', params, true);
};

// 添加收藏
export const addFavorite = (data: { targetType: 'case' | 'designer'; targetId: string }) => {
  return post('/favorites', data, true);
};

// 取消收藏
export const removeFavorite = (targetType: 'case' | 'designer', targetId: string) => {
  return del(`/favorites/${targetType}/${targetId}`, undefined, true);
};

// 检查收藏状态
export const checkFavorite = (targetType: 'case' | 'designer', targetId: string) => {
  return get(`/favorites/check/${targetType}/${targetId}`, undefined, true);
};

// ============ 推荐相关 ============

// 获取推荐案例
export const getRecommendedCases = (limit?: number) => {
  return get('/recommend/cases', { limit }, true);
};

// 获取推荐设计师
export const getRecommendedDesigners = (limit?: number) => {
  return get('/recommend/designers', { limit }, true);
};

// 获取相似案例
export const getSimilarCases = (id: number | string, limit?: number) => {
  return get(`/recommend/similar/${id}`, { limit }, true);
};

// ============ 文件上传 ============

// 上传单个图片
export const uploadImage = (filePath: string) => {
  return uploadFile(filePath, true);
};

// ============ 商家相关 ============

// 申请成为商家
export const applyMerchant = (data: {
  companyName: string;
  businessLicense: string;
  contactPerson: string;
  contactPhone: string;
  address: string;
  description?: string;
  logo?: string;
}) => {
  return post('/merchants/apply', data, true);
};

// 获取我的商家信息
export const getMyMerchant = () => {
  return get('/merchants/me', undefined, true);
};

// 更新商家信息
export const updateMerchant = (data: any) => {
  return put('/merchants/me', data, true);
};

// 添加设计师
export const addDesigner = (data: {
  name: string;
  avatar: string;
  title: string;
  experience: number;
  specialties: string[];
  introduction?: string;
}) => {
  return post('/merchants/designers', data, true);
};

// 获取我的设计师列表
export const getMyDesigners = () => {
  return get('/merchants/designers', undefined, true);
};

// 更新设计师
export const updateDesigner = (id: number | string, data: any) => {
  return put(`/merchants/designers/${id}`, data, true);
};

// 删除设计师
export const deleteDesigner = (id: number | string) => {
  return del(`/merchants/designers/${id}`, undefined, true);
};

export default {
  // Auth
  wechatLogin,
  phoneLogin,
  getCurrentUser,
  updateProfile,
  getWechatPhone,

  // Cases
  getCases,
  getCaseDetail,
  searchCases,
  getHotCases,
  createCase,
  updateCase,
  deleteCase,

  // Diary
  getMyDiaries,
  getDiaryDetail,
  createDiary,
  updateDiary,
  deleteDiary,
  getDiaryStats,

  // Favorites
  getMyFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,

  // Recommend
  getRecommendedCases,
  getRecommendedDesigners,
  getSimilarCases,

  // Upload
  uploadImage,

  // Merchant
  applyMerchant,
  getMyMerchant,
  updateMerchant,
  addDesigner,
  getMyDesigners,
  updateDesigner,
  deleteDesigner,
};
