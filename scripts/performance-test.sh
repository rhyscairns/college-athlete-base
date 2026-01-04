#!/bin/bash

# Performance testing script using Artillery or k6
# Usage: ./scripts/performance-test.sh [domain] [test-type]

set -e

DOMAIN=$1
TEST_TYPE=${2:-smoke}

if [ -z "$DOMAIN" ]; then
  echo "Error: Domain not specified"
  echo "Usage: ./scripts/performance-test.sh [domain] [test-type]"
  echo "Test types: smoke, load, stress, spike"
  exit 1
fi

BASE_URL="https://$DOMAIN"

echo "⚡ Running $TEST_TYPE performance test on $DOMAIN..."

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
  echo "⚠️  k6 not found. Install it from https://k6.io/docs/getting-started/installation/"
  echo "Alternatively, you can use Artillery: npm install -g artillery"
  exit 1
fi

# Create test results directory
RESULTS_DIR="test-results/performance"
mkdir -p $RESULTS_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_FILE="$RESULTS_DIR/${TEST_TYPE}_${TIMESTAMP}.json"

# Run the appropriate test
case $TEST_TYPE in
  smoke)
    echo "🔥 Running smoke test (1 VU, 1 minute)..."
    k6 run --vus 1 --duration 1m --out json=$RESULTS_FILE tests/performance/smoke.js
    ;;
  load)
    echo "📊 Running load test (10 VUs, 5 minutes)..."
    k6 run --vus 10 --duration 5m --out json=$RESULTS_FILE tests/performance/load.js
    ;;
  stress)
    echo "💪 Running stress test (ramping up to 100 VUs)..."
    k6 run --out json=$RESULTS_FILE tests/performance/stress.js
    ;;
  spike)
    echo "⚡ Running spike test (sudden traffic spike)..."
    k6 run --out json=$RESULTS_FILE tests/performance/spike.js
    ;;
  *)
    echo "Error: Invalid test type. Must be: smoke, load, stress, or spike"
    exit 1
    ;;
esac

echo "✅ Performance test completed!"
echo "📊 Results saved to: $RESULTS_FILE"
