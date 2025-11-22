#!/bin/bash

################################################################################
# 设置 MongoDB 备份 Cron 任务
# 用途：自动配置定时备份任务
# 使用方法：sudo ./setup-backup-cron.sh
################################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="${SCRIPT_DIR}/backup-mongodb.sh"

# 检查备份脚本是否存在
if [ ! -f "${BACKUP_SCRIPT}" ]; then
    echo "错误：备份脚本不存在: ${BACKUP_SCRIPT}"
    exit 1
fi

# 设置执行权限
chmod +x "${BACKUP_SCRIPT}"

# Cron 表达式（每天凌晨2点执行）
CRON_EXPRESSION="0 2 * * *"
CRON_JOB="${CRON_EXPRESSION} ${BACKUP_SCRIPT} >> /var/log/mongodb-backup.log 2>&1"

echo "=========================================="
echo "MongoDB 自动备份配置"
echo "=========================================="
echo "备份脚本: ${BACKUP_SCRIPT}"
echo "执行时间: 每天凌晨 2:00"
echo "=========================================="

# 检查 cron 任务是否已存在
if crontab -l 2>/dev/null | grep -q "${BACKUP_SCRIPT}"; then
    echo "Cron 任务已存在，跳过添加"
else
    # 添加到 crontab
    (crontab -l 2>/dev/null; echo "${CRON_JOB}") | crontab -
    echo "✅ Cron 任务已添加"
fi

# 显示当前的 cron 任务
echo ""
echo "当前的 Cron 任务:"
echo "=========================================="
crontab -l | grep "${BACKUP_SCRIPT}" || echo "无"
echo "=========================================="

echo ""
echo "提示："
echo "1. 查看 cron 任务: crontab -l"
echo "2. 编辑 cron 任务: crontab -e"
echo "3. 删除所有 cron 任务: crontab -r"
echo "4. 查看备份日志: tail -f /var/log/mongodb-backup.log"

exit 0
