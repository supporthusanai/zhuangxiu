# MongoDB 备份和恢复脚本

本目录包含 MongoDB 数据库的自动备份和恢复脚本。

## 📁 文件说明

### 1. backup-mongodb.sh
MongoDB 自动备份脚本，支持压缩、日志记录和自动清理旧备份。

**功能特性：**
- ✅ 自动备份 MongoDB 数据库
- ✅ 备份文件压缩（gzip）
- ✅ 保留指定天数的备份（默认 7 天）
- ✅ 完整的日志记录
- ✅ 备份文件完整性验证
- ✅ 支持认证的 MongoDB 连接

### 2. restore-mongodb.sh
MongoDB 数据恢复脚本，用于从备份文件恢复数据库。

**功能特性：**
- ✅ 从压缩备份恢复数据
- ✅ 交互式确认操作
- ✅ 备份文件完整性验证
- ✅ 支持认证的 MongoDB 连接
- ✅ 自动清理临时文件

### 3. setup-backup-cron.sh
自动配置 Cron 定时任务脚本。

**功能特性：**
- ✅ 自动添加 Cron 任务
- ✅ 默认每天凌晨 2:00 执行备份
- ✅ 日志输出到 `/var/log/mongodb-backup.log`

---

## 🚀 快速开始

### 前置要求

1. 安装 MongoDB Database Tools：
```bash
# Ubuntu/Debian
sudo apt-get install mongodb-database-tools

# CentOS/RHEL
sudo yum install mongodb-database-tools

# macOS
brew install mongodb-database-tools
```

2. 确保有足够的磁盘空间用于备份

### 手动备份

```bash
# 1. 赋予执行权限
chmod +x backup-mongodb.sh

# 2. 设置环境变量（可选）
export MONGO_HOST=localhost
export MONGO_PORT=27017
export MONGO_DB=zhuangxiu
export BACKUP_DIR=/var/backups/mongodb

# 3. 执行备份
./backup-mongodb.sh
```

### 自动备份（Cron）

```bash
# 方式 1：使用自动配置脚本
sudo chmod +x setup-backup-cron.sh
sudo ./setup-backup-cron.sh

# 方式 2：手动添加 Cron 任务
crontab -e

# 添加以下行（每天凌晨 2:00 执行）
0 2 * * * /path/to/backup-mongodb.sh >> /var/log/mongodb-backup.log 2>&1

# 验证 Cron 任务
crontab -l
```

### 恢复备份

```bash
# 1. 赋予执行权限
chmod +x restore-mongodb.sh

# 2. 列出可用的备份
ls -lh /var/backups/mongodb/

# 3. 执行恢复（会提示确认）
./restore-mongodb.sh /var/backups/mongodb/mongodb_zhuangxiu_20240122_020000.tar.gz
```

---

## ⚙️ 配置选项

### 环境变量

#### 备份脚本（backup-mongodb.sh）

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `BACKUP_DIR` | 备份目录 | `/var/backups/mongodb` |
| `MONGO_HOST` | MongoDB 主机 | `localhost` |
| `MONGO_PORT` | MongoDB 端口 | `27017` |
| `MONGO_DB` | 数据库名称 | `zhuangxiu` |
| `MONGO_USER` | 用户名（可选） | 空 |
| `MONGO_PASSWORD` | 密码（可选） | 空 |
| `RETENTION_DAYS` | 备份保留天数 | `7` |

#### 恢复脚本（restore-mongodb.sh）

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `MONGO_HOST` | MongoDB 主机 | `localhost` |
| `MONGO_PORT` | MongoDB 端口 | `27017` |
| `MONGO_DB` | 数据库名称 | `zhuangxiu` |
| `MONGO_USER` | 用户名（可选） | 空 |
| `MONGO_PASSWORD` | 密码（可选） | 空 |

### 使用示例

#### 备份到自定义目录
```bash
BACKUP_DIR=/mnt/backups RETENTION_DAYS=30 ./backup-mongodb.sh
```

#### 备份认证的数据库
```bash
MONGO_USER=admin MONGO_PASSWORD=secret ./backup-mongodb.sh
```

#### 备份远程 MongoDB
```bash
MONGO_HOST=db.example.com MONGO_PORT=27017 ./backup-mongodb.sh
```

---

## 📊 Cron 时间表达式

| 表达式 | 说明 |
|--------|------|
| `0 2 * * *` | 每天凌晨 2:00 |
| `0 */6 * * *` | 每 6 小时一次 |
| `0 0 * * 0` | 每周日午夜 |
| `0 0 1 * *` | 每月 1 号午夜 |
| `*/30 * * * *` | 每 30 分钟 |

---

## 🔍 故障排查

### 备份失败

**问题：** `mongodump: command not found`

**解决：**
```bash
# 安装 MongoDB Database Tools
sudo apt-get install mongodb-database-tools
```

**问题：** `Permission denied`

**解决：**
```bash
# 赋予执行权限
chmod +x backup-mongodb.sh

# 确保备份目录有写权限
sudo chown -R $USER:$USER /var/backups/mongodb
```

**问题：** `Authentication failed`

**解决：**
```bash
# 确保用户名和密码正确
MONGO_USER=your_user MONGO_PASSWORD=your_password ./backup-mongodb.sh
```

### 恢复失败

**问题：** `Backup file is corrupted`

**解决：**
```bash
# 验证备份文件完整性
tar -tzf /path/to/backup.tar.gz

# 如果文件损坏，使用其他备份
```

### 日志查看

```bash
# 查看备份日志
tail -f /var/backups/mongodb/backup.log

# 查看 Cron 任务日志
tail -f /var/log/mongodb-backup.log

# 查看系统日志
sudo journalctl -u cron -f
```

---

## 📝 最佳实践

### 1. 定期测试恢复流程
```bash
# 每月至少测试一次恢复流程
./restore-mongodb.sh /var/backups/mongodb/latest_backup.tar.gz
```

### 2. 异地备份

```bash
# 将备份同步到云存储（例如 AWS S3）
aws s3 sync /var/backups/mongodb/ s3://your-bucket/mongodb-backups/

# 或使用 rsync 到远程服务器
rsync -avz /var/backups/mongodb/ user@remote-server:/backups/mongodb/
```

### 3. 监控备份状态

```bash
# 检查最近的备份
ls -lht /var/backups/mongodb/ | head -n 5

# 检查备份文件大小
du -sh /var/backups/mongodb/*

# 设置告警（如果备份超过 24 小时未更新）
find /var/backups/mongodb/ -name "*.tar.gz" -mtime +1
```

### 4. 安全建议

- ✅ 使用强密码保护 MongoDB
- ✅ 限制备份文件访问权限
```bash
chmod 600 /var/backups/mongodb/*.tar.gz
```
- ✅ 定期清理旧备份节省空间
- ✅ 加密备份文件（如有需要）
```bash
# 使用 GPG 加密
gpg --encrypt --recipient your-email backup.tar.gz
```

---

## 📦 备份文件命名规则

备份文件使用以下命名格式：
```
mongodb_<数据库名>_<时间戳>.tar.gz
```

示例：
```
mongodb_zhuangxiu_20240122_020000.tar.gz
  ↑      ↑        ↑
  |      |        └─ 时间戳 (YYYYMMdd_HHmmss)
  |      └────────── 数据库名
  └───────────────── 前缀
```

---

## 🆘 获取帮助

如果遇到问题：

1. 查看日志文件：`/var/backups/mongodb/backup.log`
2. 检查 Cron 任务：`crontab -l`
3. 验证 MongoDB 连接：`mongosh --host localhost --port 27017`
4. 检查磁盘空间：`df -h`

---

## 📄 许可证

MIT License
