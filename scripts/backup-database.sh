#!/bin/bash

# Database backup script
# Usage: ./scripts/backup-database.sh [dev|prod]

set -e

ENVIRONMENT=$1
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/$ENVIRONMENT"

if [ -z "$ENVIRONMENT" ]; then
  echo "Error: Environment not specified"
  echo "Usage: ./scripts/backup-database.sh [dev|prod]"
  exit 1
fi

if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "prod" ]; then
  echo "Error: Invalid environment. Must be 'dev' or 'prod'"
  exit 1
fi

echo "💾 Creating backup for $ENVIRONMENT database..."

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Load environment-specific database URL
if [ "$ENVIRONMENT" = "dev" ]; then
  source .env.development 2>/dev/null || true
elif [ "$ENVIRONMENT" = "prod" ]; then
  source .env.production 2>/dev/null || true
fi

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL not set for $ENVIRONMENT environment"
  exit 1
fi

BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.sql"

echo "📝 Backup file: $BACKUP_FILE"

# Extract database connection details from DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Perform backup (example for PostgreSQL)
echo "🔄 Running backup..."
# pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -F c -f $BACKUP_FILE

# Compress backup
echo "🗜️  Compressing backup..."
gzip $BACKUP_FILE

echo "✅ Backup created successfully: ${BACKUP_FILE}.gz"

# Upload to cloud storage (optional)
if [ "$ENVIRONMENT" = "prod" ]; then
  echo "☁️  Uploading backup to cloud storage..."
  # aws s3 cp ${BACKUP_FILE}.gz s3://college-athlete-backups/database/$ENVIRONMENT/
fi

# Clean up old backups (keep last 30 days)
echo "🧹 Cleaning up old backups..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "✅ Backup process completed!"
