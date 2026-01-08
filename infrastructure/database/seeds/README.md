# Database Seed Data

This directory contains seed data for local development and testing.

## Files

- `players.sql` - Contains 20 dummy player records with realistic test data
- `seed.sh` - Shell script to load seed data into the database

## Usage

### Local Development (Docker)

1. Start the local database:
   ```bash
   npm run db:local:start
   ```

2. Run migrations (if not already done):
   ```bash
   npm run db:migrate:local
   ```

3. Load seed data:
   ```bash
   npm run db:seed:local
   ```
   
   Note: The script will ask for confirmation before loading data. Type `y` and press Enter.

### AWS Dev Environment

1. Ensure you have access to the AWS dev database (via VPN, SSH tunnel, or security group)

2. Set up your `.env.dev` file with database credentials:
   ```bash
   DATABASE_HOST=your-rds-endpoint.rds.amazonaws.com
   DATABASE_PORT=5432
   DATABASE_NAME=college_athlete_base
   DATABASE_USER=postgres
   DATABASE_PASSWORD=your-password
   ```

3. Load seed data:
   ```bash
   npm run db:seed:dev
   ```

## Seed Data Details

The `players.sql` file contains 20 dummy players with the following characteristics:

- **Sports covered**: Basketball, Football, Soccer, Baseball, Volleyball, Tennis
- **Diversity**: Mix of male and female athletes
- **Geographic diversity**: Various US states and international locations (Brazil, France)
- **GPA range**: 3.1 to 3.9 (realistic college athlete range)
- **Scholarship amounts**: $15,000 to $35,000
- **Test scores**: SAT, ACT, and TOEFL scores included

### Test Password

All seeded players use the same password hash for testing purposes:
- **Password**: `Password123!`
- **Hash**: `$2b$10$rZ5L3KxGxGxGxGxGxGxGxOqK5L3KxGxGxGxGxGxGxGxGxGxGxGxGx`

**Note**: This is a dummy hash for demonstration. In production, each user would have a unique password hash.

## Sample Players

Here are some example players you can use for testing:

| Name | Email | Sport | Position | GPA |
|------|-------|-------|----------|-----|
| Michael Johnson | michael.johnson@example.com | Basketball | Point Guard | 3.8 |
| Sarah Williams | sarah.williams@example.com | Basketball | Shooting Guard | 3.9 |
| David Martinez | david.martinez@example.com | Football | Quarterback | 3.7 |
| Sophia Anderson | sophia.anderson@example.com | Soccer | Forward | 3.9 |
| Lucas Silva | lucas.silva@example.com | Soccer | Midfielder | 3.6 |

## Resetting Seed Data

To clear and reload seed data:

1. **Local**:
   ```bash
   npm run db:local:reset
   npm run db:migrate:local
   npm run db:seed:local
   ```

2. **Dev** (be careful!):
   ```bash
   # Manually truncate the table
   psql -h $DATABASE_HOST -U postgres -d college_athlete_base -c "TRUNCATE TABLE players CASCADE;"
   
   # Reload seed data
   npm run db:seed:dev
   ```

## Adding More Seed Data

To add more seed data:

1. Edit `players.sql` and add more INSERT statements
2. Follow the same format as existing records
3. Ensure all required fields are included
4. Use the same password hash for consistency
5. Test locally before committing

## Troubleshooting

### "psql: command not found"

Install PostgreSQL client tools:
- **macOS**: `brew install postgresql`
- **Ubuntu/Debian**: `sudo apt-get install postgresql-client`
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)

### "Cannot connect to database"

- Ensure the database is running: `docker-compose ps`
- Check your connection parameters in `.env.local` or `.env.dev`
- For AWS dev, ensure you have network access (VPN, SSH tunnel, or security group)

### "players table does not exist"

Run migrations first:
```bash
npm run db:migrate:local  # or db:migrate:dev
```

### "Duplicate key value violates unique constraint"

The seed data has already been loaded. To reload:
```bash
# Connect to database
psql -h localhost -U postgres -d college_athlete_base

# Clear existing data
TRUNCATE TABLE players CASCADE;

# Exit and reload
\q
npm run db:seed:local
```
