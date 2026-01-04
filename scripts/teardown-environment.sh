#!/bin/bash

# Teardown script for environment cleanup
# Usage: ./scripts/teardown-environment.sh [dev|prod]

set -e

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
  echo "Error: Environment not specified"
  echo "Usage: ./scripts/teardown-environment.sh [dev|prod]"
  exit 1
fi

if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "prod" ]; then
  echo "Error: Invalid environment. Must be 'dev' or 'prod'"
  exit 1
fi

# Safety check for production
if [ "$ENVIRONMENT" = "prod" ]; then
  echo "⚠️  WARNING: You are about to tear down the PRODUCTION environment!"
  read -p "Type 'DELETE PRODUCTION' to confirm: " confirmation
  if [ "$confirmation" != "DELETE PRODUCTION" ]; then
    echo "Teardown cancelled"
    exit 0
  fi
fi

echo "🗑️  Starting teardown of $ENVIRONMENT environment..."

# Backup database before teardown
if [ "$ENVIRONMENT" = "prod" ]; then
  echo "💾 Creating final backup..."
  ./scripts/backup-database.sh $ENVIRONMENT
fi

echo "☁️  Destroying infrastructure..."
cd infrastructure
npm run destroy:$ENVIRONMENT
cd ..

echo "🧹 Cleaning up local resources..."
docker rmi college-athlete-base:$ENVIRONMENT 2>/dev/null || true

echo "✅ Teardown of $ENVIRONMENT completed successfully!"
