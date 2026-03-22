#!/bin/bash

# Script to run database seeds against RDS
# Usage: ./run-seed.sh <environment> <seed-file>
# Example: ./run-seed.sh development update_player_videos.sql

set -e

ENVIRONMENT=$1
SEED_FILE=$2

if [ -z "$ENVIRONMENT" ] || [ -z "$SEED_FILE" ]; then
    echo "Usage: ./run-seed.sh <environment> <seed-file>"
    echo "Example: ./run-seed.sh development update_player_videos.sql"
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
echo "Running seed: $SEED_FILE"

# Set PGPASSWORD environment variable for psql
export PGPASSWORD="$DB_PASSWORD"

# Run the seed
psql -h "$DB_HOST" \
     -p "$DB_PORT" \
     -U "$DB_USER" \
     -d "$DB_NAME" \
     -f "../database/seeds/$SEED_FILE"

# Unset password
unset PGPASSWORD

echo "Seed completed successfully!"
