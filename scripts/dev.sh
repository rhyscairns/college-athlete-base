#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[DEV]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down..."
    if [ ! -z "$DEV_SERVER_PID" ]; then
        kill $DEV_SERVER_PID 2>/dev/null
    fi
    exit 0
}

# Trap SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if local PostgreSQL is running on port 5432 and warn user
if lsof -i :5432 2>/dev/null | grep -q "postgres.*LISTEN" | grep -v docker; then
    print_warning "Local PostgreSQL detected on port 5432"
    print_warning "This may conflict with Docker PostgreSQL"
    print_status "Attempting to stop local PostgreSQL..."
    
    # Try to stop Postgres.app
    if pgrep -f "Postgres.app" > /dev/null; then
        killall postgres 2>/dev/null || true
        sleep 2
        print_success "Stopped Postgres.app"
    fi
fi

print_status "Starting local development environment..."

# Stop any existing database container
print_status "Stopping any existing database containers..."
docker-compose stop db 2>/dev/null

# Start the database
print_status "Starting PostgreSQL database..."
docker-compose up -d db

# Wait for database to be healthy
print_status "Waiting for database to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker exec college-athlete-base-db pg_isready -U postgres > /dev/null 2>&1; then
        print_success "Database is ready!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo -n "."
    sleep 1
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    print_error "Database failed to start within 30 seconds"
    exit 1
fi

# Check if tables exist
print_status "Checking database state..."
TABLE_COUNT=$(docker exec college-athlete-base-db psql -U postgres -d college_athlete_base -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';" 2>/dev/null | tr -d ' ')

# Always run migrations to ensure latest schema
print_status "Running migrations..."
for migration in infrastructure/database/migrations/*.sql; do
    # Skip rollback files
    if [[ $migration == *"rollback"* ]]; then
        continue
    fi
    
    print_status "Running migration: $(basename $migration)"
    docker exec -i college-athlete-base-db psql -U postgres -d college_athlete_base < "$migration"
    
    if [ $? -ne 0 ]; then
        print_error "Migration failed: $(basename $migration)"
        exit 1
    fi
done

print_success "Migrations completed!"

# Only seed if database was empty
if [ "$TABLE_COUNT" = "0" ] || [ -z "$TABLE_COUNT" ]; then
    print_status "Database was empty. Seeding database..."
    for seed in infrastructure/database/seeds/*.sql; do
        # Skip README and update scripts
        if [[ $seed == *"README"* ]] || [[ $seed == *"update_"* ]]; then
            continue
        fi
        
        print_status "Running seed: $(basename $seed)"
        docker exec -i college-athlete-base-db psql -U postgres -d college_athlete_base < "$seed"
        
        if [ $? -ne 0 ]; then
            print_warning "Seed failed: $(basename $seed) (this might be okay if data already exists)"
        fi
    done
    
    print_success "Database seeded!"
else
    print_success "Database already has $TABLE_COUNT tables (skipping seeds)"
fi

# Show some sample data
print_status "Sample users in database:"
echo ""
echo "Players:"
docker exec college-athlete-base-db psql -U postgres -d college_athlete_base -c "SELECT email FROM players LIMIT 3;" 2>/dev/null
echo ""
echo "Coaches:"
docker exec college-athlete-base-db psql -U postgres -d college_athlete_base -c "SELECT email FROM coaches LIMIT 3;" 2>/dev/null
echo ""

# Start the Next.js dev server
print_status "Starting Next.js development server..."
print_status "Server will be available at http://localhost:3000"
print_status ""
print_status "Press Ctrl+C to stop all services"
print_status ""

npm run dev

# Cleanup will be called by trap
