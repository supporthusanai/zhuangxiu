import { View, Text, Input, Textarea, Image, Slider } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import type { DiaryEntry } from '../diary/index'
import './index.scss'

const DIARY_STORAGE_KEY = 'decorationDiary'

const TAG_OPTIONS = [
  '拆除',
  '水电',
  '泥瓦',
  '木工',
  '油漆',
  '安装',
  '软装',
  '验收',
  '其他'
]

export default function DiaryEdit() {
  const router = useRouter()
  const diaryId = router.params.id ? parseInt(router.params.id) : null

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (diaryId) {
      loadDiary()
    }
  }, [diaryId])

  const loadDiary = () => {
    try {
      const data = Taro.getStorageSync(DIARY_STORAGE_KEY)
      if (data) {
        const list = JSON.parse(data) as DiaryEntry[]
        const diary = list.find(item => item.id === diaryId)
        if (diary) {
          setTitle(diary.title)
          setContent(diary.content)
          setImages(diary.images)
          setSelectedTags(diary.tags)
          setProgress(diary.progress)
        }
      }
    } catch (error) {
      console.error('加载日记失败', error)
    }
  }

  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 9 - images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        setImages([...images, ...res.tempFilePaths])
      }
    })
  }

  const handlePreviewImage = (index: number) => {
    Taro.previewImage({
      current: images[index],
      urls: images
    })
  }

  const handleRemoveImage = (index: number, e: any) => {
    e.stopPropagation()
    setImages(images.filter((_, i) => i !== index))
  }

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleSave = () => {
    if (!title.trim()) {
      Taro.showToast({
        title: '请输入标题',
        icon: 'none',
        duration: 1500
      })
      return
    }

    if (!content.trim()) {
      Taro.showToast({
        title: '请输入内容',
        icon: 'none',
        duration: 1500
      })
      return
    }

    try {
      const data = Taro.getStorageSync(DIARY_STORAGE_KEY)
      let list: DiaryEntry[] = data ? JSON.parse(data) : []

      if (diaryId) {
        // 编辑现有日记
        const index = list.findIndex(item => item.id === diaryId)
        if (index !== -1) {
          list[index] = {
            ...list[index],
            title: title.trim(),
            content: content.trim(),
            images,
            tags: selectedTags,
            progress
          }
        }
      } else {
        // 创建新日记
        const newDiary: DiaryEntry = {
          id: Date.now(),
          title: title.trim(),
          content: content.trim(),
          images,
          date: Date.now(),
          tags: selectedTags,
          progress
        }
        list.unshift(newDiary)
      }

      Taro.setStorageSync(DIARY_STORAGE_KEY, JSON.stringify(list))

      Taro.showToast({
        title: diaryId ? '保存成功' : '创建成功',
        icon: 'success',
        duration: 1500,
        success: () => {
          setTimeout(() => {
            Taro.navigateBack()
          }, 1500)
        }
      })
    } catch (error) {
      console.error('保存日记失败', error)
      Taro.showToast({
        title: '保存失败',
        icon: 'none',
        duration: 1500
      })
    }
  }

  return (
    <View className='diary-edit-page'>
      {/* 标题输入 */}
      <View className='form-section'>
        <View className='section-label'>
          <Text className='label-text'>标题</Text>
          <Text className='label-required'>*</Text>
        </View>
        <Input
          className='title-input'
          type='text'
          placeholder='给这篇日记起个标题吧'
          value={title}
          onInput={(e) => setTitle(e.detail.value)}
          maxlength={50}
        />
        <View className='char-count'>{title.length}/50</View>
      </View>

      {/* 进度设置 */}
      <View className='form-section'>
        <View className='section-label'>
          <Text className='label-text'>装修进度</Text>
        </View>
        <View className='progress-slider'>
          <Slider
            value={progress}
            min={0}
            max={100}
            step={1}
            activeColor='#667eea'
            backgroundColor='#e9e9e9'
            blockSize={24}
            onChange={(e) => setProgress(e.detail.value)}
            showValue
          />
        </View>
        <View className='progress-hint'>当前进度：{progress}%</View>
      </View>

      {/* 标签选择 */}
      <View className='form-section'>
        <View className='section-label'>
          <Text className='label-text'>标签</Text>
        </View>
        <View className='tag-list'>
          {TAG_OPTIONS.map((tag) => (
            <View
              key={tag}
              className={`tag-option ${selectedTags.includes(tag) ? 'selected' : ''}`}
              onClick={() => handleToggleTag(tag)}
            >
              {tag}
            </View>
          ))}
        </View>
      </View>

      {/* 图片上传 */}
      <View className='form-section'>
        <View className='section-label'>
          <Text className='label-text'>照片</Text>
          <Text className='label-hint'>({images.length}/9)</Text>
        </View>
        <View className='image-grid'>
          {images.map((image, index) => (
            <View key={index} className='image-item' onClick={() => handlePreviewImage(index)}>
              <Image src={image} className='image' mode='aspectFill' />
              <View
                className='remove-btn'
                onClick={(e) => handleRemoveImage(index, e)}
              >
                ✕
              </View>
            </View>
          ))}
          {images.length < 9 && (
            <View className='image-add' onClick={handleChooseImage}>
              <Text className='add-icon'>+</Text>
              <Text className='add-text'>添加照片</Text>
            </View>
          )}
        </View>
      </View>

      {/* 内容输入 */}
      <View className='form-section'>
        <View className='section-label'>
          <Text className='label-text'>内容</Text>
          <Text className='label-required'>*</Text>
        </View>
        <Textarea
          className='content-textarea'
          placeholder='记录今天的装修故事...'
          value={content}
          onInput={(e) => setContent(e.detail.value)}
          maxlength={1000}
          autoHeight
        />
        <View className='char-count'>{content.length}/1000</View>
      </View>

      {/* 保存按钮 */}
      <View className='save-bar'>
        <View className='save-btn' onClick={handleSave}>
          {diaryId ? '保存修改' : '发布日记'}
        </View>
      </View>
    </View>
  )
}
