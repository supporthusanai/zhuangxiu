import Taro from '@tarojs/taro'

// 商家类型
export enum MerchantType {
  COMPANY = 'company', // 装修公司
  DESIGNER = 'designer', // 独立设计师
  MATERIAL = 'material', // 材料商
  WORKER = 'worker' // 施工队
}

// 商家状态
export enum MerchantStatus {
  PENDING = 'pending', // 待审核
  APPROVED = 'approved', // 已通过
  REJECTED = 'rejected', // 已拒绝
  NONE = 'none' // 未申请
}

// 商家信息
export interface MerchantInfo {
  id: string
  userId: string
  type: MerchantType
  status: MerchantStatus
  companyName: string
  contactName: string
  contactPhone: string
  businessLicense: string // 营业执照
  address: string
  description: string
  serviceArea: string[] // 服务区域
  createdAt: string
  updatedAt: string
}

const MERCHANT_STORAGE_KEY = 'merchantInfo'

// 获取商家信息
export const getMerchantInfo = (): MerchantInfo | null => {
  try {
    const merchantInfoStr = Taro.getStorageSync(MERCHANT_STORAGE_KEY)
    if (merchantInfoStr) {
      return JSON.parse(merchantInfoStr)
    }
    return null
  } catch (error) {
    console.error('获取商家信息失败', error)
    return null
  }
}

// 保存商家信息
export const saveMerchantInfo = (merchantInfo: MerchantInfo): boolean => {
  try {
    Taro.setStorageSync(MERCHANT_STORAGE_KEY, JSON.stringify(merchantInfo))
    return true
  } catch (error) {
    console.error('保存商家信息失败', error)
    return false
  }
}

// 清除商家信息
export const clearMerchantInfo = (): boolean => {
  try {
    Taro.removeStorageSync(MERCHANT_STORAGE_KEY)
    return true
  } catch (error) {
    console.error('清除商家信息失败', error)
    return false
  }
}

// 检查是否是商家
export const isMerchant = (): boolean => {
  const merchantInfo = getMerchantInfo()
  return merchantInfo?.status === MerchantStatus.APPROVED
}

// 获取商家状态
export const getMerchantStatus = (): MerchantStatus => {
  const merchantInfo = getMerchantInfo()
  return merchantInfo?.status || MerchantStatus.NONE
}

// 商家类型显示名称
export const getMerchantTypeName = (type: MerchantType): string => {
  const typeMap = {
    [MerchantType.COMPANY]: '装修公司',
    [MerchantType.DESIGNER]: '独立设计师',
    [MerchantType.MATERIAL]: '材料商',
    [MerchantType.WORKER]: '施工队'
  }
  return typeMap[type] || '未知'
}

// 商家状态显示名称
export const getMerchantStatusName = (status: MerchantStatus): string => {
  const statusMap = {
    [MerchantStatus.PENDING]: '审核中',
    [MerchantStatus.APPROVED]: '已认证',
    [MerchantStatus.REJECTED]: '已拒绝',
    [MerchantStatus.NONE]: '未申请'
  }
  return statusMap[status] || '未知'
}

// 模拟提交商家申请
export const submitMerchantApplication = async (data: Partial<MerchantInfo>): Promise<MerchantInfo> => {
  return new Promise((resolve, reject) => {
    // 模拟网络请求延迟
    setTimeout(() => {
      try {
        const merchantInfo: MerchantInfo = {
          id: Date.now().toString(),
          userId: data.userId || '',
          type: data.type || MerchantType.COMPANY,
          status: MerchantStatus.PENDING,
          companyName: data.companyName || '',
          contactName: data.contactName || '',
          contactPhone: data.contactPhone || '',
          businessLicense: data.businessLicense || '',
          address: data.address || '',
          description: data.description || '',
          serviceArea: data.serviceArea || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        saveMerchantInfo(merchantInfo)
        resolve(merchantInfo)
      } catch (error) {
        reject(new Error('提交失败'))
      }
    }, 1500)
  })
}
