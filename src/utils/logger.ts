/**
 * 前端日志工具
 * 在开发环境输出日志，生产环境不输出
 */

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * 普通日志
   */
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * 错误日志
   */
  error: (...args: any[]) => {
    if (isDev) {
      console.error(...args);
    }
  },

  /**
   * 警告日志
   */
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * 信息日志
   */
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args);
    }
  },

  /**
   * 调试日志
   */
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },
};

export default logger;
