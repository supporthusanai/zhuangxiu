import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// 日志级别
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// 根据环境设置日志级别
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// 日志颜色
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// 日志格式
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    let metaStr = '';

    // 如果有额外的元数据，格式化输出
    if (Object.keys(meta).length > 0) {
      // 过滤掉内部字段
      const filteredMeta = Object.keys(meta)
        .filter(key => !['Symbol(level)', 'Symbol(message)', 'Symbol(splat)'].includes(key))
        .reduce((obj: any, key) => {
          obj[key] = meta[key];
          return obj;
        }, {});

      if (Object.keys(filteredMeta).length > 0) {
        metaStr = '\n' + JSON.stringify(filteredMeta, null, 2);
      }
    }

    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

// 文件日志格式（不带颜色）
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.uncolorize(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    let metaStr = '';

    if (Object.keys(meta).length > 0) {
      const filteredMeta = Object.keys(meta)
        .filter(key => !['Symbol(level)', 'Symbol(message)', 'Symbol(splat)'].includes(key))
        .reduce((obj: any, key) => {
          obj[key] = meta[key];
          return obj;
        }, {});

      if (Object.keys(filteredMeta).length > 0) {
        metaStr = ' | ' + JSON.stringify(filteredMeta);
      }
    }

    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  })
);

// 日志目录
const logDir = process.env.LOG_DIR || 'logs';

// 传输配置
const transports = [
  // 控制台输出
  new winston.transports.Console({
    format,
  }),

  // 错误日志文件 - 每天轮转
  new DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: fileFormat,
    maxSize: '20m',
    maxFiles: '30d',
    zippedArchive: true,
  }),

  // 所有日志文件 - 每天轮转
  new DailyRotateFile({
    filename: path.join(logDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    format: fileFormat,
    maxSize: '20m',
    maxFiles: '30d',
    zippedArchive: true,
  }),

  // HTTP 请求日志
  new DailyRotateFile({
    filename: path.join(logDir, 'http-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'http',
    format: fileFormat,
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true,
  }),
];

// 创建 logger 实例
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  exitOnError: false,
});

// 创建 HTTP 日志的 stream
export const httpLoggerStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// 导出 logger
export default logger;

// 便捷方法
export const logInfo = (message: string, meta?: any) => logger.info(message, meta);
export const logError = (message: string, error?: any) => {
  if (error instanceof Error) {
    logger.error(message, {
      error: error.message,
      stack: error.stack,
    });
  } else {
    logger.error(message, error);
  }
};
export const logWarn = (message: string, meta?: any) => logger.warn(message, meta);
export const logDebug = (message: string, meta?: any) => logger.debug(message, meta);
export const logHttp = (message: string, meta?: any) => logger.http(message, meta);
