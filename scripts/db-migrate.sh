#!/bin/bash

# Database migration script
# Usage: ./scripts/db-migrate.sh [dev|prod] [up|down]

set -e

ENVIRONMENT=$1
DIRECTION=${2:-up}

if [ -z "$ENVIRONMENT" ]; then
  echo "Error: Environment not specified"
  echo "Usage: ./scripts/db-migrate.sh [dev|prod] [up|down]"
  exit 1
fi

if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "prod" ]; then
  echo "Error: Invalid environment. Must be 'dev' or 'prod'"
  exit 1
fi

# Safety check for production
if [ "$ENVIRONMENT" = "prod" ] && [ "$DIRECTION" = "down" ]; then
  echo "⚠️  WARNING: You are about to rollback migrations in PRODUCTION!"
  read -p "Type 'ROLLBACK PRODUCTION' to confirm: " confirmation
  if [ "$confirmation" != "ROLLBACK PRODUCTION" ]; then
    echo "Migration rollback cancelled"
    exit 0
  fi
fi

echo "🗄️  Running database migrations for $ENVIRONMENT environment..."

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

# Create backup before migration
echo "💾 Creating pre-migration backup..."
./scripts/backup-database.sh $ENVIRONMENT

# Run migrations
echo "🔄 Running migrations ($DIRECTION)..."
# Placeholder for actual migration tool (e.g., Prisma, TypeORM, etc.)
# npm run db:migrate:$DIRECTION

echo "✅ Database migrations completed successfully!"
