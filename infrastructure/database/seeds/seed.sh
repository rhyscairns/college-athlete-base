#!/bin/bash

# Seed script for loading dummy player data into the database
# This script can be used for both local Docker database and AWS RDS dev database

set -e  # Exit on error

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default to local environment
ENVIRONMENT=${1:-local}

echo -e "${YELLOW}Starting database seeding for ${ENVIRONMENT} environment...${NC}"

# Set database connection parameters based on environment
if [ "$ENVIRONMENT" = "local" ]; then
    DB_HOST=${DATABASE_HOST:-localhost}
    DB_PORT=${DATABASE_PORT:-5432}
    DB_NAME=${DATABASE_NAME:-college_athlete_base}
    DB_USER=${DATABASE_USER:-postgres}
    DB_PASSWORD=${DATABASE_PASSWORD:-localdev123}
    PGPASSWORD=$DB_PASSWORD
    export PGPASSWORD
    
    echo -e "${YELLOW}Using local database configuration:${NC}"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
    
elif [ "$ENVIRONMENT" = "dev" ]; then
    # For AWS dev environment, load from .env.dev or environment variables
    if [ -f ".env.dev" ]; then
        echo -e "${YELLOW}Loading configuration from .env.dev${NC}"
        export $(grep -v '^#' .env.dev | xargs)
    fi
    
    DB_HOST=${DATABASE_HOST}
    DB_PORT=${DATABASE_PORT:-5432}
    DB_NAME=${DATABASE_NAME:-college_athlete_base}
    DB_USER=${DATABASE_USER:-postgres}
    DB_PASSWORD=${DATABASE_PASSWORD}
    
    if [ -z "$DB_HOST" ] || [ -z "$DB_PASSWORD" ]; then
        echo -e "${RED}Error: DATABASE_HOST and DATABASE_PASSWORD must be set for dev environment${NC}"
        echo "Please set them in .env.dev or as environment variables"
        exit 1
    fi
    
    PGPASSWORD=$DB_PASSWORD
    export PGPASSWORD
    
    echo -e "${YELLOW}Using AWS dev database configuration:${NC}"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
    
else
    echo -e "${RED}Error: Invalid environment '$ENVIRONMENT'${NC}"
    echo "Usage: $0 [local|dev]"
    exit 1
fi

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql is not installed${NC}"
    echo "Please install PostgreSQL client tools"
    exit 1
fi

# Test database connection
echo -e "${YELLOW}Testing database connection...${NC}"

# Try direct connection first
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
    USE_DOCKER=false
elif [ "$ENVIRONMENT" = "local" ] && command -v docker-compose &> /dev/null; then
    # If direct connection fails for local, try docker-compose
    echo -e "${YELLOW}Direct connection failed, trying docker-compose...${NC}"
    if docker-compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Database connection successful via docker-compose${NC}"
        USE_DOCKER=true
    else
        echo -e "${RED}Error: Cannot connect to database${NC}"
        echo "Please check your database configuration and ensure the database is running"
        exit 1
    fi
else
    echo -e "${RED}Error: Cannot connect to database${NC}"
    echo "Please check your database configuration and ensure the database is running"
    exit 1
fi

# Check if players table exists
echo -e "${YELLOW}Checking if players table exists...${NC}"
if [ "$USE_DOCKER" = true ]; then
    TABLE_EXISTS=$(docker-compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'players');")
else
    TABLE_EXISTS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'players');")
fi

if [ "$TABLE_EXISTS" != "t" ]; then
    echo -e "${RED}Error: players table does not exist${NC}"
    echo "Please run migrations first: npm run db:migrate:$ENVIRONMENT"
    exit 1
fi
echo -e "${GREEN}✓ Players table exists${NC}"

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SEED_FILE="$SCRIPT_DIR/players.sql"

# Check if seed file exists
if [ ! -f "$SEED_FILE" ]; then
    echo -e "${RED}Error: Seed file not found at $SEED_FILE${NC}"
    exit 1
fi

# Ask for confirmation before seeding
echo -e "${YELLOW}This will insert 20 dummy players into the database.${NC}"
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Seeding cancelled${NC}"
    exit 0
fi

# Load seed data
echo -e "${YELLOW}Loading seed data from $SEED_FILE...${NC}"
if [ "$USE_DOCKER" = true ]; then
    if cat "$SEED_FILE" | docker-compose exec -T db psql -U "$DB_USER" -d "$DB_NAME"; then
        echo -e "${GREEN}✓ Seed data loaded successfully${NC}"
    else
        echo -e "${RED}Error: Failed to load seed data${NC}"
        exit 1
    fi
else
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SEED_FILE"; then
        echo -e "${GREEN}✓ Seed data loaded successfully${NC}"
    else
        echo -e "${RED}Error: Failed to load seed data${NC}"
        exit 1
    fi
fi

# Count players in database
if [ "$USE_DOCKER" = true ]; then
    PLAYER_COUNT=$(docker-compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM players;")
else
    PLAYER_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM players;")
fi
echo -e "${GREEN}Total players in database: $PLAYER_COUNT${NC}"

# Show sample data
echo -e "${YELLOW}Sample players:${NC}"
if [ "$USE_DOCKER" = true ]; then
    docker-compose exec -T db psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT id, first_name, last_name, email, sport, position, gpa FROM players LIMIT 5;"
else
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT id, first_name, last_name, email, sport, position, gpa FROM players LIMIT 5;"
fi

echo -e "${GREEN}Seeding complete!${NC}"
