#!/bin/bash

# Script to run database migrations against RDS
# Usage: ./run-migration.sh <environment> <migration-file>
# Example: ./run-migration.sh development 005_add_player_video_columns.sql

set -e

ENVIRONMENT=$1
MIGRATION_FILE=$2

if [ -z "$ENVIRONMENT" ] || [ -z "$MIGRATION_FILE" ]; then
    echo "Usage: ./run-migration.sh <environment> <migration-file>"
    echo "Example: ./run-migration.sh development 005_add_player_video_columns.sql"
    exit 1
fi

# Get database credentials from AWS Secrets Manager
echo "Fetching database credentials from Secrets Manager..."
SECRET_NAME="${ENVIRONMENT}/college-athlete-base/db-credentials"
SECRET_JSON=$(aws secretsmanager get-secret-value \
    --secret-id "$SECRET_NAME" \
    --query SecretString \
    --output text)

# Parse credentials
DB_HOST=$(echo "$SECRET_JSON" | jq -r '.host')
DB_PORT=$(echo "$SECRET_JSON" | jq -r '.port')
DB_NAME=$(echo "$SECRET_JSON" | jq -r '.dbname')
DB_USER=$(echo "$SECRET_JSON" | jq -r '.username')
DB_PASSWORD=$(echo "$SECRET_JSON" | jq -r '.password')

echo "Connecting to database: $DB_HOST:$DB_PORT/$DB_NAME"
echo "Running migration: $MIGRATION_FILE"

# Set PGPASSWORD environment variable for psql
export PGPASSWORD="$DB_PASSWORD"

# Run the migration
psql -h "$DB_HOST" \
     -p "$DB_PORT" \
     -U "$DB_USER" \
     -d "$DB_NAME" \
     -f "../database/migrations/$MIGRATION_FILE"

# Unset password
unset PGPASSWORD

echo "Migration completed successfully!"
