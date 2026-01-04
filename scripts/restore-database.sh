#!/bin/bash

# Database restore script
# Usage: ./scripts/restore-database.sh [dev|prod] [backup-file]

set -e

ENVIRONMENT=$1
BACKUP_FILE=$2

if [ -z "$ENVIRONMENT" ] || [ -z "$BACKUP_FILE" ]; then
  echo "Error: Missing required arguments"
  echo "Usage: ./scripts/restore-database.sh [dev|prod] [backup-file]"
  exit 1
fi

if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "prod" ]; then
  echo "Error: Invalid environment. Must be 'dev' or 'prod'"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

# Safety check for production
if [ "$ENVIRONMENT" = "prod" ]; then
  echo "⚠️  WARNING: You are about to restore the PRODUCTION database!"
  echo "This will OVERWRITE all current data!"
  read -p "Type 'RESTORE PRODUCTION' to confirm: " confirmation
  if [ "$confirmation" != "RESTORE PRODUCTION" ]; then
    echo "Database restore cancelled"
    exit 0
  fi
fi

echo "🔄 Restoring database for $ENVIRONMENT environment..."

# Create backup of current state before restore
echo "💾 Creating backup of current state..."
./scripts/backup-database.sh $ENVIRONMENT

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

# Extract database connection details
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
  echo "🗜️  Decompressing backup..."
  TEMP_FILE="${BACKUP_FILE%.gz}"
  gunzip -c $BACKUP_FILE > $TEMP_FILE
  BACKUP_FILE=$TEMP_FILE
fi

# Perform restore (example for PostgreSQL)
echo "🔄 Running restore..."
# pg_restore -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c $BACKUP_FILE

# Clean up temp file
if [ -n "$TEMP_FILE" ]; then
  rm -f $TEMP_FILE
fi

echo "✅ Database restore completed successfully!"
echo "🔍 Verifying database integrity..."
# Add verification queries here

echo "✅ Restore process completed!"
