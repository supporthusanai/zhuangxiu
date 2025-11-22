#!/bin/bash

################################################################################
# MongoDB 备份脚本
# 用途：定时备份 MongoDB 数据库，支持压缩和清理旧备份
# 使用方法：./backup-mongodb.sh
# Crontab 示例：0 2 * * * /path/to/backup-mongodb.sh
################################################################################

# 设置严格模式
set -euo pipefail

# 配置变量
BACKUP_DIR="${BACKUP_DIR:-/var/backups/mongodb}"
MONGO_HOST="${MONGO_HOST:-localhost}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_DB="${MONGO_DB:-zhuangxiu}"
MONGO_USER="${MONGO_USER:-}"
MONGO_PASSWORD="${MONGO_PASSWORD:-}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"  # 保留7天的备份

# 日志配置
LOG_FILE="${BACKUP_DIR}/backup.log"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="mongodb_${MONGO_DB}_${DATE}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "${LOG_FILE}"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "${LOG_FILE}"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "${LOG_FILE}"
}

# 检查依赖
check_dependencies() {
    if ! command -v mongodump &> /dev/null; then
        log_error "mongodump 未安装，请先安装 MongoDB Database Tools"
        exit 1
    fi

    if ! command -v gzip &> /dev/null; then
        log_warning "gzip 未安装，备份将不会被压缩"
    fi
}

# 创建备份目录
create_backup_dir() {
    if [ ! -d "${BACKUP_DIR}" ]; then
        mkdir -p "${BACKUP_DIR}"
        log "创建备份目录: ${BACKUP_DIR}"
    fi
}

# 执行备份
perform_backup() {
    log "开始备份 MongoDB 数据库: ${MONGO_DB}"
    log "备份路径: ${BACKUP_PATH}"

    # 构建 mongodump 命令
    MONGODUMP_CMD="mongodump --host ${MONGO_HOST} --port ${MONGO_PORT} --db ${MONGO_DB} --out ${BACKUP_PATH}"

    # 如果提供了认证信息
    if [ -n "${MONGO_USER}" ] && [ -n "${MONGO_PASSWORD}" ]; then
        MONGODUMP_CMD="${MONGODUMP_CMD} --username ${MONGO_USER} --password ${MONGO_PASSWORD} --authenticationDatabase admin"
    fi

    # 执行备份
    if ${MONGODUMP_CMD} >> "${LOG_FILE}" 2>&1; then
        log_success "数据库备份成功"

        # 压缩备份
        if command -v gzip &> /dev/null; then
            log "压缩备份文件..."
            tar -czf "${BACKUP_PATH}.tar.gz" -C "${BACKUP_DIR}" "${BACKUP_NAME}"

            if [ $? -eq 0 ]; then
                # 删除未压缩的备份
                rm -rf "${BACKUP_PATH}"
                log_success "备份已压缩: ${BACKUP_PATH}.tar.gz"

                # 获取备份文件大小
                BACKUP_SIZE=$(du -h "${BACKUP_PATH}.tar.gz" | cut -f1)
                log "备份大小: ${BACKUP_SIZE}"
            else
                log_error "压缩失败"
            fi
        fi
    else
        log_error "数据库备份失败"
        exit 1
    fi
}

# 清理旧备份
cleanup_old_backups() {
    log "清理 ${RETENTION_DAYS} 天前的旧备份..."

    DELETED_COUNT=$(find "${BACKUP_DIR}" -name "mongodb_${MONGO_DB}_*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete -print | wc -l)

    if [ "${DELETED_COUNT}" -gt 0 ]; then
        log_success "已删除 ${DELETED_COUNT} 个旧备份文件"
    else
        log "没有需要清理的旧备份"
    fi
}

# 验证备份
verify_backup() {
    if [ -f "${BACKUP_PATH}.tar.gz" ]; then
        log "验证备份文件完整性..."

        if tar -tzf "${BACKUP_PATH}.tar.gz" > /dev/null 2>&1; then
            log_success "备份文件验证成功"
        else
            log_error "备份文件损坏"
            exit 1
        fi
    fi
}

# 发送通知（可选）
send_notification() {
    # 这里可以添加邮件、Slack、钉钉等通知
    # 示例：curl -X POST https://hooks.slack.com/... -d "Backup completed"
    :
}

# 主函数
main() {
    log "=========================================="
    log "MongoDB 备份任务开始"
    log "=========================================="

    check_dependencies
    create_backup_dir
    perform_backup
    verify_backup
    cleanup_old_backups

    log "=========================================="
    log_success "MongoDB 备份任务完成"
    log "=========================================="

    # send_notification
}

# 运行主函数
main

exit 0
