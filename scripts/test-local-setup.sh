#!/bin/bash

# Script to test local development setup
# Tests both Docker-based and AWS-connected setups

echo "🧪 Testing Local Development Setup"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗${NC} $2"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Test 1: Check if Docker is installed
echo "📦 Testing Docker Setup..."
if command -v docker &> /dev/null; then
    test_result 0 "Docker is installed"
else
    test_result 1 "Docker is not installed"
fi

# Test 2: Check if Docker Compose is available
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    test_result 0 "Docker Compose is available"
else
    test_result 1 "Docker Compose is not available"
fi

# Test 3: Check if Node.js is installed
echo ""
echo "📦 Testing Node.js Setup..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    test_result 0 "Node.js is installed ($NODE_VERSION)"
    
    # Check Node version is 18+
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        test_result 0 "Node.js version is 18 or higher"
    else
        test_result 1 "Node.js version is below 18 (found $NODE_VERSION)"
    fi
else
    test_result 1 "Node.js is not installed"
fi

# Test 4: Check if npm is installed
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    test_result 0 "npm is installed ($NPM_VERSION)"
else
    test_result 1 "npm is not installed"
fi

# Test 5: Check if node_modules exists
echo ""
echo "📦 Testing Project Dependencies..."
if [ -d "node_modules" ]; then
    test_result 0 "node_modules directory exists"
else
    test_result 1 "node_modules directory not found (run: npm install)"
fi

# Test 6: Check if package.json exists
if [ -f "package.json" ]; then
    test_result 0 "package.json exists"
else
    test_result 1 "package.json not found"
fi

# Test 7: Test Docker Compose setup
echo ""
echo "🐳 Testing Docker Compose Setup..."
echo "   Starting containers..."

if docker-compose up -d > /dev/null 2>&1; then
    test_result 0 "Docker containers started successfully"
    
    # Wait for services to be ready
    echo "   Waiting for services to be ready..."
    sleep 10
    
    # Test 8: Check if app container is running
    if docker-compose ps | grep -q "college-athlete-base-app.*Up"; then
        test_result 0 "App container is running"
    else
        test_result 1 "App container is not running"
    fi
    
    # Test 9: Check if database container is healthy
    if docker-compose ps | grep -q "college-athlete-base-db.*Up.*healthy"; then
        test_result 0 "Database container is healthy"
    else
        test_result 1 "Database container is not healthy"
    fi
    
    # Test 10: Check if Redis container is healthy
    if docker-compose ps | grep -q "college-athlete-base-redis.*Up.*healthy"; then
        test_result 0 "Redis container is healthy"
    else
        test_result 1 "Redis container is not healthy"
    fi
    
    # Test 11: Test health endpoint
    echo ""
    echo "🌐 Testing Application Endpoints..."
    if curl -s http://localhost:3000/api/health | grep -q "ok"; then
        test_result 0 "Health endpoint responds correctly"
    else
        test_result 1 "Health endpoint not responding"
    fi
    
    # Test 12: Test home page
    if curl -s http://localhost:3000 | grep -q "College Athlete Base"; then
        test_result 0 "Home page loads successfully"
    else
        test_result 1 "Home page not loading"
    fi
    
    # Test 13: Test database connection
    if docker exec college-athlete-base-db psql -U postgres -d college_athlete_base -c "SELECT 1;" > /dev/null 2>&1; then
        test_result 0 "Database is accessible"
    else
        test_result 1 "Database is not accessible"
    fi
    
    # Test 14: Test Redis connection
    if docker exec college-athlete-base-redis redis-cli ping | grep -q "PONG"; then
        test_result 0 "Redis is accessible"
    else
        test_result 1 "Redis is not accessible"
    fi
    
    # Cleanup
    echo ""
    echo "🧹 Cleaning up..."
    docker-compose down > /dev/null 2>&1
    test_result 0 "Containers stopped and removed"
    
else
    test_result 1 "Failed to start Docker containers"
fi

# Test AWS CLI (optional)
echo ""
echo "☁️  Testing AWS Setup (Optional)..."
if command -v aws &> /dev/null; then
    test_result 0 "AWS CLI is installed"
    
    # Check if AWS credentials are configured
    if aws sts get-caller-identity > /dev/null 2>&1; then
        test_result 0 "AWS credentials are configured"
    else
        echo -e "${YELLOW}⚠${NC}  AWS credentials not configured (optional for local Docker setup)"
    fi
else
    echo -e "${YELLOW}⚠${NC}  AWS CLI not installed (optional for local Docker setup)"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Passed:${NC} $TESTS_PASSED"
echo -e "${RED}Failed:${NC} $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "Your local development environment is ready! 🎉"
    echo ""
    echo "Next steps:"
    echo "  1. Run: npm run docker:up"
    echo "  2. Visit: http://localhost:3000"
    echo "  3. Start coding!"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    echo ""
    echo "Please fix the issues above before proceeding."
    echo ""
    echo "Common fixes:"
    echo "  - Install Docker: https://docs.docker.com/get-docker/"
    echo "  - Install Node.js 18+: https://nodejs.org/"
    echo "  - Run: npm install"
    echo ""
    exit 1
fi
