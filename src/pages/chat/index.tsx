import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState, useEffect, useRef } from 'react'
import './index.scss'

interface Message {
  id: string
  type: 'text' | 'image' | 'case'
  content: string
  isSelf: boolean
  time: string
  caseInfo?: {
    id: number
    title: string
    image: string
  }
}

export default function Chat() {
  const [userName, setUserName] = useState('')
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'text',
      content: '您好，我对您的现代简约风格案例很感兴趣',
      isSelf: false,
      time: '10:30'
    },
    {
      id: '2',
      type: 'case',
      content: '',
      isSelf: false,
      time: '10:30',
      caseInfo: {
        id: 1,
        title: '现代简约 · 三居室',
        image: 'https://via.placeholder.com/200x150/667eea/ffffff?text=案例'
      }
    },
    {
      id: '3',
      type: 'text',
      content: '您好！感谢您的关注，这个案例是120㎡的三居室，采用现代简约风格',
      isSelf: true,
      time: '10:32'
    },
    {
      id: '4',
      type: 'text',
      content: '请问预算大概多少呢？我家也是120平左右',
      isSelf: false,
      time: '10:33'
    },
    {
      id: '5',
      type: 'text',
      content: '这个案例的总预算是15万，包含基础装修和部分主材。具体价格我们可以根据您的实际需求来调整。',
      isSelf: true,
      time: '10:35'
    }
  ])

  const scrollViewRef = useRef<any>(null)

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    setUserName(params?.userName || '用户')

    // 滚动到底部
    setTimeout(() => {
      scrollToBottom()
    }, 100)
  }, [])

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTop = scrollViewRef.current.scrollHeight
    }
  }

  const handleSend = () => {
    if (!inputText.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'text',
      content: inputText,
      isSelf: true,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }

    setMessages([...messages, newMessage])
    setInputText('')

    // 滚动到底部
    setTimeout(() => {
      scrollToBottom()
    }, 100)

    // 模拟自动回复
    setTimeout(() => {
      const autoReply: Message = {
        id: (Date.now() + 1).toString(),
        type: 'text',
        content: '收到您的消息，我会尽快回复您！',
        isSelf: false,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, autoReply])
      scrollToBottom()
    }, 2000)
  }

  const handleSendImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newMessage: Message = {
          id: Date.now().toString(),
          type: 'image',
          content: res.tempFilePaths[0],
          isSelf: true,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }
        setMessages([...messages, newMessage])
        setTimeout(() => {
          scrollToBottom()
        }, 100)
      }
    })
  }

  const handleViewCase = (caseId: number) => {
    Taro.navigateTo({
      url: `/pages/case-detail/index?id=${caseId}`
    })
  }

  return (
    <View className='chat-page'>
      {/* 消息列表 */}
      <ScrollView
        scrollY
        className='messages-container'
        scrollIntoView='message-bottom'
        scrollWithAnimation
      >
        {messages.map(message => (
          <View
            key={message.id}
            className={`message-item ${message.isSelf ? 'self' : 'other'}`}
          >
            <View className='message-content'>
              {message.type === 'text' && (
                <View className='message-bubble'>
                  <Text className='message-text'>{message.content}</Text>
                </View>
              )}

              {message.type === 'image' && (
                <View className='message-image'>
                  <image src={message.content} mode='widthFix' />
                </View>
              )}

              {message.type === 'case' && message.caseInfo && (
                <View
                  className='message-case'
                  onClick={() => handleViewCase(message.caseInfo!.id)}
                >
                  <image
                    src={message.caseInfo.image}
                    className='case-image'
                    mode='aspectFill'
                  />
                  <View className='case-title'>{message.caseInfo.title}</View>
                </View>
              )}

              <View className='message-time'>{message.time}</View>
            </View>
          </View>
        ))}
        <View id='message-bottom' />
      </ScrollView>

      {/* 输入栏 */}
      <View className='input-bar'>
        <View className='extra-btn' onClick={handleSendImage}>
          📷
        </View>
        <Input
          className='message-input'
          placeholder='输入消息...'
          value={inputText}
          onInput={(e) => setInputText(e.detail.value)}
          confirmType='send'
          onConfirm={handleSend}
        />
        <View
          className={`send-btn ${inputText.trim() ? 'active' : ''}`}
          onClick={handleSend}
        >
          发送
        </View>
      </View>
    </View>
  )
}
