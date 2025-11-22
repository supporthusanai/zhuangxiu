# 多阶段构建 - 生产环境 Dockerfile
# Stage 1: 构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖（包括 devDependencies）
RUN npm ci

# 复制源代码
COPY . .

# 构建 TypeScript
RUN npm run build

# 移除开发依赖
RUN npm prune --production

# Stage 2: 生产阶段
FROM node:20-alpine

# 设置环境变量
ENV NODE_ENV=production \
    PORT=3000

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 设置工作目录
WORKDIR /app

# 复制生产依赖和构建结果
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# 创建必要的目录
RUN mkdir -p uploads logs && \
    chown -R nodejs:nodejs /app

# 切换到非 root 用户
USER nodejs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/v1/ping', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })"

# 启动应用
CMD ["node", "dist/index.js"]
