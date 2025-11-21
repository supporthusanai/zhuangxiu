#!/bin/bash

#===============================================================================
# 装修小程序 - 一键部署脚本
# 支持开发环境和生产环境，零停机部署
#===============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 项目配置
PROJECT_NAME="zhuangxiu"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="${PROJECT_DIR}/server"
ADMIN_DIR="${PROJECT_DIR}/admin"
MINIAPP_DIR="${PROJECT_DIR}"
BACKUP_DIR="${PROJECT_DIR}/backups"
LOG_DIR="${PROJECT_DIR}/logs"
NGINX_CONF_DIR="/etc/nginx/sites-available"
PM2_APP_NAME="zhuangxiu-api"

# 默认端口
API_PORT=3000
ADMIN_PORT=8080

#===============================================================================
# 工具函数
#===============================================================================

print_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    装修小程序部署系统                        ║"
    echo "║                  Zero-Downtime Deployment                    ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_menu() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}请选择操作:${NC}\n"
    echo -e "  ${GREEN}[开发环境]${NC}"
    echo "    1) 启动全部开发服务"
    echo "    2) 仅启动后端 API"
    echo "    3) 仅启动管理后台"
    echo "    4) 启动小程序 (微信)"
    echo "    5) 启动 H5 前端"
    echo "    6) 停止开发环境"
    echo ""
    echo -e "  ${PURPLE}[生产环境]${NC}"
    echo "    7) 部署生产环境 (零停机)"
    echo "    8) 重启生产服务"
    echo "    9) 停止生产服务"
    echo ""
    echo -e "  ${CYAN}[服务管理]${NC}"
    echo "   10) 查看服务状态"
    echo "   11) 查看实时日志"
    echo "   12) 健康检查"
    echo ""
    echo -e "  ${YELLOW}[数据库管理]${NC}"
    echo "   13) 备份数据库"
    echo "   14) 恢复数据库"
    echo ""
    echo -e "  ${RED}[系统管理]${NC}"
    echo "   15) 初始化环境"
    echo "   16) 更新SSL证书"
    echo "   17) 清理日志"
    echo "   18) Docker Compose 管理"
    echo ""
    echo "    0) 退出"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

confirm() {
    read -p "$(echo -e ${YELLOW}$1 [y/N]: ${NC})" response
    case "$response" in
        [yY][eE][sS]|[yY]) return 0 ;;
        *) return 1 ;;
    esac
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 未安装"
        return 1
    fi
    return 0
}

#===============================================================================
# 环境检查
#===============================================================================

check_dependencies() {
    log_step "检查依赖..."

    local missing=()

    check_command "node" || missing+=("node")
    check_command "npm" || missing+=("npm")
    check_command "pm2" || missing+=("pm2")
    check_command "nginx" || missing+=("nginx")
    check_command "mongod" || missing+=("mongodb")
    check_command "redis-server" || missing+=("redis")

    if [ ${#missing[@]} -ne 0 ]; then
        log_error "缺少依赖: ${missing[*]}"
        echo ""
        echo "请安装缺失的依赖:"
        echo "  Node.js: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install -y nodejs"
        echo "  PM2: npm install -g pm2"
        echo "  Nginx: sudo apt install -y nginx"
        echo "  MongoDB: sudo apt install -y mongodb"
        echo "  Redis: sudo apt install -y redis-server"
        return 1
    fi

    log_info "所有依赖已安装 ✓"
    return 0
}

check_services() {
    log_step "检查服务状态..."

    # MongoDB
    if systemctl is-active --quiet mongod 2>/dev/null || pgrep -x mongod > /dev/null; then
        log_info "MongoDB: 运行中 ✓"
    else
        log_warn "MongoDB: 未运行"
        if confirm "是否启动 MongoDB?"; then
            sudo systemctl start mongod 2>/dev/null || mongod --fork --logpath /var/log/mongodb.log
        fi
    fi

    # Redis
    if systemctl is-active --quiet redis-server 2>/dev/null || pgrep -x redis-server > /dev/null; then
        log_info "Redis: 运行中 ✓"
    else
        log_warn "Redis: 未运行"
        if confirm "是否启动 Redis?"; then
            sudo systemctl start redis-server 2>/dev/null || redis-server --daemonize yes
        fi
    fi
}

#===============================================================================
# 开发环境
#===============================================================================

install_deps() {
    local dir=$1
    local name=$2
    cd "$dir"
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
        log_info "安装${name}依赖..."
        npm install
    else
        log_info "${name}依赖已安装 ✓"
    fi
}

start_dev_all() {
    log_step "启动全部开发服务..."
    check_services
    mkdir -p "${LOG_DIR}"

    # 安装依赖
    install_deps "${SERVER_DIR}" "后端"
    install_deps "${ADMIN_DIR}" "管理后台"
    install_deps "${MINIAPP_DIR}" "小程序"

    # 启动服务
    start_dev_server
    start_dev_admin
    start_dev_miniapp

    echo ""
    log_info "全部开发服务已启动 ✓"
    print_dev_urls
}

start_dev_server() {
    mkdir -p "${LOG_DIR}"
    install_deps "${SERVER_DIR}" "后端"

    # 检查是否已运行
    if [ -f "${LOG_DIR}/server-dev.pid" ]; then
        local pid=$(cat "${LOG_DIR}/server-dev.pid")
        if kill -0 "$pid" 2>/dev/null; then
            log_warn "后端服务已在运行 (PID: $pid)"
            return 0
        fi
    fi

    log_info "启动后端服务..."
    cd "${SERVER_DIR}"
    npm run dev > "${LOG_DIR}/server-dev.log" 2>&1 &
    echo $! > "${LOG_DIR}/server-dev.pid"
    sleep 2
    log_info "后端服务已启动: http://localhost:${API_PORT}"
}

start_dev_admin() {
    mkdir -p "${LOG_DIR}"
    install_deps "${ADMIN_DIR}" "管理后台"

    # 检查是否已运行
    if [ -f "${LOG_DIR}/admin-dev.pid" ]; then
        local pid=$(cat "${LOG_DIR}/admin-dev.pid")
        if kill -0 "$pid" 2>/dev/null; then
            log_warn "管理后台已在运行 (PID: $pid)"
            return 0
        fi
    fi

    log_info "启动管理后台..."
    cd "${ADMIN_DIR}"
    npm run dev > "${LOG_DIR}/admin-dev.log" 2>&1 &
    echo $! > "${LOG_DIR}/admin-dev.pid"
    sleep 2
    log_info "管理后台已启动: http://localhost:3001"
}

start_dev_miniapp() {
    mkdir -p "${LOG_DIR}"
    install_deps "${MINIAPP_DIR}" "小程序"

    # 检查是否已运行
    if [ -f "${LOG_DIR}/miniapp-dev.pid" ]; then
        local pid=$(cat "${LOG_DIR}/miniapp-dev.pid")
        if kill -0 "$pid" 2>/dev/null; then
            log_warn "小程序编译已在运行 (PID: $pid)"
            return 0
        fi
    fi

    log_info "启动小程序编译 (微信)..."
    cd "${MINIAPP_DIR}"
    npm run dev:weapp > "${LOG_DIR}/miniapp-dev.log" 2>&1 &
    echo $! > "${LOG_DIR}/miniapp-dev.pid"
    sleep 2
    log_info "小程序编译已启动，请用微信开发者工具打开 dist 目录"
}

start_dev_h5() {
    mkdir -p "${LOG_DIR}"
    install_deps "${MINIAPP_DIR}" "H5前端"

    # 检查是否已运行
    if [ -f "${LOG_DIR}/h5-dev.pid" ]; then
        local pid=$(cat "${LOG_DIR}/h5-dev.pid")
        if kill -0 "$pid" 2>/dev/null; then
            log_warn "H5服务已在运行 (PID: $pid)"
            return 0
        fi
    fi

    log_info "启动 H5 前端..."
    cd "${MINIAPP_DIR}"
    npm run dev:h5 > "${LOG_DIR}/h5-dev.log" 2>&1 &
    echo $! > "${LOG_DIR}/h5-dev.pid"
    sleep 3
    log_info "H5 前端已启动: http://localhost:10086"
}

print_dev_urls() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  服务地址:${NC}"
    echo -e "    后端 API:     http://localhost:${API_PORT}"
    echo -e "    管理后台:     http://localhost:3001"
    echo -e "    H5 前端:      http://localhost:10086 (如已启动)"
    echo -e "    小程序:       使用微信开发者工具打开 dist 目录"
    echo ""
    echo -e "${YELLOW}  日志文件:${NC}"
    echo -e "    后端:         ${LOG_DIR}/server-dev.log"
    echo -e "    管理后台:     ${LOG_DIR}/admin-dev.log"
    echo -e "    小程序:       ${LOG_DIR}/miniapp-dev.log"
    echo -e "    H5:           ${LOG_DIR}/h5-dev.log"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

stop_dev() {
    log_step "停止开发环境..."

    # 停止所有 pid 文件记录的进程
    for pid_file in "${LOG_DIR}"/*.pid; do
        if [ -f "$pid_file" ]; then
            pid=$(cat "$pid_file")
            name=$(basename "$pid_file" .pid)
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null || true
                log_info "已停止 ${name} (PID: $pid)"
            fi
            rm -f "$pid_file"
        fi
    done

    # 清理可能残留的进程
    pkill -f "ts-node-dev" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    pkill -f "taro" 2>/dev/null || true

    log_info "开发环境已停止 ✓"
}

#===============================================================================
# 生产环境部署
#===============================================================================

build_project() {
    log_step "构建项目..."

    # 构建后端
    log_info "构建后端..."
    cd "${SERVER_DIR}"
    npm install --production=false
    npm run build

    # 构建管理后台
    log_info "构建管理后台..."
    cd "${ADMIN_DIR}"
    npm install
    npm run build

    # 构建小程序
    log_info "构建小程序..."
    cd "${MINIAPP_DIR}"
    npm install
    npm run build:weapp

    log_info "项目构建完成 ✓"
}

deploy_production() {
    log_step "部署生产环境 (零停机)..."

    check_dependencies || return 1
    check_services

    # 构建项目
    build_project

    # 部署后端 (PM2 零停机重载)
    log_info "部署后端服务..."
    cd "${SERVER_DIR}"

    if pm2 describe "${PM2_APP_NAME}" > /dev/null 2>&1; then
        log_info "执行零停机重载..."
        pm2 reload "${PM2_APP_NAME}" --update-env
    else
        log_info "首次启动服务..."
        pm2 start ecosystem.config.js
    fi

    # 保存 PM2 配置
    pm2 save

    # 部署管理后台静态文件
    log_info "部署管理后台..."
    sudo mkdir -p /var/www/${PROJECT_NAME}/admin
    sudo cp -r "${ADMIN_DIR}/dist/"* /var/www/${PROJECT_NAME}/admin/

    # 重载 Nginx
    log_info "重载 Nginx..."
    sudo nginx -t && sudo nginx -s reload

    # 健康检查
    sleep 3
    health_check

    echo ""
    log_info "生产环境部署完成 ✓"
    echo ""
    echo -e "  ${GREEN}API 服务:${NC}     https://api.yourdomain.com"
    echo -e "  ${GREEN}管理后台:${NC}     https://admin.yourdomain.com"
    echo -e "  ${YELLOW}小程序:${NC}       请使用微信开发者工具上传 dist 目录"
    echo ""
}

restart_production() {
    log_step "重启生产服务..."

    if pm2 describe "${PM2_APP_NAME}" > /dev/null 2>&1; then
        pm2 reload "${PM2_APP_NAME}"
        log_info "服务重启完成 ✓"
    else
        log_error "服务未运行，请先部署"
    fi
}

stop_production() {
    log_step "停止生产服务..."

    if confirm "确定要停止生产服务吗?"; then
        pm2 stop "${PM2_APP_NAME}" 2>/dev/null || true
        log_info "服务已停止 ✓"
    fi
}

#===============================================================================
# 服务管理
#===============================================================================

show_status() {
    echo ""
    log_step "服务状态"
    echo ""

    # PM2 状态
    echo -e "${CYAN}=== PM2 进程 ===${NC}"
    pm2 list

    echo ""
    echo -e "${CYAN}=== 系统服务 ===${NC}"

    # MongoDB
    if systemctl is-active --quiet mongod 2>/dev/null || pgrep -x mongod > /dev/null; then
        echo -e "  MongoDB:      ${GREEN}运行中${NC}"
    else
        echo -e "  MongoDB:      ${RED}已停止${NC}"
    fi

    # Redis
    if systemctl is-active --quiet redis-server 2>/dev/null || pgrep -x redis-server > /dev/null; then
        echo -e "  Redis:        ${GREEN}运行中${NC}"
    else
        echo -e "  Redis:        ${RED}已停止${NC}"
    fi

    # Nginx
    if systemctl is-active --quiet nginx 2>/dev/null; then
        echo -e "  Nginx:        ${GREEN}运行中${NC}"
    else
        echo -e "  Nginx:        ${RED}已停止${NC}"
    fi

    echo ""
    echo -e "${CYAN}=== 端口监听 ===${NC}"
    netstat -tlnp 2>/dev/null | grep -E "(${API_PORT}|${ADMIN_PORT}|27017|6379|80|443)" || ss -tlnp | grep -E "(${API_PORT}|${ADMIN_PORT}|27017|6379|80|443)" || true
    echo ""
}

show_logs() {
    echo ""
    echo -e "${CYAN}选择要查看的日志:${NC}"
    echo "  1) API 服务日志"
    echo "  2) Nginx 访问日志"
    echo "  3) Nginx 错误日志"
    echo "  4) MongoDB 日志"
    echo "  5) 全部日志 (PM2)"
    echo ""
    read -p "请选择 [1-5]: " log_choice

    case $log_choice in
        1) pm2 logs "${PM2_APP_NAME}" --lines 100 ;;
        2) sudo tail -f /var/log/nginx/access.log ;;
        3) sudo tail -f /var/log/nginx/error.log ;;
        4) sudo tail -f /var/log/mongodb/mongod.log 2>/dev/null || tail -f /var/log/mongodb.log ;;
        5) pm2 logs --lines 100 ;;
        *) log_error "无效选择" ;;
    esac
}

health_check() {
    log_step "健康检查..."
    echo ""

    local api_url="http://localhost:${API_PORT}/api/v1/health"

    # API 健康检查
    echo -n "  API 服务: "
    if curl -sf "${api_url}" > /dev/null 2>&1; then
        response=$(curl -sf "${api_url}")
        echo -e "${GREEN}健康${NC} ✓"
        echo "    响应: $response"
    else
        echo -e "${RED}不健康${NC} ✗"
    fi

    # MongoDB 检查
    echo -n "  MongoDB: "
    if mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1 || mongo --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
        echo -e "${GREEN}健康${NC} ✓"
    else
        echo -e "${RED}不健康${NC} ✗"
    fi

    # Redis 检查
    echo -n "  Redis: "
    if redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}健康${NC} ✓"
    else
        echo -e "${RED}不健康${NC} ✗"
    fi

    echo ""
}

#===============================================================================
# 数据库管理
#===============================================================================

backup_database() {
    log_step "备份数据库..."

    mkdir -p "${BACKUP_DIR}"

    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_name="backup_${timestamp}"
    local backup_path="${BACKUP_DIR}/${backup_name}"

    # MongoDB 备份
    log_info "备份 MongoDB..."
    mongodump --db ${PROJECT_NAME} --out "${backup_path}/mongodb" 2>/dev/null || {
        log_error "MongoDB 备份失败"
        return 1
    }

    # Redis 备份
    log_info "备份 Redis..."
    redis-cli BGSAVE > /dev/null 2>&1
    sleep 2
    cp /var/lib/redis/dump.rdb "${backup_path}/redis_dump.rdb" 2>/dev/null || \
    cp /var/lib/redis/6379/dump.rdb "${backup_path}/redis_dump.rdb" 2>/dev/null || \
    log_warn "Redis 备份跳过 (找不到 dump.rdb)"

    # 压缩备份
    log_info "压缩备份文件..."
    cd "${BACKUP_DIR}"
    tar -czf "${backup_name}.tar.gz" "${backup_name}"
    rm -rf "${backup_name}"

    # 清理旧备份 (保留最近7天)
    find "${BACKUP_DIR}" -name "backup_*.tar.gz" -mtime +7 -delete 2>/dev/null || true

    log_info "备份完成: ${BACKUP_DIR}/${backup_name}.tar.gz"

    # 显示备份列表
    echo ""
    echo -e "${CYAN}现有备份:${NC}"
    ls -lh "${BACKUP_DIR}"/*.tar.gz 2>/dev/null || echo "  无备份文件"
    echo ""
}

restore_database() {
    log_step "恢复数据库..."

    # 列出可用备份
    echo ""
    echo -e "${CYAN}可用备份:${NC}"
    local backups=($(ls -1 "${BACKUP_DIR}"/*.tar.gz 2>/dev/null))

    if [ ${#backups[@]} -eq 0 ]; then
        log_error "没有可用的备份文件"
        return 1
    fi

    local i=1
    for backup in "${backups[@]}"; do
        echo "  $i) $(basename $backup)"
        ((i++))
    done

    echo ""
    read -p "请选择要恢复的备份 [1-${#backups[@]}]: " choice

    if [ "$choice" -lt 1 ] || [ "$choice" -gt ${#backups[@]} ]; then
        log_error "无效选择"
        return 1
    fi

    local selected_backup="${backups[$((choice-1))]}"

    if ! confirm "确定要恢复备份 $(basename $selected_backup)? 这将覆盖现有数据!"; then
        return 1
    fi

    # 解压备份
    local temp_dir=$(mktemp -d)
    tar -xzf "$selected_backup" -C "$temp_dir"
    local backup_dir=$(ls "$temp_dir")

    # 恢复 MongoDB
    log_info "恢复 MongoDB..."
    mongorestore --db ${PROJECT_NAME} --drop "${temp_dir}/${backup_dir}/mongodb/${PROJECT_NAME}" 2>/dev/null || {
        log_error "MongoDB 恢复失败"
        rm -rf "$temp_dir"
        return 1
    }

    # 恢复 Redis (如果存在)
    if [ -f "${temp_dir}/${backup_dir}/redis_dump.rdb" ]; then
        log_info "恢复 Redis..."
        sudo systemctl stop redis-server 2>/dev/null || true
        sudo cp "${temp_dir}/${backup_dir}/redis_dump.rdb" /var/lib/redis/dump.rdb 2>/dev/null || true
        sudo systemctl start redis-server 2>/dev/null || redis-server --daemonize yes
    fi

    rm -rf "$temp_dir"

    log_info "数据库恢复完成 ✓"
}

#===============================================================================
# 系统管理
#===============================================================================

init_environment() {
    log_step "初始化环境..."

    echo ""
    echo -e "${CYAN}选择初始化类型:${NC}"
    echo "  1) 开发环境初始化"
    echo "  2) 生产环境初始化"
    echo ""
    read -p "请选择 [1-2]: " init_type

    case $init_type in
        1) init_dev_env ;;
        2) init_prod_env ;;
        *) log_error "无效选择" ;;
    esac
}

init_dev_env() {
    log_step "初始化开发环境..."

    # 创建目录
    mkdir -p "${LOG_DIR}" "${BACKUP_DIR}"

    # 复制环境配置
    if [ ! -f "${SERVER_DIR}/.env" ]; then
        if [ -f "${SERVER_DIR}/.env.example" ]; then
            cp "${SERVER_DIR}/.env.example" "${SERVER_DIR}/.env"
            log_info "已创建 .env 文件，请编辑配置"
        fi
    fi

    # 安装依赖
    log_info "安装依赖..."
    cd "${SERVER_DIR}" && npm install
    cd "${ADMIN_DIR}" && npm install
    cd "${MINIAPP_DIR}" && npm install

    log_info "开发环境初始化完成 ✓"
}

init_prod_env() {
    log_step "初始化生产环境..."

    # 创建目录
    mkdir -p "${LOG_DIR}" "${BACKUP_DIR}"
    sudo mkdir -p /var/www/${PROJECT_NAME}/{admin,static}

    # 创建 PM2 配置
    create_pm2_config

    # 创建 Nginx 配置
    create_nginx_config

    # 创建日志轮转配置
    create_logrotate_config

    # 设置 PM2 开机启动
    pm2 startup 2>/dev/null || true

    log_info "生产环境初始化完成 ✓"
    log_warn "请编辑以下配置文件:"
    echo "  - ${SERVER_DIR}/.env"
    echo "  - /etc/nginx/sites-available/${PROJECT_NAME}"
}

create_pm2_config() {
    log_info "创建 PM2 配置..."

    cat > "${SERVER_DIR}/ecosystem.config.js" << 'PMEOF'
module.exports = {
  apps: [{
    name: 'zhuangxiu-api',
    script: 'dist/index.js',
    cwd: '/home/user/zhuangxiu/server',
    instances: 'max',  // 使用所有 CPU 核心
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    // 零停机部署配置
    wait_ready: true,
    listen_timeout: 10000,
    kill_timeout: 5000,
    // 日志配置
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: '/home/user/zhuangxiu/logs/pm2-error.log',
    out_file: '/home/user/zhuangxiu/logs/pm2-out.log',
    merge_logs: true,
    // 健康检查
    exp_backoff_restart_delay: 100,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
PMEOF

    log_info "PM2 配置已创建: ${SERVER_DIR}/ecosystem.config.js"
}

create_nginx_config() {
    log_info "创建 Nginx 配置..."

    sudo tee "/etc/nginx/sites-available/${PROJECT_NAME}" > /dev/null << 'NGINXEOF'
# 上游服务器 (API)
upstream zhuangxiu_api {
    least_conn;
    server 127.0.0.1:3000 weight=1 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name api.yourdomain.com admin.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# API 服务
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL 配置
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # API 代理
    location /api/ {
        proxy_pass http://zhuangxiu_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90s;
        proxy_connect_timeout 90s;
    }

    # WebSocket 支持
    location /socket.io/ {
        proxy_pass http://zhuangxiu_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 静态文件
    location /uploads/ {
        alias /home/user/zhuangxiu/server/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # 健康检查
    location /health {
        proxy_pass http://zhuangxiu_api/api/v1/health;
        proxy_http_version 1.1;
    }
}

# 管理后台
server {
    listen 443 ssl http2;
    server_name admin.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_protocols TLSv1.2 TLSv1.3;

    root /var/www/zhuangxiu/admin;
    index index.html;

    # Gzip
    gzip on;
    gzip_static on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINXEOF

    # 启用站点
    sudo ln -sf "/etc/nginx/sites-available/${PROJECT_NAME}" "/etc/nginx/sites-enabled/${PROJECT_NAME}" 2>/dev/null || true

    log_info "Nginx 配置已创建"
    log_warn "请修改域名和 SSL 证书路径"
}

create_logrotate_config() {
    log_info "创建日志轮转配置..."

    sudo tee "/etc/logrotate.d/${PROJECT_NAME}" > /dev/null << LOGEOF
${LOG_DIR}/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 $(whoami) $(whoami)
    sharedscripts
    postrotate
        pm2 reloadLogs > /dev/null 2>&1 || true
    endscript
}
LOGEOF

    log_info "日志轮转配置已创建"
}

update_ssl() {
    log_step "更新 SSL 证书..."

    echo ""
    echo -e "${CYAN}SSL 证书管理:${NC}"
    echo "  1) 申请新证书 (Let's Encrypt)"
    echo "  2) 续期证书"
    echo "  3) 查看证书状态"
    echo ""
    read -p "请选择 [1-3]: " ssl_choice

    case $ssl_choice in
        1)
            read -p "请输入域名 (多个用空格分隔): " domains
            sudo certbot --nginx -d ${domains}
            ;;
        2)
            sudo certbot renew
            sudo nginx -s reload
            ;;
        3)
            sudo certbot certificates
            ;;
        *)
            log_error "无效选择"
            ;;
    esac
}

clean_logs() {
    log_step "清理日志..."

    echo ""
    echo -e "${CYAN}选择清理范围:${NC}"
    echo "  1) 清理 7 天前的日志"
    echo "  2) 清理 30 天前的日志"
    echo "  3) 清理所有日志"
    echo ""
    read -p "请选择 [1-3]: " clean_choice

    case $clean_choice in
        1)
            find "${LOG_DIR}" -name "*.log" -mtime +7 -delete 2>/dev/null
            pm2 flush
            log_info "已清理 7 天前的日志"
            ;;
        2)
            find "${LOG_DIR}" -name "*.log" -mtime +30 -delete 2>/dev/null
            pm2 flush
            log_info "已清理 30 天前的日志"
            ;;
        3)
            if confirm "确定要清理所有日志?"; then
                rm -f "${LOG_DIR}"/*.log
                pm2 flush
                log_info "已清理所有日志"
            fi
            ;;
        *)
            log_error "无效选择"
            ;;
    esac
}

#===============================================================================
# Docker Compose 管理
#===============================================================================

docker_menu() {
    echo ""
    echo -e "${CYAN}Docker Compose 管理:${NC}"
    echo "  1) 启动所有服务"
    echo "  2) 停止所有服务"
    echo "  3) 重建并启动"
    echo "  4) 查看状态"
    echo "  5) 查看日志"
    echo "  6) 生成 docker-compose.yml"
    echo ""
    read -p "请选择 [1-6]: " docker_choice

    case $docker_choice in
        1)
            docker-compose up -d
            log_info "Docker 服务已启动"
            ;;
        2)
            docker-compose down
            log_info "Docker 服务已停止"
            ;;
        3)
            docker-compose down
            docker-compose build --no-cache
            docker-compose up -d
            log_info "Docker 服务已重建"
            ;;
        4)
            docker-compose ps
            ;;
        5)
            docker-compose logs -f --tail=100
            ;;
        6)
            create_docker_compose
            ;;
        *)
            log_error "无效选择"
            ;;
    esac
}

create_docker_compose() {
    log_info "生成 docker-compose.yml..."

    cat > "${PROJECT_DIR}/docker-compose.yml" << 'DOCKEREOF'
version: '3.8'

services:
  # API 服务
  api:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: zhuangxiu-api
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGODB_URI=mongodb://mongodb:27017/zhuangxiu
      - REDIS_URL=redis://redis:6379
    ports:
      - "3000:3000"
    depends_on:
      - mongodb
      - redis
    networks:
      - zhuangxiu-network
    volumes:
      - ./server/uploads:/app/uploads
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
      restart_policy:
        condition: on-failure

  # 管理后台
  admin:
    build:
      context: ./admin
      dockerfile: Dockerfile
    container_name: zhuangxiu-admin
    restart: unless-stopped
    ports:
      - "8080:80"
    networks:
      - zhuangxiu-network
    depends_on:
      - api

  # MongoDB
  mongodb:
    image: mongo:6.0
    container_name: zhuangxiu-mongodb
    restart: unless-stopped
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=your_password_here
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./backups/mongodb:/backup
    networks:
      - zhuangxiu-network
    command: --wiredTigerCacheSizeGB 1

  # Redis
  redis:
    image: redis:7-alpine
    container_name: zhuangxiu-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - zhuangxiu-network
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    container_name: zhuangxiu-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - api
      - admin
    networks:
      - zhuangxiu-network

  # Certbot (SSL 证书)
  certbot:
    image: certbot/certbot
    container_name: zhuangxiu-certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

networks:
  zhuangxiu-network:
    driver: bridge

volumes:
  mongodb_data:
  redis_data:
DOCKEREOF

    # 创建 Server Dockerfile
    cat > "${SERVER_DIR}/Dockerfile" << 'SERVEREOF'
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production=false
COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

ENV NODE_ENV=production
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "dist/index.js"]
SERVEREOF

    # 创建 Admin Dockerfile
    cat > "${ADMIN_DIR}/Dockerfile" << 'ADMINEOF'
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
ADMINEOF

    # 创建 Admin nginx.conf
    cat > "${ADMIN_DIR}/nginx.conf" << 'ADMINNGINXEOF'
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
ADMINNGINXEOF

    log_info "Docker 配置文件已生成"
    echo ""
    echo "生成的文件:"
    echo "  - ${PROJECT_DIR}/docker-compose.yml"
    echo "  - ${SERVER_DIR}/Dockerfile"
    echo "  - ${ADMIN_DIR}/Dockerfile"
    echo ""
    log_warn "请修改 docker-compose.yml 中的密码和域名配置"
}

#===============================================================================
# 主程序
#===============================================================================

main() {
    print_banner

    while true; do
        print_menu
        read -p "请输入选项 [0-18]: " choice

        case $choice in
            1) start_dev_all ;;
            2) start_dev_server ;;
            3) start_dev_admin ;;
            4) start_dev_miniapp ;;
            5) start_dev_h5 ;;
            6) stop_dev ;;
            7) deploy_production ;;
            8) restart_production ;;
            9) stop_production ;;
            10) show_status ;;
            11) show_logs ;;
            12) health_check ;;
            13) backup_database ;;
            14) restore_database ;;
            15) init_environment ;;
            16) update_ssl ;;
            17) clean_logs ;;
            18) docker_menu ;;
            0)
                echo ""
                log_info "再见！"
                exit 0
                ;;
            *)
                log_error "无效选项，请重新选择"
                ;;
        esac

        echo ""
        read -p "按 Enter 键继续..."
    done
}

# 支持命令行参数
if [ $# -gt 0 ]; then
    case $1 in
        dev) start_dev_all ;;
        dev:server) start_dev_server ;;
        dev:admin) start_dev_admin ;;
        dev:miniapp) start_dev_miniapp ;;
        dev:h5) start_dev_h5 ;;
        dev:stop) stop_dev ;;
        deploy) deploy_production ;;
        restart) restart_production ;;
        stop) stop_production ;;
        status) show_status ;;
        logs) show_logs ;;
        health) health_check ;;
        backup) backup_database ;;
        restore) restore_database ;;
        init) init_environment ;;
        ssl) update_ssl ;;
        clean) clean_logs ;;
        docker) docker_menu ;;
        help|--help|-h)
            echo "用法: $0 [命令]"
            echo ""
            echo "开发环境命令:"
            echo "  dev          启动全部开发服务"
            echo "  dev:server   仅启动后端 API"
            echo "  dev:admin    仅启动管理后台"
            echo "  dev:miniapp  启动小程序编译"
            echo "  dev:h5       启动 H5 前端"
            echo "  dev:stop     停止开发环境"
            echo ""
            echo "生产环境命令:"
            echo "  deploy       部署生产环境 (零停机)"
            echo "  restart      重启生产服务"
            echo "  stop         停止生产服务"
            echo ""
            echo "管理命令:"
            echo "  status       查看服务状态"
            echo "  logs         查看日志"
            echo "  health       健康检查"
            echo "  backup       备份数据库"
            echo "  restore      恢复数据库"
            echo "  init         初始化环境"
            echo "  ssl          SSL 证书管理"
            echo "  clean        清理日志"
            echo "  docker       Docker 管理"
            echo ""
            echo "不带参数运行将进入交互式菜单"
            ;;
        *)
            log_error "未知命令: $1"
            echo "使用 '$0 help' 查看帮助"
            exit 1
            ;;
    esac
else
    main
fi
