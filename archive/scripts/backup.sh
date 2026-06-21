#!/bin/sh
# NirnayPath Production Database Backup Script
# Gzips MongoDB and Redis backups, rotates and retains last 7 days.

BACKUP_DIR="/var/backups/nirnaypath"
DATE_TAG=$(date +"%Y-%m-%d_%H%M%S")
MONGO_BACKUP_NAME="mongo_${DATE_TAG}"
REDIS_BACKUP_NAME="redis_${DATE_TAG}"

mkdir -p "${BACKUP_DIR}"

echo "[BACKUP] Starting backup routine: ${DATE_TAG}"

# 1. Backup MongoDB
if command -v mongodump > /dev/null; then
    echo "[BACKUP] Dumping MongoDB..."
    mongodump --uri="${MONGO_URI:-mongodb://localhost:27017/nirnaypath}" --archive="${BACKUP_DIR}/${MONGO_BACKUP_NAME}.archive" --gzip
    echo "[BACKUP] MongoDB backup created: ${MONGO_BACKUP_NAME}.archive"
else
    echo "[BACKUP] WARNING: mongodump not found. Skipping mongo database dump."
fi

# 2. Backup Redis
if command -v redis-cli > /dev/null; then
    echo "[BACKUP] Dumping Redis RDB data..."
    redis-cli save
    if [ -f "/data/dump.rdb" ]; then
        cp /data/dump.rdb "${BACKUP_DIR}/${REDIS_BACKUP_NAME}.rdb"
        gzip "${BACKUP_DIR}/${REDIS_BACKUP_NAME}.rdb"
        echo "[BACKUP] Redis backup created: ${REDIS_BACKUP_NAME}.rdb.gz"
    fi
else
    echo "[BACKUP] WARNING: redis-cli not found. Skipping redis data dump."
fi

# 3. Rotate older files (retain last 7 days)
echo "[BACKUP] Pruning files older than 7 days..."
find "${BACKUP_DIR}" -type f -mtime +7 -delete

echo "[BACKUP] Backup routine completed."
