#!/bin/bash

# Health check script for deployed environments
# Usage: ./scripts/health-check.sh [domain]

set -e

DOMAIN=$1
MAX_RETRIES=30
RETRY_DELAY=10

if [ -z "$DOMAIN" ]; then
  echo "Error: Domain not specified"
  echo "Usage: ./scripts/health-check.sh [domain]"
  exit 1
fi

HEALTH_URL="https://$DOMAIN/api/health"

echo "🔍 Checking health of $DOMAIN..."

for i in $(seq 1 $MAX_RETRIES); do
  echo "Attempt $i/$MAX_RETRIES..."
  
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL || echo "000")
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Health check passed! Application is healthy."
    
    # Get detailed health info
    HEALTH_RESPONSE=$(curl -s $HEALTH_URL)
    echo "Health response: $HEALTH_RESPONSE"
    exit 0
  fi
  
  echo "Health check failed with HTTP code: $HTTP_CODE"
  
  if [ $i -lt $MAX_RETRIES ]; then
    echo "Retrying in $RETRY_DELAY seconds..."
    sleep $RETRY_DELAY
  fi
done

echo "❌ Health check failed after $MAX_RETRIES attempts"
exit 1
