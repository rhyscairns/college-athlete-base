#!/bin/bash

# Script to run database seeds against local PostgreSQL
# Usage: ./run-seed-local.sh <seed-file>
# Example: ./run-seed-local.sh update_player_videos.sql

set -e

SEED_FILE=$1

if [ -z "$SEED_FILE" ]; then
    echo "Usage: ./run-seed-local.sh <seed-file>"
    echo "Example: ./run-seed-local.sh update_player_videos.sql"
    exit 1
fi

# Load environment variables from .env.local
if [ -f "../../.env.local" ]; then
    export $(grep -v '^#' ../../.env.local | grep -v '^$' | sed 's/#.*//' | xargs)
fi

echo "Connecting to local database: $DATABASE_HOST:$DATABASE_PORT/$DATABASE_NAME"
echo "Running seed: $SEED_FILE"

# Set PGPASSWORD environment variable for psql
export PGPASSWORD="$DATABASE_PASSWORD"

# Run the seed
psql -h "$DATABASE_HOST" \
     -p "$DATABASE_PORT" \
     -U "$DATABASE_USER" \
     -d "$DATABASE_NAME" \
     -f "../database/seeds/$SEED_FILE"

# Unset password
unset PGPASSWORD

echo "Seed completed successfully!"
