#!/bin/bash

################################################################################
# MongoDB 恢复脚本
# 用途：从备份恢复 MongoDB 数据库
# 使用方法：./restore-mongodb.sh <backup_file>
# 示例：./restore-mongodb.sh /var/backups/mongodb/mongodb_zhuangxiu_20240101_120000.tar.gz
################################################################################

# 设置严格模式
set -euo pipefail

# 配置变量
MONGO_HOST="${MONGO_HOST:-localhost}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_DB="${MONGO_DB:-zhuangxiu}"
MONGO_USER="${MONGO_USER:-}"
MONGO_PASSWORD="${MONGO_PASSWORD:-}"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 检查参数
if [ $# -eq 0 ]; then
    log_error "请提供备份文件路径"
    echo "使用方法: $0 <backup_file>"
    echo "示例: $0 /var/backups/mongodb/mongodb_zhuangxiu_20240101_120000.tar.gz"
    exit 1
fi

BACKUP_FILE="$1"

# 检查依赖
check_dependencies() {
    if ! command -v mongorestore &> /dev/null; then
        log_error "mongorestore 未安装，请先安装 MongoDB Database Tools"
        exit 1
    fi

    if ! command -v tar &> /dev/null; then
        log_error "tar 未安装"
        exit 1
    fi
}

# 验证备份文件
validate_backup_file() {
    if [ ! -f "${BACKUP_FILE}" ]; then
        log_error "备份文件不存在: ${BACKUP_FILE}"
        exit 1
    fi

    log "验证备份文件: ${BACKUP_FILE}"

    if ! tar -tzf "${BACKUP_FILE}" > /dev/null 2>&1; then
        log_error "备份文件损坏或格式不正确"
        exit 1
    fi

    log_success "备份文件验证成功"
}

# 确认操作
confirm_restore() {
    log_warning "警告：此操作将替换数据库 ${MONGO_DB} 的所有数据"
    echo -n "是否继续？(yes/no): "
    read -r response

    if [ "${response}" != "yes" ]; then
        log "操作已取消"
        exit 0
    fi
}

# 解压备份
extract_backup() {
    TEMP_DIR=$(mktemp -d)
    log "解压备份到临时目录: ${TEMP_DIR}"

    if tar -xzf "${BACKUP_FILE}" -C "${TEMP_DIR}"; then
        log_success "备份解压成功"
        echo "${TEMP_DIR}"
    else
        log_error "解压失败"
        rm -rf "${TEMP_DIR}"
        exit 1
    fi
}

# 执行恢复
perform_restore() {
    local temp_dir=$1

    # 查找备份目录
    BACKUP_DATA_DIR=$(find "${temp_dir}" -type d -name "${MONGO_DB}" | head -n 1)

    if [ -z "${BACKUP_DATA_DIR}" ]; then
        log_error "在备份中找不到数据库 ${MONGO_DB}"
        rm -rf "${temp_dir}"
        exit 1
    fi

    log "开始恢复数据库: ${MONGO_DB}"
    log "数据源: ${BACKUP_DATA_DIR}"

    # 构建 mongorestore 命令
    MONGORESTORE_CMD="mongorestore --host ${MONGO_HOST} --port ${MONGO_PORT} --db ${MONGO_DB} --drop ${BACKUP_DATA_DIR}"

    # 如果提供了认证信息
    if [ -n "${MONGO_USER}" ] && [ -n "${MONGO_PASSWORD}" ]; then
        MONGORESTORE_CMD="${MONGORESTORE_CMD} --username ${MONGO_USER} --password ${MONGO_PASSWORD} --authenticationDatabase admin"
    fi

    # 执行恢复
    if ${MONGORESTORE_CMD}; then
        log_success "数据库恢复成功"
    else
        log_error "数据库恢复失败"
        rm -rf "${temp_dir}"
        exit 1
    fi

    # 清理临时目录
    rm -rf "${temp_dir}"
    log "清理临时文件"
}

# 主函数
main() {
    log "=========================================="
    log "MongoDB 恢复任务开始"
    log "=========================================="

    check_dependencies
    validate_backup_file
    confirm_restore

    TEMP_DIR=$(extract_backup)
    perform_restore "${TEMP_DIR}"

    log "=========================================="
    log_success "MongoDB 恢复任务完成"
    log "=========================================="
}

# 运行主函数
main

exit 0
