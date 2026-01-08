#!/bin/bash

# Local database migration script
# Usage: ./scripts/db-migrate-local.sh

set -e  # Exit on error

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running database migrations for local environment...${NC}"

# Load environment variables from .env.local if it exists
if [ -f ".env.local" ]; then
    echo -e "${YELLOW}Loading configuration from .env.local${NC}"
    export $(grep -v '^#' .env.local | grep -v '^$' | xargs)
fi

# Set database connection parameters
DB_HOST=${DATABASE_HOST:-localhost}
DB_PORT=${DATABASE_PORT:-5432}
DB_NAME=${DATABASE_NAME:-college_athlete_base}
DB_USER=${DATABASE_USER:-postgres}
DB_PASSWORD=${DATABASE_PASSWORD:-postgres}

# Export password for psql
export PGPASSWORD=$DB_PASSWORD

echo -e "${YELLOW}Using local database configuration:${NC}"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql is not installed${NC}"
    echo "Please install PostgreSQL client tools:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql-client"
    exit 1
fi

# Test database connection
echo -e "${YELLOW}Testing database connection...${NC}"

# Try direct connection first
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
    USE_DOCKER=false
elif command -v docker-compose &> /dev/null; then
    # If direct connection fails, try docker-compose
    echo -e "${YELLOW}Direct connection failed, trying docker-compose...${NC}"
    if docker-compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Database connection successful via docker-compose${NC}"
        USE_DOCKER=true
    else
        echo -e "${RED}Error: Cannot connect to database${NC}"
        echo "Please ensure the database is running:"
        echo "  npm run db:local:start"
        exit 1
    fi
else
    echo -e "${RED}Error: Cannot connect to database${NC}"
    echo "Please ensure the database is running:"
    echo "  npm run db:local:start"
    exit 1
fi

# Get the migrations directory
MIGRATIONS_DIR="infrastructure/database/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo -e "${RED}Error: Migrations directory not found at $MIGRATIONS_DIR${NC}"
    exit 1
fi

# Find all migration files (sorted)
MIGRATION_FILES=$(find "$MIGRATIONS_DIR" -name "*.sql" ! -name "*rollback*" | sort)

if [ -z "$MIGRATION_FILES" ]; then
    echo -e "${YELLOW}No migration files found in $MIGRATIONS_DIR${NC}"
    exit 0
fi

echo -e "${YELLOW}Found migration files:${NC}"
echo "$MIGRATION_FILES" | while read -r file; do
    echo "  - $(basename "$file")"
done

# Run each migration
echo -e "${YELLOW}Running migrations...${NC}"
for migration_file in $MIGRATION_FILES; do
    echo -e "${YELLOW}Applying $(basename "$migration_file")...${NC}"
    
    if [ "$USE_DOCKER" = true ]; then
        if cat "$migration_file" | docker-compose exec -T db psql -U "$DB_USER" -d "$DB_NAME"; then
            echo -e "${GREEN}✓ Migration applied successfully${NC}"
        else
            echo -e "${RED}Error: Failed to apply migration $(basename "$migration_file")${NC}"
            exit 1
        fi
    else
        if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$migration_file"; then
            echo -e "${GREEN}✓ Migration applied successfully${NC}"
        else
            echo -e "${RED}Error: Failed to apply migration $(basename "$migration_file")${NC}"
            exit 1
        fi
    fi
done

# Verify tables were created
echo -e "${YELLOW}Verifying database schema...${NC}"
if [ "$USE_DOCKER" = true ]; then
    TABLES=$(docker-compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT tablename FROM pg_tables WHERE schemaname = 'public';")
else
    TABLES=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT tablename FROM pg_tables WHERE schemaname = 'public';")
fi

if [ -z "$TABLES" ]; then
    echo -e "${RED}Warning: No tables found in database${NC}"
else
    echo -e "${GREEN}✓ Tables created:${NC}"
    echo "$TABLES" | while read -r table; do
        echo "  - $table"
    done
fi

echo -e "${GREEN}Migrations completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "  1. Seed test data: npm run db:seed:local"
echo "  2. Start development: npm run dev"

