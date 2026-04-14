#!/bin/bash

# Script to test the rollback migration
# This script will:
# 1. Apply the forward migration (001_create_initial_schema.sql)
# 2. Verify tables, indexes, triggers, and functions exist
# 3. Apply the rollback migration (001_create_initial_schema_rollback.sql)
# 4. Verify all objects are dropped

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Testing Rollback Migration${NC}"
echo -e "${YELLOW}========================================${NC}"

# Load environment variables from .env.local
if [ -f "../../.env.local" ]; then
    export $(grep -v '^#' ../../.env.local | grep -v '^$' | sed 's/#.*//' | xargs)
fi

# Set PGPASSWORD environment variable for psql
export PGPASSWORD="$DATABASE_PASSWORD"

# Database connection parameters
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_USER="${DATABASE_USER:-postgres}"
DB_NAME="${DATABASE_NAME:-college_athlete_base}"

echo -e "\n${YELLOW}Database Configuration:${NC}"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo "User: $DB_USER"

# Function to run SQL query
run_query() {
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "$1"
}

# Function to check if table exists
check_table_exists() {
    local table_name=$1
    local result=$(run_query "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table_name');")
    echo "$result" | tr -d ' '
}

# Function to check if function exists
check_function_exists() {
    local function_name=$1
    local result=$(run_query "SELECT EXISTS (SELECT FROM pg_proc WHERE proname = '$function_name');")
    echo "$result" | tr -d ' '
}

# Function to check if trigger exists
check_trigger_exists() {
    local trigger_name=$1
    local table_name=$2
    local result=$(run_query "SELECT EXISTS (SELECT FROM pg_trigger WHERE tgname = '$trigger_name' AND tgrelid = '$table_name'::regclass);")
    echo "$result" | tr -d ' '
}

# Step 1: Apply forward migration
echo -e "\n${YELLOW}Step 1: Applying forward migration...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "../database/migrations/001_create_initial_schema.sql" > /dev/null 2>&1
echo -e "${GREEN}✓ Forward migration applied${NC}"

# Step 2: Verify objects exist
echo -e "\n${YELLOW}Step 2: Verifying objects exist...${NC}"

# Check tables
players_exists=$(check_table_exists "players")
coaches_exists=$(check_table_exists "coaches")

if [ "$players_exists" = "t" ]; then
    echo -e "${GREEN}✓ players table exists${NC}"
else
    echo -e "${RED}✗ players table does not exist${NC}"
    exit 1
fi

if [ "$coaches_exists" = "t" ]; then
    echo -e "${GREEN}✓ coaches table exists${NC}"
else
    echo -e "${RED}✗ coaches table does not exist${NC}"
    exit 1
fi

# Check function
function_exists=$(check_function_exists "update_updated_at_column")
if [ "$function_exists" = "t" ]; then
    echo -e "${GREEN}✓ update_updated_at_column function exists${NC}"
else
    echo -e "${RED}✗ update_updated_at_column function does not exist${NC}"
    exit 1
fi

# Check triggers
players_trigger_exists=$(check_trigger_exists "update_players_updated_at" "players")
coaches_trigger_exists=$(check_trigger_exists "update_coaches_updated_at" "coaches")

if [ "$players_trigger_exists" = "t" ]; then
    echo -e "${GREEN}✓ update_players_updated_at trigger exists${NC}"
else
    echo -e "${RED}✗ update_players_updated_at trigger does not exist${NC}"
    exit 1
fi

if [ "$coaches_trigger_exists" = "t" ]; then
    echo -e "${GREEN}✓ update_coaches_updated_at trigger exists${NC}"
else
    echo -e "${RED}✗ update_coaches_updated_at trigger does not exist${NC}"
    exit 1
fi

# Check indexes
echo -e "\n${YELLOW}Checking indexes...${NC}"
indexes=$(run_query "SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('players', 'coaches') ORDER BY indexname;")
echo "$indexes" | while read -r index; do
    if [ ! -z "$index" ]; then
        echo -e "${GREEN}✓ Index: $index${NC}"
    fi
done

# Step 3: Apply rollback migration
echo -e "\n${YELLOW}Step 3: Applying rollback migration...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "../database/migrations/001_create_initial_schema_rollback.sql" > /dev/null 2>&1
echo -e "${GREEN}✓ Rollback migration applied${NC}"

# Step 4: Verify objects are dropped
echo -e "\n${YELLOW}Step 4: Verifying objects are dropped...${NC}"

# Check tables
players_exists=$(check_table_exists "players")
coaches_exists=$(check_table_exists "coaches")

if [ "$players_exists" = "f" ]; then
    echo -e "${GREEN}✓ players table dropped${NC}"
else
    echo -e "${RED}✗ players table still exists${NC}"
    exit 1
fi

if [ "$coaches_exists" = "f" ]; then
    echo -e "${GREEN}✓ coaches table dropped${NC}"
else
    echo -e "${RED}✗ coaches table still exists${NC}"
    exit 1
fi

# Check function
function_exists=$(check_function_exists "update_updated_at_column")
if [ "$function_exists" = "f" ]; then
    echo -e "${GREEN}✓ update_updated_at_column function dropped${NC}"
else
    echo -e "${RED}✗ update_updated_at_column function still exists${NC}"
    exit 1
fi

# Verify no triggers remain
remaining_triggers=$(run_query "SELECT COUNT(*) FROM pg_trigger WHERE tgname IN ('update_players_updated_at', 'update_coaches_updated_at');")
remaining_triggers=$(echo "$remaining_triggers" | tr -d ' ')

if [ "$remaining_triggers" = "0" ]; then
    echo -e "${GREEN}✓ All triggers dropped${NC}"
else
    echo -e "${RED}✗ Some triggers still exist${NC}"
    exit 1
fi

# Unset password
unset PGPASSWORD

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Rollback migration test PASSED${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\nAll objects were successfully created and then dropped."
echo -e "The rollback migration works correctly!"

