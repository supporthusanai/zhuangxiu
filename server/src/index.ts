import express, { Application } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import { envConfig } from './config/env'; // 必须在最前面导入，会验证环境变量
import { connectMongoDB, connectRedis, closeDatabases } from './config/database';
import { initSocket } from './config/socket';
import { swaggerSpec } from './config/swagger';
import logger, { httpLoggerStream } from './config/logger';
import { initQueueProcessors } from './queues';
import { closeQueues } from './config/queue';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { correlationId, responseTime, enhancedLogging } from './middleware/monitoring';

// 创建 Express 应用
const app: Application = express();
const httpServer = createServer(app);
const PORT = envConfig.PORT;

// 中间件（顺序很重要）
app.use(helmet()); // 安全头
app.use(cors({
  origin: envConfig.ALLOWED_ORIGINS,
  credentials: true,
}));
app.use(compression()); // 响应压缩

// 监控中间件
app.use(correlationId); // 请求追踪 ID
app.use(responseTime); // 响应时间监控
app.use(enhancedLogging); // 增强日志

app.use(morgan(
  envConfig.NODE_ENV === 'development' ? 'dev' : 'combined',
  { stream: httpLoggerStream }
)); // HTTP 日志

// Rate limiting - 全局 API 限流
app.use('/api/', apiLimiter);

app.use(express.json({ limit: '10mb' })); // JSON 解析
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL 编码解析

// 静态文件（上传）
app.use('/uploads', express.static(envConfig.UPLOAD_DIR));

// API 文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: '装修小程序 API 文档',
}));

// API 路由
app.use('/api/v1', routes);

// 404 处理
app.use(notFound);

// 错误处理
app.use(errorHandler);

// 启动服务器
const startServer = async (): Promise<void> => {
  try {
    // 连接数据库
    await connectMongoDB();
    await connectRedis();

    // 初始化 Socket.io
    const io = initSocket(httpServer);
    logger.info('✅ Socket.io 已初始化');

    // 初始化队列处理器
    initQueueProcessors();
    logger.info('✅ 队列处理器已初始化');

    // 启动服务器
    httpServer.listen(PORT, () => {
      logger.info(`
╔════════════════════════════════════════════╗
║                                            ║
║   🚀 装修小程序后端服务已启动              ║
║                                            ║
║   环境：${envConfig.NODE_ENV}
║   端口：${PORT}
║   时间：${new Date().toLocaleString('zh-CN')}
║   Socket.io: ✅ 已启用
║   API 文档: http://localhost:${PORT}/api-docs
║                                            ║
╚════════════════════════════════════════════╝
      `);
    });

    // 优雅关闭
    process.on('SIGTERM', async () => {
      logger.warn('⚠️  收到 SIGTERM 信号，正在关闭服务器...');
      await closeQueues();
      await closeDatabases();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.warn('⚠️  收到 SIGINT 信号，正在关闭服务器...');
      await closeQueues();
      await closeDatabases();
      process.exit(0);
    });
  } catch (error) {
    logger.error('❌ 服务器启动失败', error);
    process.exit(1);
  }
};

// 启动应用
startServer();

export default app;
