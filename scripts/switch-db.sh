#!/bin/bash

# Script to switch between local and AWS development databases
# Usage: ./scripts/switch-db.sh [local|aws]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Check if argument provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 [local|aws]"
    echo ""
    echo "Options:"
    echo "  local  - Switch to local Docker database"
    echo "  aws    - Switch to AWS development database"
    echo ""
    echo "Examples:"
    echo "  $0 local"
    echo "  $0 aws"
    exit 1
fi

MODE=$1

case $MODE in
    local)
        echo "🔄 Switching to local Docker database..."
        echo ""
        
        # Check if .env.local.example exists
        if [ ! -f "$PROJECT_ROOT/.env.local.example" ]; then
            print_error ".env.local.example not found!"
            exit 1
        fi
        
        # Copy local config
        cp "$PROJECT_ROOT/.env.local.example" "$PROJECT_ROOT/.env.local"
        print_success "Copied .env.local.example to .env.local"
        
        # Check if Docker is running
        if ! docker info > /dev/null 2>&1; then
            print_warning "Docker is not running. Please start Docker Desktop."
            echo ""
            echo "After starting Docker, run:"
            echo "  docker-compose up -d"
            exit 0
        fi
        
        # Start Docker containers
        echo ""
        echo "Starting local database..."
        cd "$PROJECT_ROOT"
        docker-compose up -d
        
        # Wait for database to be ready
        echo "Waiting for database to be ready..."
        sleep 3
        
        # Check if database is running
        if docker-compose ps | grep -q "postgres.*Up"; then
            print_success "Local database is running"
            echo ""
            echo "Database connection:"
            echo "  Host: localhost"
            echo "  Port: 5432"
            echo "  Database: college_athlete_base"
            echo "  User: postgres"
            echo "  Password: postgres"
            echo ""
            echo "Next steps:"
            echo "  1. Run migrations: npm run db:migrate:local"
            echo "  2. Seed data: npm run db:seed:local"
            echo "  3. Start dev server: npm run dev"
        else
            print_error "Failed to start local database"
            echo "Run 'docker-compose logs postgres' to see errors"
            exit 1
        fi
        ;;
        
    aws)
        echo "🔄 Switching to AWS development database..."
        echo ""
        
        # Check if .env.dev exists
        if [ ! -f "$PROJECT_ROOT/.env.dev" ]; then
            print_warning ".env.dev not found!"
            echo ""
            echo "You need to create .env.dev with AWS credentials."
            echo ""
            echo "Options:"
            echo "  1. Run: ./scripts/get-dev-credentials.sh"
            echo "  2. Manually copy: cp .env.dev.example .env.dev"
            echo "     Then fill in values from AWS"
            echo ""
            echo "See docs/AWS_DEV_ENVIRONMENT_ACCESS.md for details"
            exit 1
        fi
        
        # Copy AWS config
        cp "$PROJECT_ROOT/.env.dev" "$PROJECT_ROOT/.env.local"
        print_success "Copied .env.dev to .env.local"
        
        # Extract database host from .env.dev
        DB_HOST=$(grep "^DATABASE_HOST=" "$PROJECT_ROOT/.env.dev" | cut -d'=' -f2)
        DB_PORT=$(grep "^DATABASE_PORT=" "$PROJECT_ROOT/.env.dev" | cut -d'=' -f2)
        
        if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ]; then
            print_warning "Could not extract database connection details"
        else
            echo ""
            echo "Testing network connectivity..."
            
            # Test database connection
            if nc -z -w 5 "$DB_HOST" "$DB_PORT" 2>/dev/null; then
                print_success "Database is reachable at $DB_HOST:$DB_PORT"
            else
                print_warning "Cannot reach database at $DB_HOST:$DB_PORT"
                echo ""
                echo "You may need to:"
                echo "  1. Connect to VPN"
                echo "  2. Set up SSH tunnel via bastion host"
                echo "  3. Add your IP to security groups"
                echo ""
                echo "See docs/AWS_DEV_ENVIRONMENT_ACCESS.md for setup instructions"
            fi
        fi
        
        echo ""
        echo "Next steps:"
        echo "  1. Ensure network access (VPN/tunnel/security group)"
        echo "  2. Start dev server: npm run dev"
        echo ""
        print_warning "Remember: You're now using the SHARED AWS development database!"
        echo "  - Changes affect all developers"
        echo "  - Use migrations for schema changes"
        echo "  - Be careful with data modifications"
        ;;
        
    *)
        print_error "Invalid option: $MODE"
        echo ""
        echo "Usage: $0 [local|aws]"
        exit 1
        ;;
esac

echo ""
print_success "Database switch complete!"
