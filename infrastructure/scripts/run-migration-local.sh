#!/bin/bash

# Script to run database migrations against local PostgreSQL
# Usage: ./run-migration-local.sh <migration-file>
# Example: ./run-migration-local.sh 005_add_player_video_columns.sql

set -e

MIGRATION_FILE=$1

if [ -z "$MIGRATION_FILE" ]; then
    echo "Usage: ./run-migration-local.sh <migration-file>"
    echo "Example: ./run-migration-local.sh 005_add_player_video_columns.sql"
    exit 1
fi

# Load environment variables from .env.local
if [ -f "../../.env.local" ]; then
    export $(grep -v '^#' ../../.env.local | grep -v '^$' | sed 's/#.*//' | xargs)
fi

echo "Connecting to local database: $DATABASE_HOST:$DATABASE_PORT/$DATABASE_NAME"
echo "Running migration: $MIGRATION_FILE"

# Set PGPASSWORD environment variable for psql
export PGPASSWORD="$DATABASE_PASSWORD"

# Run the migration
psql -h "$DATABASE_HOST" \
     -p "$DATABASE_PORT" \
     -U "$DATABASE_USER" \
     -d "$DATABASE_NAME" \
     -f "../database/migrations/$MIGRATION_FILE"

# Unset password
unset PGPASSWORD

echo "Migration completed successfully!"
