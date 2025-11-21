#!/usr/bin/env node
/**
 * 装修平台项目初始化脚本
 * 用于初始化项目环境、数据库和默认管理员账号
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT_DIR = path.resolve(__dirname, '..');
const SERVER_DIR = path.join(ROOT_DIR, 'server');
const WEB_DIR = path.join(ROOT_DIR, 'web');
const ADMIN_DIR = path.join(ROOT_DIR, 'admin');
const MINIAPP_DIR = path.join(ROOT_DIR, 'miniapp');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
};

// 创建命令行交互接口
function createReadline() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

// 异步问答
function question(rl, query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

// 检查命令是否存在
function commandExists(cmd) {
  try {
    execSync(`which ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// 执行命令
function runCommand(cmd, cwd = ROOT_DIR) {
  try {
    execSync(cmd, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    return false;
  }
}

// 检查环境依赖
function checkDependencies() {
  log.info('检查环境依赖...');

  const required = ['node', 'npm'];
  const optional = ['pnpm', 'yarn', 'mongod', 'redis-server'];

  let hasError = false;

  for (const cmd of required) {
    if (commandExists(cmd)) {
      log.success(`${cmd} 已安装`);
    } else {
      log.error(`${cmd} 未安装，请先安装`);
      hasError = true;
    }
  }

  for (const cmd of optional) {
    if (commandExists(cmd)) {
      log.success(`${cmd} 已安装`);
    } else {
      log.warn(`${cmd} 未安装（可选）`);
    }
  }

  // 检查 Node.js 版本
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10);
  if (majorVersion < 16) {
    log.error(`Node.js 版本过低 (${nodeVersion})，需要 16.0.0 或更高版本`);
    hasError = true;
  } else {
    log.success(`Node.js 版本: ${nodeVersion}`);
  }

  return !hasError;
}

// 创建环境配置文件
async function setupEnvFiles(rl) {
  log.info('配置环境变量...');

  // Server .env
  const serverEnvPath = path.join(SERVER_DIR, '.env');
  const serverEnvExample = path.join(SERVER_DIR, '.env.example');

  if (!fs.existsSync(serverEnvPath)) {
    if (fs.existsSync(serverEnvExample)) {
      fs.copyFileSync(serverEnvExample, serverEnvPath);
      log.success('已从 .env.example 创建 server/.env');
    } else {
      // 创建默认配置
      const mongoUri = await question(rl, 'MongoDB 连接地址 (默认: mongodb://localhost:27017/zhuangxiu): ');
      const redisUrl = await question(rl, 'Redis 连接地址 (默认: redis://localhost:6379): ');
      const jwtSecret = await question(rl, 'JWT 密钥 (默认随机生成): ');

      const envContent = `# 服务器配置
NODE_ENV=development
PORT=3000

# 数据库配置
MONGODB_URI=${mongoUri || 'mongodb://localhost:27017/zhuangxiu'}

# Redis配置
REDIS_URL=${redisUrl || 'redis://localhost:6379'}

# JWT配置
JWT_SECRET=${jwtSecret || generateSecret()}
JWT_EXPIRES_IN=7d

# 微信小程序配置（需要填写）
WECHAT_APPID=
WECHAT_SECRET=

# 短信服务配置（需要填写）
SMS_ACCESS_KEY_ID=
SMS_ACCESS_KEY_SECRET=
SMS_SIGN_NAME=
SMS_TEMPLATE_CODE=

# 文件上传配置
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
`;
      fs.writeFileSync(serverEnvPath, envContent);
      log.success('已创建 server/.env 配置文件');
    }
  } else {
    log.info('server/.env 已存在，跳过');
  }
}

// 生成随机密钥
function generateSecret(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 安装依赖
async function installDependencies(rl) {
  log.info('安装项目依赖...');

  const packageManager = commandExists('pnpm') ? 'pnpm' : 'npm';
  log.info(`使用包管理器: ${packageManager}`);

  const installAll = await question(rl, '是否安装所有项目依赖? (Y/n): ');

  if (installAll.toLowerCase() !== 'n') {
    const dirs = [
      { name: 'server', path: SERVER_DIR },
      { name: 'web', path: WEB_DIR },
      { name: 'admin', path: ADMIN_DIR },
      { name: 'miniapp', path: MINIAPP_DIR },
    ];

    for (const dir of dirs) {
      if (fs.existsSync(path.join(dir.path, 'package.json'))) {
        log.info(`安装 ${dir.name} 依赖...`);
        if (!runCommand(`${packageManager} install`, dir.path)) {
          log.error(`${dir.name} 依赖安装失败`);
        } else {
          log.success(`${dir.name} 依赖安装完成`);
        }
      }
    }
  }
}

// 初始化数据库和管理员
async function initDatabase(rl) {
  log.info('初始化数据库...');

  const initAdmin = await question(rl, '是否创建默认管理员账号? (Y/n): ');

  if (initAdmin.toLowerCase() !== 'n') {
    const phone = await question(rl, '管理员手机号 (默认: 13800000000): ');
    const password = await question(rl, '管理员密码 (默认: admin123): ');
    const nickname = await question(rl, '管理员昵称 (默认: 系统管理员): ');

    const adminConfig = {
      phone: phone || '13800000000',
      password: password || 'admin123',
      nickname: nickname || '系统管理员',
    };

    // 保存管理员配置用于初始化脚本
    const initScriptPath = path.join(SERVER_DIR, 'scripts', 'initAdmin.js');
    const initScript = `
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const adminConfig = ${JSON.stringify(adminConfig, null, 2)};

async function initAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('数据库连接成功');

    const User = require('../src/models/User').default;

    // 检查管理员是否已存在
    const existingAdmin = await User.findOne({ phone: adminConfig.phone });
    if (existingAdmin) {
      console.log('管理员账号已存在，更新权限...');
      existingAdmin.role = 'admin';
      await existingAdmin.save();
    } else {
      // 创建管理员
      await User.create({
        phone: adminConfig.phone,
        password: adminConfig.password,
        nickname: adminConfig.nickname,
        role: 'admin',
        isActive: true,
      });
      console.log('管理员账号创建成功');
    }

    console.log('管理员信息:');
    console.log('  手机号:', adminConfig.phone);
    console.log('  密码:', adminConfig.password);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('初始化失败:', error.message);
    process.exit(1);
  }
}

initAdmin();
`;

    // 确保目录存在
    const scriptsDir = path.join(SERVER_DIR, 'scripts');
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }

    fs.writeFileSync(initScriptPath, initScript);
    log.success('已创建管理员初始化脚本');

    const runNow = await question(rl, '是否现在执行初始化? (需要MongoDB服务运行) (Y/n): ');
    if (runNow.toLowerCase() !== 'n') {
      log.info('执行管理员初始化...');
      if (runCommand('node scripts/initAdmin.js', SERVER_DIR)) {
        log.success('管理员初始化完成');
      } else {
        log.error('管理员初始化失败，请确保MongoDB服务已启动');
        log.info('稍后可手动运行: cd server && node scripts/initAdmin.js');
      }
    } else {
      log.info('稍后可运行: cd server && node scripts/initAdmin.js');
    }
  }
}

// 显示完成信息
function showCompletionInfo() {
  console.log('\n' + '='.repeat(60));
  log.success('项目初始化完成！');
  console.log('='.repeat(60));
  console.log(`
启动开发服务器:
  ${colors.cyan}./deploy.sh dev${colors.reset}        - 启动后端API服务器
  ${colors.cyan}./deploy.sh dev:admin${colors.reset}  - 启动管理后台
  ${colors.cyan}./deploy.sh dev:web${colors.reset}    - 启动PC用户端
  ${colors.cyan}./deploy.sh dev:mini${colors.reset}   - 启动小程序开发

端口分配:
  API服务器:    http://localhost:3000
  管理后台:     http://localhost:3001
  PC用户端:     http://localhost:5000

默认管理员账号:
  手机号: 查看 server/scripts/initAdmin.js
  密码: 查看 server/scripts/initAdmin.js

注意事项:
  1. 确保 MongoDB 和 Redis 服务已启动
  2. 完善 server/.env 中的微信和短信配置
  3. 小程序开发需要配置 miniapp/project.config.json
`);
}

// 主函数
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('    装修平台项目初始化工具');
  console.log('='.repeat(60) + '\n');

  // 检查是否在项目根目录
  if (!fs.existsSync(path.join(ROOT_DIR, 'package.json'))) {
    log.error('请在项目根目录运行此脚本');
    process.exit(1);
  }

  // 检查环境依赖
  if (!checkDependencies()) {
    log.error('环境检查未通过，请安装缺失的依赖');
    process.exit(1);
  }

  const rl = createReadline();

  try {
    await setupEnvFiles(rl);
    await installDependencies(rl);
    await initDatabase(rl);
    showCompletionInfo();
  } catch (error) {
    log.error(`初始化失败: ${error.message}`);
  } finally {
    rl.close();
  }
}

main();
