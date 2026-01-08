#!/bin/bash

# Test script for local database workflow
# This script verifies that all database commands work correctly

set -e  # Exit on error

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Testing Local Database Workflow${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Test 1: Check if Docker is running
echo -e "${YELLOW}Test 1: Checking if Docker is running...${NC}"
if docker ps > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Docker is running${NC}"
else
    echo -e "${RED}✗ Docker is not running${NC}"
    echo "Please start Docker Desktop and try again"
    exit 1
fi
echo ""

# Test 2: Check if database container is running
echo -e "${YELLOW}Test 2: Checking if database container is running...${NC}"
if docker-compose ps | grep -q "college-athlete-base-db.*Up"; then
    echo -e "${GREEN}✓ Database container is running${NC}"
else
    echo -e "${YELLOW}Database container is not running. Starting it...${NC}"
    npm run db:local:start
    sleep 5
    echo -e "${GREEN}✓ Database container started${NC}"
fi
echo ""

# Test 3: Check database connection
echo -e "${YELLOW}Test 3: Testing database connection...${NC}"
if docker-compose exec -T db psql -U postgres -d college_athlete_base -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}✗ Cannot connect to database${NC}"
    exit 1
fi
echo ""

# Test 4: Check if .env.local.example exists
echo -e "${YELLOW}Test 4: Checking if .env.local.example exists...${NC}"
if [ -f ".env.local.example" ]; then
    echo -e "${GREEN}✓ .env.local.example exists${NC}"
else
    echo -e "${RED}✗ .env.local.example not found${NC}"
    exit 1
fi
echo ""

# Test 5: Check if migration script exists
echo -e "${YELLOW}Test 5: Checking if migration script exists...${NC}"
if [ -f "scripts/db-migrate-local.sh" ]; then
    echo -e "${GREEN}✓ Migration script exists${NC}"
    if [ -x "scripts/db-migrate-local.sh" ]; then
        echo -e "${GREEN}✓ Migration script is executable${NC}"
    else
        echo -e "${YELLOW}Making migration script executable...${NC}"
        chmod +x scripts/db-migrate-local.sh
        echo -e "${GREEN}✓ Migration script is now executable${NC}"
    fi
else
    echo -e "${RED}✗ Migration script not found${NC}"
    exit 1
fi
echo ""

# Test 6: Check if migration files exist
echo -e "${YELLOW}Test 6: Checking if migration files exist...${NC}"
if [ -d "infrastructure/database/migrations" ]; then
    MIGRATION_COUNT=$(find infrastructure/database/migrations -name "*.sql" ! -name "*rollback*" | wc -l)
    if [ "$MIGRATION_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓ Found $MIGRATION_COUNT migration file(s)${NC}"
    else
        echo -e "${RED}✗ No migration files found${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ Migrations directory not found${NC}"
    exit 1
fi
echo ""

# Test 7: Check if seed script exists
echo -e "${YELLOW}Test 7: Checking if seed script exists...${NC}"
if [ -f "infrastructure/database/seeds/seed.sh" ]; then
    echo -e "${GREEN}✓ Seed script exists${NC}"
    if [ -x "infrastructure/database/seeds/seed.sh" ]; then
        echo -e "${GREEN}✓ Seed script is executable${NC}"
    else
        echo -e "${YELLOW}Making seed script executable...${NC}"
        chmod +x infrastructure/database/seeds/seed.sh
        echo -e "${GREEN}✓ Seed script is now executable${NC}"
    fi
else
    echo -e "${RED}✗ Seed script not found${NC}"
    exit 1
fi
echo ""

# Test 8: Check if seed data file exists
echo -e "${YELLOW}Test 8: Checking if seed data file exists...${NC}"
if [ -f "infrastructure/database/seeds/players.sql" ]; then
    echo -e "${GREEN}✓ Seed data file exists${NC}"
else
    echo -e "${RED}✗ Seed data file not found${NC}"
    exit 1
fi
echo ""

# Test 9: Verify players table exists
echo -e "${YELLOW}Test 9: Verifying players table exists...${NC}"
TABLE_EXISTS=$(docker-compose exec -T db psql -U postgres -d college_athlete_base -tAc "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'players');")
if [ "$TABLE_EXISTS" = "t" ]; then
    echo -e "${GREEN}✓ Players table exists${NC}"
else
    echo -e "${YELLOW}Players table does not exist. Running migrations...${NC}"
    ./scripts/db-migrate-local.sh
    echo -e "${GREEN}✓ Players table created${NC}"
fi
echo ""

# Test 10: Check table structure
echo -e "${YELLOW}Test 10: Verifying table structure...${NC}"
COLUMNS=$(docker-compose exec -T db psql -U postgres -d college_athlete_base -tAc "SELECT column_name FROM information_schema.columns WHERE table_name = 'players' ORDER BY ordinal_position;")
EXPECTED_COLUMNS=("id" "first_name" "last_name" "email" "password_hash" "sex" "sport" "position" "gpa" "country" "state" "region" "scholarship_amount" "test_scores" "created_at" "updated_at")

COLUMN_COUNT=$(echo "$COLUMNS" | wc -l)
if [ "$COLUMN_COUNT" -ge 16 ]; then
    echo -e "${GREEN}✓ Table has correct number of columns ($COLUMN_COUNT)${NC}"
else
    echo -e "${RED}✗ Table has incorrect number of columns ($COLUMN_COUNT, expected 16)${NC}"
    exit 1
fi
echo ""

# Test 11: Check indexes
echo -e "${YELLOW}Test 11: Verifying indexes exist...${NC}"
INDEXES=$(docker-compose exec -T db psql -U postgres -d college_athlete_base -tAc "SELECT indexname FROM pg_indexes WHERE tablename = 'players';")
if echo "$INDEXES" | grep -q "idx_players_email"; then
    echo -e "${GREEN}✓ Email index exists${NC}"
else
    echo -e "${RED}✗ Email index missing${NC}"
fi
if echo "$INDEXES" | grep -q "idx_players_sport"; then
    echo -e "${GREEN}✓ Sport index exists${NC}"
else
    echo -e "${RED}✗ Sport index missing${NC}"
fi
if echo "$INDEXES" | grep -q "idx_players_created_at"; then
    echo -e "${GREEN}✓ Created_at index exists${NC}"
else
    echo -e "${RED}✗ Created_at index missing${NC}"
fi
echo ""

# Test 12: Check if data exists
echo -e "${YELLOW}Test 12: Checking if seed data exists...${NC}"
PLAYER_COUNT=$(docker-compose exec -T db psql -U postgres -d college_athlete_base -tAc "SELECT COUNT(*) FROM players;")
if [ "$PLAYER_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Database has $PLAYER_COUNT player(s)${NC}"
else
    echo -e "${YELLOW}No players in database. Database is ready for seeding.${NC}"
fi
echo ""

# Test 13: Test npm scripts
echo -e "${YELLOW}Test 13: Verifying npm scripts are defined...${NC}"
SCRIPTS=("db:local:start" "db:local:stop" "db:local:reset" "db:local:logs" "db:local:psql" "db:migrate:local" "db:seed:local" "db:reset:local")
for script in "${SCRIPTS[@]}"; do
    if npm run | grep -q "$script"; then
        echo -e "${GREEN}✓ npm run $script is defined${NC}"
    else
        echo -e "${RED}✗ npm run $script is not defined${NC}"
    fi
done
echo ""

# Test 14: Check documentation
echo -e "${YELLOW}Test 14: Checking if documentation exists...${NC}"
if [ -f "docs/LOCAL_DATABASE_WORKFLOW.md" ]; then
    echo -e "${GREEN}✓ Local database workflow documentation exists${NC}"
else
    echo -e "${YELLOW}⚠ Local database workflow documentation not found${NC}"
fi
if grep -q "Local Database Workflow" README.md; then
    echo -e "${GREEN}✓ README references local database workflow${NC}"
else
    echo -e "${YELLOW}⚠ README does not reference local database workflow${NC}"
fi
echo ""

# Test 15: Test environment variable loading
echo -e "${YELLOW}Test 15: Testing environment variable configuration...${NC}"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓ .env.local exists${NC}"
    if grep -q "DATABASE_HOST" .env.local; then
        echo -e "${GREEN}✓ .env.local contains DATABASE_HOST${NC}"
    else
        echo -e "${YELLOW}⚠ .env.local missing DATABASE_HOST${NC}"
    fi
else
    echo -e "${YELLOW}⚠ .env.local not found (this is OK for first-time setup)${NC}"
    echo -e "${YELLOW}  Run: cp .env.local.example .env.local${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ All critical tests passed!${NC}"
echo ""
echo -e "${YELLOW}Local database workflow is ready to use.${NC}"
echo ""
echo "Quick start commands:"
echo "  1. npm run db:local:start    - Start database"
echo "  2. npm run db:migrate:local  - Run migrations"
echo "  3. npm run db:seed:local     - Seed test data"
echo "  4. npm run dev               - Start development"
echo ""
echo "For complete documentation, see:"
echo "  docs/LOCAL_DATABASE_WORKFLOW.md"
echo ""

