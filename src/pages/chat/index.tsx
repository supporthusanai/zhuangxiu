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
  const [chatTitle, setChatTitle] = useState('')
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState<Message[]>([])

  const scrollViewRef = useRef<any>(null)

  useEffect(() => {
    const params = Taro.getCurrentInstance().router?.params
    const type = params?.type || ''
    let title = '聊天'

    // 根据不同类型初始化聊天内容
    if (type === 'case') {
      // 从案例详情进入
      const caseId = params?.caseId || '1'
      const caseTitle = decodeURIComponent(params?.caseTitle || '案例')
      const designerName = decodeURIComponent(params?.designerName || '设计师')
      title = designerName
      setChatTitle(designerName)
      setUserName(designerName)

      const initialMessages: Message[] = [
        {
          id: '1',
          type: 'text',
          content: `您好！我对您的「${caseTitle}」很感兴趣，想咨询一些问题`,
          isSelf: false,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: '2',
          type: 'text',
          content: '您好！感谢您的关注，我会尽快为您解答。请问您有什么问题呢？',
          isSelf: true,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }
      ]
      setMessages(initialMessages)
    } else if (type === 'designer') {
      // 从设计师列表/详情进入
      const designerId = params?.designerId || '1'
      const designerName = decodeURIComponent(params?.designerName || '设计师')
      title = designerName
      setChatTitle(designerName)
      setUserName(designerName)

      const initialMessages: Message[] = [
        {
          id: '1',
          type: 'text',
          content: '您好！我想咨询一下装修设计的事情',
          isSelf: false,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: '2',
          type: 'text',
          content: '您好！很高兴为您服务。请问您有什么具体需求呢？',
          isSelf: true,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }
      ]
      setMessages(initialMessages)
    } else if (type === 'inquiry') {
      // 从咨询列表进入（商家端）
      const inquiryId = params?.inquiryId || ''
      const userId = params?.userId || ''
      const userName = decodeURIComponent(params?.userName || '用户')
      const caseTitle = params?.caseTitle ? decodeURIComponent(params.caseTitle) : ''
      title = userName
      setChatTitle(userName)
      setUserName(userName)

      // 加载历史消息（实际应该从后端获取）
      const initialMessages: Message[] = [
        {
          id: '1',
          type: 'text',
          content: caseTitle ? `您好，我对您的「${caseTitle}」很感兴趣` : '您好，我想咨询一下装修的事情',
          isSelf: false,
          time: '10:30'
        },
        {
          id: '2',
          type: 'text',
          content: '您好！感谢您的咨询，请问有什么可以帮到您的？',
          isSelf: true,
          time: '10:32'
        }
      ]
      setMessages(initialMessages)
    } else if (type === 'consult') {
      // 从首页预约咨询进入
      title = '客服'
      setChatTitle('客服')
      setUserName('客服')

      const initialMessages: Message[] = [
        {
          id: '1',
          type: 'text',
          content: '您好！我想咨询装修相关的服务',
          isSelf: false,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: '2',
          type: 'text',
          content: '您好！欢迎咨询，我们提供一站式装修服务。请问您需要什么类型的服务呢？',
          isSelf: true,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        }
      ]
      setMessages(initialMessages)
    } else {
      // 默认情况
      const userName = decodeURIComponent(params?.userName || '用户')
      title = userName
      setChatTitle(userName)
      setUserName(userName)
      setMessages([])
    }

    // 设置导航栏标题
    Taro.setNavigationBarTitle({
      title: title
    })

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
