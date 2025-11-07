import { View, Text, Input, Picker, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { getUserInfo } from '@/utils/user'
import {
  submitMerchantApplication,
  MerchantType,
  getMerchantTypeName
} from '@/utils/merchant'
import './index.scss'

export default function MerchantApply() {
  const [formData, setFormData] = useState({
    type: MerchantType.COMPANY,
    companyName: '',
    contactName: '',
    contactPhone: '',
    businessLicense: '',
    address: '',
    description: '',
    serviceArea: [] as string[]
  })

  const [loading, setLoading] = useState(false)

  const merchantTypes = [
    { value: MerchantType.COMPANY, label: '装修公司' },
    { value: MerchantType.DESIGNER, label: '独立设计师' },
    { value: MerchantType.MATERIAL, label: '材料商' },
    { value: MerchantType.WORKER, label: '施工队' }
  ]

  const serviceAreas = ['朝阳区', '海淀区', '丰台区', '石景山区', '通州区', '大兴区']
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])

  // 选择商家类型
  const handleTypeChange = (e: any) => {
    const index = e.detail.value
    setFormData({
      ...formData,
      type: merchantTypes[index].value
    })
  }

  // 选择服务区域
  const handleAreaToggle = (area: string) => {
    const newAreas = selectedAreas.includes(area)
      ? selectedAreas.filter(a => a !== area)
      : [...selectedAreas, area]

    setSelectedAreas(newAreas)
    setFormData({
      ...formData,
      serviceArea: newAreas
    })
  }

  // 上传营业执照
  const handleUploadLicense = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        // 这里应该上传到服务器
        setFormData({
          ...formData,
          businessLicense: tempFilePath
        })
        Taro.showToast({
          title: '上传成功',
          icon: 'success',
          duration: 1500
        })
      }
    })
  }

  // 提交申请
  const handleSubmit = async () => {
    // 验证表单
    if (!formData.companyName) {
      Taro.showToast({
        title: '请填写公司/个人名称',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!formData.contactName) {
      Taro.showToast({
        title: '请填写联系人姓名',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!formData.contactPhone) {
      Taro.showToast({
        title: '请填写联系电话',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!/^1[3-9]\d{9}$/.test(formData.contactPhone)) {
      Taro.showToast({
        title: '手机号格式不正确',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (!formData.businessLicense) {
      Taro.showToast({
        title: '请上传营业执照',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (formData.serviceArea.length === 0) {
      Taro.showToast({
        title: '请选择服务区域',
        icon: 'none',
        duration: 2000
      })
      return
    }

    setLoading(true)
    try {
      const userInfo = getUserInfo()
      await submitMerchantApplication({
        ...formData,
        userId: userInfo?.id || ''
      })

      Taro.showToast({
        title: '提交成功，等待审核',
        icon: 'success',
        duration: 2000
      })

      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (error: any) {
      Taro.showToast({
        title: error.message || '提交失败',
        icon: 'none',
        duration: 2000
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='merchant-apply-page'>
      <View className='form-container'>
        {/* 申请说明 */}
        <View className='notice-card'>
          <View className='notice-title'>📋 申请须知</View>
          <View className='notice-content'>
            <Text className='notice-item'>• 提交后1-3个工作日内审核</Text>
            <Text className='notice-item'>• 请确保信息真实有效</Text>
            <Text className='notice-item'>• 需提供营业执照或相关资质</Text>
          </View>
        </View>

        {/* 商家类型 */}
        <View className='form-section'>
          <View className='section-title'>商家类型</View>
          <Picker
            mode='selector'
            range={merchantTypes.map(t => t.label)}
            onChange={handleTypeChange}
          >
            <View className='picker-field'>
              <Text>{getMerchantTypeName(formData.type)}</Text>
              <Text className='picker-arrow'>›</Text>
            </View>
          </Picker>
        </View>

        {/* 基本信息 */}
        <View className='form-section'>
          <View className='section-title'>基本信息</View>

          <View className='form-item'>
            <Text className='item-label'>公司/个人名称</Text>
            <Input
              className='item-input'
              placeholder='请输入名称'
              value={formData.companyName}
              onInput={(e) => setFormData({ ...formData, companyName: e.detail.value })}
            />
          </View>

          <View className='form-item'>
            <Text className='item-label'>联系人</Text>
            <Input
              className='item-input'
              placeholder='请输入联系人姓名'
              value={formData.contactName}
              onInput={(e) => setFormData({ ...formData, contactName: e.detail.value })}
            />
          </View>

          <View className='form-item'>
            <Text className='item-label'>联系电话</Text>
            <Input
              className='item-input'
              type='number'
              maxlength={11}
              placeholder='请输入手机号'
              value={formData.contactPhone}
              onInput={(e) => setFormData({ ...formData, contactPhone: e.detail.value })}
            />
          </View>

          <View className='form-item'>
            <Text className='item-label'>公司地址</Text>
            <Input
              className='item-input'
              placeholder='请输入公司地址'
              value={formData.address}
              onInput={(e) => setFormData({ ...formData, address: e.detail.value })}
            />
          </View>
        </View>

        {/* 营业执照 */}
        <View className='form-section'>
          <View className='section-title'>营业执照/资质证明</View>
          <View className='upload-area' onClick={handleUploadLicense}>
            {formData.businessLicense ? (
              <View className='upload-success'>
                <Text className='success-icon'>✓</Text>
                <Text className='success-text'>已上传</Text>
              </View>
            ) : (
              <View className='upload-placeholder'>
                <Text className='upload-icon'>📷</Text>
                <Text className='upload-text'>点击上传</Text>
              </View>
            )}
          </View>
        </View>

        {/* 服务区域 */}
        <View className='form-section'>
          <View className='section-title'>服务区域</View>
          <View className='area-grid'>
            {serviceAreas.map(area => (
              <View
                key={area}
                className={`area-item ${selectedAreas.includes(area) ? 'active' : ''}`}
                onClick={() => handleAreaToggle(area)}
              >
                {area}
              </View>
            ))}
          </View>
        </View>

        {/* 公司简介 */}
        <View className='form-section'>
          <View className='section-title'>公司简介</View>
          <textarea
            className='textarea-field'
            placeholder='请简要介绍您的公司业务、优势等（选填）'
            maxlength={500}
            value={formData.description}
            onInput={(e: any) => setFormData({ ...formData, description: e.detail.value })}
          />
          <View className='textarea-count'>
            {formData.description.length}/500
          </View>
        </View>

        {/* 提交按钮 */}
        <View className='submit-section'>
          <Button
            className='submit-btn'
            loading={loading}
            onClick={handleSubmit}
          >
            提交申请
          </Button>
        </View>
      </View>
    </View>
  )
}
