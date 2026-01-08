# Integration Tests

This directory contains integration tests that test the complete flow of features with a real database connection.

## Prerequisites

1. **Docker Desktop** must be installed and running
2. **Local PostgreSQL** (like Postgres.app) should be stopped to avoid port conflicts
3. **Database** must be running via docker-compose

## Setup

### 1. Start the Database

```bash
# Start the PostgreSQL database
npm run db:local:start

# Wait for the database to be healthy (check with)
docker ps | grep college-athlete-base-db
```

### 2. Run Migrations

```bash
# Apply database migrations
npm run db:migrate:local
```

### 3. (Optional) Seed Data

```bash
# Seed the database with test data
npm run db:seed:local
```

## Running Integration Tests

### Run All Integration Tests

```bash
npm test -- src/__tests__/integration --runInBand
```

### Run Specific Integration Test File

```bash
npm test -- src/__tests__/integration/player-registration.test.ts --runInBand
```

### Run Specific Test

```bash
npm test -- src/__tests__/integration/player-registration.test.ts -t "should successfully register a player" --runInBand
```

## Important Notes

### Port Conflicts

If you have a local PostgreSQL instance (like Postgres.app) running on port 5432, you must stop it before running integration tests. The tests need to connect to the Docker PostgreSQL instance.

**To stop Postgres.app:**
```bash
killall postgres
```

**To verify only Docker postgres is running:**
```bash
lsof -i :5432
# Should only show com.docker process
```

### Test Isolation

- Integration tests use the `@jest-environment node` directive
- Tests are skipped automatically if no database is configured
- Each test cleans up its own data after execution
- All test data uses emails ending in `@integration-test.com` for easy cleanup

### Environment Variables

Integration tests use the `.env.test` file for configuration. The following variables are required:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=college_athlete_base
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_SSL=false
DATABASE_MAX_CONNECTIONS=20
BCRYPT_ROUNDS=10
ALLOWED_ORIGINS=http://localhost:3000
```

## Test Coverage

The `player-registration.test.ts` file covers:

- ✅ Complete registration flow with required fields
- ✅ Registration with optional fields
- ✅ Email normalization (lowercase, trim)
- ✅ Password hashing with bcrypt
- ✅ Duplicate email prevention (case-insensitive)
- ✅ Validation errors for all fields
- ✅ CORS headers
- ✅ Error handling
- ✅ Data persistence
- ✅ Concurrent registrations

## Troubleshooting

### "database does not exist" Error

This usually means you're connecting to the wrong PostgreSQL instance. Check:

1. Is Docker PostgreSQL running? `docker ps | grep postgres`
2. Is local Postgres.app stopped? `lsof -i :5432` should only show Docker
3. Can you connect manually? `PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d college_athlete_base`

### Tests Are Skipped

Integration tests are automatically skipped if `DATABASE_HOST` environment variable is not set. Make sure:

1. `.env.test` file exists in the project root
2. `jest.setup.js` is loading the `.env.test` file
3. Environment variables are being loaded correctly

### Connection Timeout

If tests timeout connecting to the database:

1. Check if the database is healthy: `docker ps`
2. Restart the database: `npm run db:local:reset`
3. Check database logs: `npm run db:local:logs`

## Adding New Integration Tests

When adding new integration tests:

1. Use the `@jest-environment node` directive at the top of the file
2. Use the `skipIfNoDb` wrapper to skip tests when no database is configured
3. Clean up test data in `afterEach` or `afterAll` hooks
4. Use unique email addresses with timestamps to avoid conflicts
5. Use the `@integration-test.com` domain for easy cleanup

Example:

```typescript
/**
 * @jest-environment node
 */
import { query, closePool } from '@/authentication/db/client';

const skipIfNoDb = process.env.DATABASE_HOST ? describe : describe.skip;

skipIfNoDb('My Feature - Integration', () => {
    afterAll(async () => {
        await query('DELETE FROM my_table WHERE email LIKE $1', ['%@integration-test.com']);
        await closePool();
    });

    afterEach(async () => {
        await query('DELETE FROM my_table WHERE email LIKE $1', ['%@integration-test.com']);
    });

    it('should do something', async () => {
        // Test implementation
    });
});
```
