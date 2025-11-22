import React, { Component, ReactNode, ErrorInfo } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 错误边界组件
 * 捕获子组件树中的 JavaScript 错误，记录错误日志，并显示降级 UI
 *
 * 使用方式：
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 更新 state 以保存错误信息
    this.setState({
      error,
      errorInfo,
    });

    // 调用用户提供的错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 这里可以将错误信息发送到错误日志服务
    this.logErrorToService(error, errorInfo);
  }

  /**
   * 将错误日志发送到服务器
   */
  logErrorToService(error: Error, errorInfo: ErrorInfo) {
    try {
      // 获取用户信息
      const userInfo = Taro.getStorageSync('userInfo') || {};

      // 构建错误日志数据
      const errorLog = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: process.env.TARO_ENV,
        userId: userInfo.id,
        page: Taro.getCurrentInstance().router?.path,
      };

      console.log('Error log:', errorLog);

      // 这里可以调用 API 将错误日志发送到服务器
      // api.logError(errorLog);

      // 或者使用第三方错误监控服务（如 Sentry）
      // Sentry.captureException(error);

    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }

  /**
   * 重置错误状态
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * 返回首页
   */
  handleGoHome = () => {
    Taro.reLaunch({
      url: '/pages/index/index',
    });
  };

  /**
   * 重新加载当前页面
   */
  handleReload = () => {
    const currentPage = Taro.getCurrentInstance().router?.path;
    if (currentPage) {
      Taro.reLaunch({
        url: `/${currentPage}`,
      });
    } else {
      this.handleReset();
    }
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // 如果提供了自定义降级 UI，则使用它
      if (fallback) {
        return fallback;
      }

      // 默认错误 UI
      return (
        <View className="error-boundary">
          <View className="error-boundary__container">
            {/* 错误图标 */}
            <View className="error-boundary__icon">⚠️</View>

            {/* 错误标题 */}
            <Text className="error-boundary__title">
              页面出错了
            </Text>

            {/* 错误描述 */}
            <Text className="error-boundary__message">
              抱歉，页面遇到了一些问题
            </Text>

            {/* 开发环境显示详细错误信息 */}
            {process.env.NODE_ENV === 'development' && error && (
              <View className="error-boundary__details">
                <Text className="error-boundary__details-title">
                  错误详情：
                </Text>
                <Text className="error-boundary__details-message">
                  {error.message}
                </Text>
              </View>
            )}

            {/* 操作按钮 */}
            <View className="error-boundary__actions">
              <Button
                className="error-boundary__button error-boundary__button--primary"
                onClick={this.handleReload}
              >
                重新加载
              </Button>

              <Button
                className="error-boundary__button error-boundary__button--secondary"
                onClick={this.handleGoHome}
              >
                返回首页
              </Button>
            </View>

            {/* 提示信息 */}
            <Text className="error-boundary__hint">
              如果问题持续存在，请联系客服
            </Text>
          </View>
        </View>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
