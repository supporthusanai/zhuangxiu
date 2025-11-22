// API 请求和响应类型定义

// ============ 通用类型 ============

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ============ 用户相关 ============

export interface User {
  id: string;
  nickname: string;
  avatar?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'unknown';
  region?: string;
  signature?: string;
  role: 'user' | 'merchant' | 'admin';
  createdAt?: string;
}

export interface WechatLoginData {
  code: string;
  userInfo?: {
    nickname: string;
    avatar: string;
    gender: 'male' | 'female' | 'unknown';
  };
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UpdateProfileData {
  nickname?: string;
  avatar?: string;
  gender?: string;
  region?: string;
  signature?: string;
}

// ============ 案例相关 ============

export type CaseStyle =
  | '现代简约'
  | '北欧风格'
  | '中式风格'
  | '新中式'
  | '欧式古典'
  | '美式风格'
  | '工业风格'
  | '地中海'
  | '日式风格'
  | '轻奢风格'
  | '田园风格'
  | '混搭风格';

export interface Case {
  id: string;
  title: string;
  style: CaseStyle;
  area: number;
  price: number;
  images: string[];
  description: string;
  tags: string[];
  rooms: string;
  floor?: string;
  district?: string;
  designer?: Designer;
  merchant?: Merchant;
  status: 'draft' | 'published' | 'archived';
  viewCount: number;
  favoriteCount: number;
  isHot: boolean;
  isRecommended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetCasesParams extends PaginationParams {
  style?: CaseStyle;
  minArea?: number;
  maxArea?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface GetCasesResponse {
  cases: Case[];
  pagination: PaginationResponse;
}

export interface SearchCasesParams extends PaginationParams {
  keyword: string;
}

export interface CreateCaseData {
  title: string;
  style: CaseStyle;
  area: number;
  price: number;
  images: string[];
  description: string;
  tags?: string[];
  rooms: string;
  floor?: string;
  district?: string;
  designer: string;
}

// ============ 设计师相关 ============

export type DesignerTitle =
  | '助理设计师'
  | '设计师'
  | '主任设计师'
  | '高级设计师'
  | '首席设计师'
  | '设计总监'
  | '创意总监';

export interface Designer {
  id: string;
  name: string;
  avatar: string;
  title: DesignerTitle;
  experience: number;
  specialties: string[];
  introduction?: string;
  user?: string;
  merchant?: string;
  caseCount: number;
  rating: number;
  ratingCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface AddDesignerData {
  name: string;
  avatar: string;
  title: DesignerTitle;
  experience: number;
  specialties: string[];
  introduction?: string;
}

// ============ 日记相关 ============

export type DiaryTag = '拆除' | '水电' | '泥瓦' | '木工' | '油漆' | '安装' | '软装' | '验收' | '其他';

export interface Diary {
  id: string;
  title: string;
  content: string;
  images: string[];
  tags: DiaryTag[];
  progress: number;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiaryData {
  title: string;
  content: string;
  images?: string[];
  tags?: DiaryTag[];
  progress?: number;
}

export interface DiaryStats {
  total: number;
  avgProgress: number;
  latestDiary?: Diary;
}

// ============ 收藏相关 ============

export type FavoriteTargetType = 'case' | 'designer';

export interface Favorite {
  id: string;
  targetType: FavoriteTargetType;
  targetId: string;
  user: string;
  createdAt: string;
}

export interface AddFavoriteData {
  targetType: FavoriteTargetType;
  targetId: string;
}

export interface CheckFavoriteResponse {
  isFavorited: boolean;
}

// ============ 商家相关 ============

export interface Merchant {
  id: string;
  companyName: string;
  businessLicense: string;
  contactPerson: string;
  contactPhone: string;
  address: string;
  description?: string;
  logo?: string;
  user: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}

export interface ApplyMerchantData {
  companyName: string;
  businessLicense: string;
  contactPerson: string;
  contactPhone: string;
  address: string;
  description?: string;
  logo?: string;
}

// ============ 聊天相关 ============

export type MessageType = 'text' | 'image' | 'file';
export type UserType = 'user' | 'merchant' | 'designer';

export interface Message {
  id: string;
  conversationId: string;
  sender: string;
  senderType: UserType;
  receiver: string;
  receiverType: UserType;
  content: string;
  messageType: MessageType;
  fileUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: Array<{
    userId: string;
    userType: UserType;
    lastReadAt?: string;
  }>;
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: string;
  };
  caseId?: string;
  designerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationData {
  participantId: string;
  participantType: UserType;
}

export interface GetMessagesParams extends PaginationParams {
  conversationId: string;
}

// ============ 文件上传 ============

export interface UploadImageResponse {
  url: string;
  filename: string;
  size: number;
}
