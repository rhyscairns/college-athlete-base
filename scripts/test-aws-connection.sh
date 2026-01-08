#!/bin/bash

# Script to test AWS development environment connectivity
# This helps verify that you can connect to RDS and Redis from your local machine

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo "🔍 Testing AWS Development Environment Connectivity"
echo "=================================================="
echo ""

# Check if .env.dev exists
if [ ! -f ".env.dev" ]; then
    print_error ".env.dev file not found!"
    echo ""
    echo "Please create .env.dev first:"
    echo "  1. Run: ./scripts/get-dev-credentials.sh"
    echo "  2. Or manually: cp .env.dev.example .env.dev"
    echo ""
    exit 1
fi

print_success "Found .env.dev file"
echo ""

# Load environment variables
export $(grep -v '^#' .env.dev | xargs)

# Extract connection details
if [ -n "$DATABASE_URL" ]; then
    # Parse DATABASE_URL
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
else
    DB_HOST=$DATABASE_HOST
    DB_PORT=$DATABASE_PORT
    DB_USER=$DATABASE_USER
    DB_NAME=$DATABASE_NAME
fi

# Extract Redis details
if [ -n "$REDIS_URL" ]; then
    REDIS_HOST=$(echo $REDIS_URL | sed -n 's/redis:\/\/\([^:]*\).*/\1/p')
    REDIS_PORT=$(echo $REDIS_URL | sed -n 's/.*:\([0-9]*\).*/\1/p')
    if [ -z "$REDIS_PORT" ]; then
        REDIS_PORT=6379
    fi
fi

echo "📋 Connection Details:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Database:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""
if [ -n "$REDIS_HOST" ]; then
    echo "Redis:"
    echo "  Host: $REDIS_HOST"
    echo "  Port: $REDIS_PORT"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test 1: Check if nc (netcat) is available
echo "🔧 Checking prerequisites..."
if ! command -v nc &> /dev/null; then
    print_warning "netcat (nc) not found - skipping network tests"
    NC_AVAILABLE=false
else
    print_success "netcat (nc) is available"
    NC_AVAILABLE=true
fi
echo ""

# Test 2: Network connectivity to database
if [ "$NC_AVAILABLE" = true ] && [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ]; then
    echo "🌐 Testing database network connectivity..."
    if nc -z -w 5 "$DB_HOST" "$DB_PORT" 2>/dev/null; then
        print_success "Database port $DB_PORT is reachable on $DB_HOST"
    else
        print_error "Cannot reach database at $DB_HOST:$DB_PORT"
        echo ""
        print_info "Possible solutions:"
        echo "  1. Connect to VPN"
        echo "  2. Set up SSH tunnel: ssh -L $DB_PORT:$DB_HOST:$DB_PORT user@bastion"
        echo "  3. Add your IP to security group"
        echo ""
        echo "See docs/AWS_DEV_ENVIRONMENT_ACCESS.md for details"
    fi
    echo ""
fi

# Test 3: Network connectivity to Redis
if [ "$NC_AVAILABLE" = true ] && [ -n "$REDIS_HOST" ] && [ -n "$REDIS_PORT" ]; then
    echo "🌐 Testing Redis network connectivity..."
    if nc -z -w 5 "$REDIS_HOST" "$REDIS_PORT" 2>/dev/null; then
        print_success "Redis port $REDIS_PORT is reachable on $REDIS_HOST"
    else
        print_error "Cannot reach Redis at $REDIS_HOST:$REDIS_PORT"
        echo ""
        print_info "Possible solutions:"
        echo "  1. Connect to VPN"
        echo "  2. Set up SSH tunnel: ssh -L $REDIS_PORT:$REDIS_HOST:$REDIS_PORT user@bastion"
        echo "  3. Add your IP to security group"
    fi
    echo ""
fi

# Test 4: Check if psql is available for database testing
echo "🔧 Checking database client tools..."
if command -v psql &> /dev/null; then
    print_success "psql is available"
    
    if [ -n "$DATABASE_PASSWORD" ] && [ "$NC_AVAILABLE" = true ]; then
        echo ""
        echo "🗄️  Testing database connection with psql..."
        
        # Test connection
        PGPASSWORD=$DATABASE_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            print_success "Successfully connected to database!"
            
            # Get database version
            DB_VERSION=$(PGPASSWORD=$DATABASE_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT version();" 2>/dev/null | head -n 1 | xargs)
            echo "  Version: $DB_VERSION"
            
            # Get table count
            TABLE_COUNT=$(PGPASSWORD=$DATABASE_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
            echo "  Tables: $TABLE_COUNT"
            
            # Check if players table exists
            PLAYERS_EXISTS=$(PGPASSWORD=$DATABASE_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'players');" 2>/dev/null | xargs)
            
            if [ "$PLAYERS_EXISTS" = "t" ]; then
                PLAYER_COUNT=$(PGPASSWORD=$DATABASE_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM players;" 2>/dev/null | xargs)
                echo "  Players: $PLAYER_COUNT"
            else
                print_warning "Players table does not exist - run migrations"
            fi
        else
            print_error "Failed to connect to database"
            echo ""
            print_info "Check:"
            echo "  1. Password is correct in .env.dev"
            echo "  2. Network connectivity is working"
            echo "  3. Database is running in AWS Console"
        fi
    fi
else
    print_warning "psql not found - skipping database connection test"
    echo "  Install: brew install postgresql (macOS) or apt-get install postgresql-client (Linux)"
fi
echo ""

# Test 5: Check if redis-cli is available for Redis testing
echo "🔧 Checking Redis client tools..."
if command -v redis-cli &> /dev/null; then
    print_success "redis-cli is available"
    
    if [ -n "$REDIS_HOST" ] && [ "$NC_AVAILABLE" = true ]; then
        echo ""
        echo "🔴 Testing Redis connection..."
        
        # Test connection
        REDIS_RESPONSE=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping 2>/dev/null)
        
        if [ "$REDIS_RESPONSE" = "PONG" ]; then
            print_success "Successfully connected to Redis!"
            
            # Get Redis info
            REDIS_VERSION=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" INFO server 2>/dev/null | grep "redis_version" | cut -d':' -f2 | tr -d '\r')
            echo "  Version: $REDIS_VERSION"
        else
            print_error "Failed to connect to Redis"
            echo ""
            print_info "Check:"
            echo "  1. Network connectivity is working"
            echo "  2. Redis is running in AWS Console"
        fi
    fi
else
    print_warning "redis-cli not found - skipping Redis connection test"
    echo "  Install: brew install redis (macOS) or apt-get install redis-tools (Linux)"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If all tests passed, you're ready to develop!"
echo ""
echo "Next steps:"
echo "  1. Switch to AWS database: ./scripts/switch-db.sh aws"
echo "  2. Start development: npm run dev"
echo "  3. Test API: curl http://localhost:3000/api/health"
echo ""
echo "For more information, see:"
echo "  docs/AWS_DEV_ENVIRONMENT_ACCESS.md"
echo ""
