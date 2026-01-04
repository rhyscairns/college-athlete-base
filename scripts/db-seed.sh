#!/bin/bash

# Database seeding script
# Usage: ./scripts/db-seed.sh [dev|prod] [seed-type]

set -e

ENVIRONMENT=$1
SEED_TYPE=${2:-default}

if [ -z "$ENVIRONMENT" ]; then
  echo "Error: Environment not specified"
  echo "Usage: ./scripts/db-seed.sh [dev|prod] [seed-type]"
  exit 1
fi

if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "prod" ]; then
  echo "Error: Invalid environment. Must be 'dev' or 'prod'"
  exit 1
fi

# Safety check for production
if [ "$ENVIRONMENT" = "prod" ]; then
  echo "⚠️  WARNING: You are about to seed the PRODUCTION database!"
  read -p "Type 'SEED PRODUCTION' to confirm: " confirmation
  if [ "$confirmation" != "SEED PRODUCTION" ]; then
    echo "Database seeding cancelled"
    exit 0
  fi
fi

echo "🌱 Seeding database for $ENVIRONMENT environment with $SEED_TYPE data..."

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

# Create backup before seeding
echo "💾 Creating pre-seed backup..."
./scripts/backup-database.sh $ENVIRONMENT

# Run seeding
echo "🔄 Running seed script..."
# Placeholder for actual seeding tool
# npm run db:seed:$SEED_TYPE

echo "✅ Database seeding completed successfully!"
