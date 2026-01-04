#!/bin/bash

# Deployment script for environment setup
# Usage: ./scripts/deploy-environment.sh [dev|prod]

set -e

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
  echo "Error: Environment not specified"
  echo "Usage: ./scripts/deploy-environment.sh [dev|prod]"
  exit 1
fi

if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "prod" ]; then
  echo "Error: Invalid environment. Must be 'dev' or 'prod'"
  exit 1
fi

echo "🚀 Starting deployment to $ENVIRONMENT environment..."

# Load environment-specific variables
if [ "$ENVIRONMENT" = "dev" ]; then
  DOMAIN="collegeathletebase-dev.com"
  STACK_NAME="DevStack"
elif [ "$ENVIRONMENT" = "prod" ]; then
  DOMAIN="collegeathletebase.com"
  STACK_NAME="ProdStack"
fi

echo "📦 Building application..."
npm run build

echo "🐳 Building Docker image..."
docker build -t college-athlete-base:$ENVIRONMENT .

echo "☁️  Deploying infrastructure..."
cd infrastructure
npm run deploy:$ENVIRONMENT
cd ..

echo "🔍 Running health checks..."
./scripts/health-check.sh $DOMAIN

echo "✅ Deployment to $ENVIRONMENT completed successfully!"
