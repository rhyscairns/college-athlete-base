# Database Migrations

This directory contains SQL migration files for the College Athlete Base database.

## Migration Files

- `001_create_players_table.sql` - Creates the players table with all constraints and indexes
- `001_create_players_table_rollback.sql` - Rollback script for the players table

## Running Migrations

### Local Development (Docker)

Migrations are automatically applied when the Docker container starts (via docker-entrypoint-initdb.d).

To manually apply a migration:

```bash
docker exec college-athlete-base-db psql -U postgres -d college_athlete_base -f /docker-entrypoint-initdb.d/001_create_players_table.sql
```

### AWS RDS (Development/Production)

To apply migrations to AWS RDS, you need to connect via SSH tunnel or VPN:

```bash
# Via SSH tunnel (if using bastion host)
psql -h localhost -p 5433 -U postgres -d college_athlete_base -f infrastructure/database/migrations/001_create_players_table.sql

# Or directly (if VPN connected)
psql -h <rds-endpoint> -U postgres -d college_athlete_base -f infrastructure/database/migrations/001_create_players_table.sql
```

## Rollback

To rollback a migration:

```bash
# Local
docker exec college-athlete-base-db psql -U postgres -d college_athlete_base -f /docker-entrypoint-initdb.d/001_create_players_table_rollback.sql

# AWS RDS
psql -h <endpoint> -U postgres -d college_athlete_base -f infrastructure/database/migrations/001_create_players_table_rollback.sql
```

## Verification

To verify the migration was applied successfully:

```bash
# Check table structure
docker exec college-athlete-base-db psql -U postgres -d college_athlete_base -c "\d players"

# Check indexes
docker exec college-athlete-base-db psql -U postgres -d college_athlete_base -c "SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'players';"

# Check constraints
docker exec college-athlete-base-db psql -U postgres -d college_athlete_base -c "SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'players'::regclass;"
```

## Migration Details

### 001_create_players_table.sql

Creates the `players` table with:

**Columns:**
- `id` (UUID, primary key)
- `first_name`, `last_name` (VARCHAR)
- `email` (VARCHAR, unique)
- `password_hash` (VARCHAR)
- `sex`, `sport`, `position` (VARCHAR)
- `gpa` (DECIMAL 3,2)
- `country`, `state`, `region` (VARCHAR)
- `scholarship_amount` (DECIMAL 10,2, optional)
- `test_scores` (TEXT, optional)
- `created_at`, `updated_at` (TIMESTAMP WITH TIME ZONE)

**Constraints:**
- `check_gpa_range`: Ensures GPA is between 0.0 and 4.0
- `check_location`: Ensures state is provided for USA, region for other countries

**Indexes:**
- `idx_players_email`: Case-insensitive email lookup (LOWER(email))
- `idx_players_sport`: Sport filtering
- `idx_players_created_at`: Time-based queries (DESC)

**Triggers:**
- `update_players_updated_at`: Automatically updates `updated_at` on row updates
