import { View, Text, Input, Picker, Button, Image, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import './index.scss'

export default function CaseEdit() {
  const [isEdit, setIsEdit] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    style: '现代简约',
    area: '',
    price: '',
    images: [] as string[],
    description: '',
    tags: [] as string[],
    specs: {
      rooms: '',
      floor: '',
      district: ''
    }
  })

  const [loading, setLoading] = useState(false)

  const styles = ['现代简约', '北欧', '新中式', '轻奢', '工业风', '田园', '欧式', '美式']
  const availableTags = ['简约', '舒适', '温馨', '实用', '高档', '时尚', '自然', '清新']

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    if (params?.id) {
      setIsEdit(true)
      // 这里应该加载案例数据
      loadCaseData(params.id)
    }
  }, [])

  const loadCaseData = (id: string) => {
    // 模拟加载数据
    setFormData({
      title: '现代简约 · 三居室',
      style: '现代简约',
      area: '120',
      price: '15',
      images: [
        'https://via.placeholder.com/750x600/667eea/ffffff?text=图1',
        'https://via.placeholder.com/750x600/764ba2/ffffff?text=图2'
      ],
      description: '本案例采用现代简约风格...',
      tags: ['简约', '舒适'],
      specs: {
        rooms: '三室两厅一卫',
        floor: '中层',
        district: '朝阳区'
      }
    })
  }

  const handleChooseImages = () => {
    Taro.chooseImage({
      count: 9 - formData.images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        setFormData({
          ...formData,
          images: [...formData.images, ...res.tempFilePaths]
        })
      }
    })
  }

  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      images: newImages
    })
  }

  const handleTagToggle = (tag: string) => {
    const newTags = formData.tags.includes(tag)
      ? formData.tags.filter(t => t !== tag)
      : [...formData.tags, tag]

    setFormData({
      ...formData,
      tags: newTags
    })
  }

  const handleSave = async (status: 'draft' | 'published') => {
    // 验证
    if (!formData.title) {
      Taro.showToast({
        title: '请输入案例标题',
        icon: 'none',
        duration: 2000
      })
      return
    }

    if (formData.images.length === 0) {
      Taro.showToast({
        title: '请至少上传一张图片',
        icon: 'none',
        duration: 2000
      })
      return
    }

    setLoading(true)
    try {
      // 这里应该调用保存接口
      await new Promise(resolve => setTimeout(resolve, 1500))

      Taro.showToast({
        title: status === 'draft' ? '保存成功' : '发布成功',
        icon: 'success',
        duration: 1500
      })

      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (error) {
      Taro.showToast({
        title: '保存失败',
        icon: 'none',
        duration: 2000
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='case-edit-page'>
      <View className='form-container'>
        {/* 基本信息 */}
        <View className='form-section'>
          <View className='section-title'>基本信息</View>

          <View className='form-item'>
            <Text className='item-label'>案例标题</Text>
            <Input
              className='item-input'
              placeholder='例如：现代简约 · 三居室'
              value={formData.title}
              onInput={(e) => setFormData({ ...formData, title: e.detail.value })}
            />
          </View>

          <View className='form-item'>
            <Text className='item-label'>装修风格</Text>
            <Picker
              mode='selector'
              range={styles}
              value={styles.indexOf(formData.style)}
              onChange={(e) => setFormData({ ...formData, style: styles[e.detail.value] })}
            >
              <View className='picker-value'>{formData.style}</View>
            </Picker>
          </View>

          <View className='form-item'>
            <Text className='item-label'>面积（㎡）</Text>
            <Input
              className='item-input'
              type='number'
              placeholder='请输入面积'
              value={formData.area}
              onInput={(e) => setFormData({ ...formData, area: e.detail.value })}
            />
          </View>

          <View className='form-item'>
            <Text className='item-label'>预算（万）</Text>
            <Input
              className='item-input'
              type='digit'
              placeholder='请输入预算'
              value={formData.price}
              onInput={(e) => setFormData({ ...formData, price: e.detail.value })}
            />
          </View>
        </View>

        {/* 图片上传 */}
        <View className='form-section'>
          <View className='section-title'>案例图片（最多9张）</View>
          <View className='images-grid'>
            {formData.images.map((image, index) => (
              <View key={index} className='image-item'>
                <Image src={image} className='image-preview' mode='aspectFill' />
                <View className='image-remove' onClick={() => handleRemoveImage(index)}>
                  ×
                </View>
              </View>
            ))}
            {formData.images.length < 9 && (
              <View className='image-add' onClick={handleChooseImages}>
                <Text className='add-icon'>+</Text>
                <Text className='add-text'>添加图片</Text>
              </View>
            )}
          </View>
        </View>

        {/* 标签选择 */}
        <View className='form-section'>
          <View className='section-title'>案例标签</View>
          <View className='tags-grid'>
            {availableTags.map(tag => (
              <View
                key={tag}
                className={`tag-item ${formData.tags.includes(tag) ? 'active' : ''}`}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </View>
            ))}
          </View>
        </View>

        {/* 详细信息 */}
        <View className='form-section'>
          <View className='section-title'>详细信息</View>

          <View className='form-item'>
            <Text className='item-label'>户型</Text>
            <Input
              className='item-input'
              placeholder='例如：三室两厅一卫'
              value={formData.specs.rooms}
              onInput={(e) => setFormData({
                ...formData,
                specs: { ...formData.specs, rooms: e.detail.value }
              })}
            />
          </View>

          <View className='form-item'>
            <Text className='item-label'>楼层</Text>
            <Input
              className='item-input'
              placeholder='例如：中层'
              value={formData.specs.floor}
              onInput={(e) => setFormData({
                ...formData,
                specs: { ...formData.specs, floor: e.detail.value }
              })}
            />
          </View>

          <View className='form-item'>
            <Text className='item-label'>区域</Text>
            <Input
              className='item-input'
              placeholder='例如：朝阳区'
              value={formData.specs.district}
              onInput={(e) => setFormData({
                ...formData,
                specs: { ...formData.specs, district: e.detail.value }
              })}
            />
          </View>
        </View>

        {/* 设计说明 */}
        <View className='form-section'>
          <View className='section-title'>设计说明</View>
          <Textarea
            className='textarea-field'
            placeholder='请详细描述设计理念、材料选择、空间布局等'
            maxlength={1000}
            value={formData.description}
            onInput={(e: any) => setFormData({ ...formData, description: e.detail.value })}
          />
          <View className='textarea-count'>
            {formData.description.length}/1000
          </View>
        </View>

        {/* 操作按钮 */}
        <View className='action-buttons'>
          <Button
            className='save-draft-btn'
            loading={loading}
            onClick={() => handleSave('draft')}
          >
            保存草稿
          </Button>
          <Button
            className='publish-btn'
            loading={loading}
            onClick={() => handleSave('published')}
          >
            {isEdit ? '更新' : '发布'}
          </Button>
        </View>
      </View>
    </View>
  )
}
