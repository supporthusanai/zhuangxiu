import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { connectMongoDB, connectRedis, closeDatabases } from './config/database';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';

// 加载环境变量
dotenv.config();

// 创建 Express 应用
const app: Application = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet()); // 安全头
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));
app.use(compression()); // 响应压缩
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined')); // 日志
app.use(express.json({ limit: '10mb' })); // JSON 解析
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL 编码解析

// 静态文件（上传）
app.use('/uploads', express.static(process.env.UPLOAD_DIR || 'uploads'));

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

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════╗
║                                            ║
║   🚀 装修小程序后端服务已启动              ║
║                                            ║
║   环境：${process.env.NODE_ENV || 'development'}
║   端口：${PORT}
║   时间：${new Date().toLocaleString('zh-CN')}
║                                            ║
╚════════════════════════════════════════════╝
      `);
    });

    // 优雅关闭
    process.on('SIGTERM', async () => {
      console.log('\n⚠️  收到 SIGTERM 信号，正在关闭服务器...');
      await closeDatabases();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('\n⚠️  收到 SIGINT 信号，正在关闭服务器...');
      await closeDatabases();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

// 启动应用
startServer();

export default app;
