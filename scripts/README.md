# Deployment Scripts and Automation Tools

This directory contains scripts for deploying, managing, and testing the College Athlete Base platform.

## Overview

All scripts are designed to work with both development and production environments, with appropriate safety checks for production operations.

## Available Scripts

### Deployment Scripts

#### `deploy-environment.sh`
Deploys the application to a specified environment.

```bash
./scripts/deploy-environment.sh [dev|prod]
```

**What it does:**
- Builds the Next.js application
- Creates Docker image
- Deploys infrastructure via CDK
- Runs health checks to verify deployment

**Example:**
```bash
npm run deploy:dev
npm run deploy:prod
```

#### `teardown-environment.sh`
Tears down all resources for an environment.

```bash
./scripts/teardown-environment.sh [dev|prod]
```

**What it does:**
- Creates final backup (for production)
- Destroys infrastructure via CDK
- Cleans up local Docker images

**Safety:** Requires explicit confirmation for production.

**Example:**
```bash
npm run teardown:dev
npm run teardown:prod
```

### Database Management Scripts

#### `db-migrate.sh`
Runs database migrations.

```bash
./scripts/db-migrate.sh [dev|prod] [up|down]
```

**What it does:**
- Creates pre-migration backup
- Applies or rolls back migrations
- Verifies migration success

**Example:**
```bash
npm run db:migrate:dev
npm run db:migrate:prod
./scripts/db-migrate.sh dev down  # Rollback
```

#### `db-seed.sh`
Seeds the database with data.

```bash
./scripts/db-seed.sh [dev|prod] [seed-type]
```

**What it does:**
- Creates pre-seed backup
- Populates database with seed data
- Supports different seed types (default, test-data, etc.)

**Safety:** Requires explicit confirmation for production.

**Example:**
```bash
npm run db:seed:dev
./scripts/db-seed.sh dev test-data
```

### Backup and Restore Scripts

#### `backup-database.sh`
Creates a database backup.

```bash
./scripts/backup-database.sh [dev|prod]
```

**What it does:**
- Creates timestamped database backup
- Compresses backup file
- Uploads to S3 (production only)
- Cleans up old backups (30+ days)

**Example:**
```bash
npm run db:backup:dev
npm run db:backup:prod
```

**Backup location:** `backups/[environment]/backup_YYYYMMDD_HHMMSS.sql.gz`

#### `restore-database.sh`
Restores database from a backup.

```bash
./scripts/restore-database.sh [dev|prod] [backup-file]
```

**What it does:**
- Creates backup of current state
- Decompresses backup file if needed
- Restores database from backup
- Verifies database integrity

**Safety:** Requires explicit confirmation for production.

**Example:**
```bash
./scripts/restore-database.sh dev backups/dev/backup_20260104_120000.sql.gz
./scripts/restore-database.sh prod backups/prod/backup_20260104_120000.sql.gz
```

### Health Check Script

#### `health-check.sh`
Verifies application health.

```bash
./scripts/health-check.sh [domain]
```

**What it does:**
- Makes HTTP requests to health endpoint
- Retries up to 30 times with 10-second delays
- Displays detailed health response
- Exits with error if health check fails

**Example:**
```bash
npm run health:dev
npm run health:prod
./scripts/health-check.sh collegeathletebase-dev.com
```

### Performance Testing Script

#### `performance-test.sh`
Runs performance tests using k6.

```bash
./scripts/performance-test.sh [domain] [test-type]
```

**Test types:**
- `smoke`: 1 VU for 1 minute - basic functionality check
- `load`: 10 VUs for 5 minutes - sustained load test
- `stress`: Ramps up to 100 VUs - find breaking point
- `spike`: Sudden spike to 100 VUs - test elasticity

**What it does:**
- Runs specified performance test
- Saves results to `test-results/performance/`
- Reports key metrics (response time, error rate)

**Example:**
```bash
npm run perf:smoke
npm run perf:load
npm run perf:stress
npm run perf:spike
```

**Prerequisites:** Install k6 from https://k6.io/docs/getting-started/installation/

### Branch Protection Scripts

#### `configure-branch-protection.sh`
Configures GitHub branch protection rules.

```bash
./scripts/configure-branch-protection.sh
```

#### `verify-branch-protection.sh`
Verifies branch protection is configured correctly.

```bash
./scripts/verify-branch-protection.sh
```

#### `test-branch-protection-scripts.sh`
Tests branch protection scripts.

```bash
./scripts/test-branch-protection-scripts.sh
```

### Development Scripts

#### `get-dev-credentials.sh`
Sets up development credentials.

```bash
./scripts/get-dev-credentials.sh
```

#### `test-local-setup.sh`
Tests local development setup.

```bash
./scripts/test-local-setup.sh
```

## NPM Script Shortcuts

For convenience, all scripts are available as npm commands:

### Deployment
- `npm run deploy:dev` - Deploy to development
- `npm run deploy:prod` - Deploy to production
- `npm run teardown:dev` - Teardown development
- `npm run teardown:prod` - Teardown production

### Database
- `npm run db:migrate:dev` - Run dev migrations
- `npm run db:migrate:prod` - Run prod migrations
- `npm run db:seed:dev` - Seed dev database
- `npm run db:seed:prod` - Seed prod database
- `npm run db:backup:dev` - Backup dev database
- `npm run db:backup:prod` - Backup prod database

### Health Checks
- `npm run health:dev` - Check dev health
- `npm run health:prod` - Check prod health

### Performance Testing
- `npm run perf:smoke` - Smoke test
- `npm run perf:load` - Load test
- `npm run perf:stress` - Stress test
- `npm run perf:spike` - Spike test

## Safety Features

### Production Confirmations
All production operations that modify data require explicit confirmation:
- Database seeding: Type `SEED PRODUCTION`
- Database restore: Type `RESTORE PRODUCTION`
- Migration rollback: Type `ROLLBACK PRODUCTION`
- Environment teardown: Type `DELETE PRODUCTION`

### Automatic Backups
Scripts automatically create backups before destructive operations:
- Database migrations
- Database seeding
- Database restore
- Environment teardown (production only)

### Retry Logic
Health checks include retry logic:
- 30 attempts maximum
- 10-second delay between attempts
- Detailed error reporting

## Environment Variables

Scripts expect the following environment variables:

### Development
- `DATABASE_URL` - Development database connection string
- Loaded from `.env.development`

### Production
- `DATABASE_URL` - Production database connection string
- Loaded from `.env.production`

## Error Handling

All scripts:
- Exit on first error (`set -e`)
- Provide clear error messages
- Include safety checks for production
- Create backups before destructive operations

## Troubleshooting

If a script fails:

1. Check the error message for specific details
2. Verify environment variables are set correctly
3. Ensure you have necessary permissions (AWS, database, etc.)
4. Check the troubleshooting guide: `docs/TROUBLESHOOTING_GUIDE.md`
5. Review script logs for more context

## Best Practices

1. **Always test in development first** - Never run untested scripts in production
2. **Review backups regularly** - Ensure backups are being created and are valid
3. **Monitor performance tests** - Track performance trends over time
4. **Keep scripts updated** - Update scripts as infrastructure changes
5. **Document changes** - Update this README when adding or modifying scripts

## Contributing

When adding new scripts:

1. Follow the existing naming convention
2. Include environment parameter (`dev|prod`)
3. Add safety checks for production operations
4. Create backups before destructive operations
5. Add npm script shortcuts to `package.json`
6. Document the script in this README
7. Make the script executable: `chmod +x scripts/your-script.sh`

## Related Documentation

- [Deployment Procedures](../docs/DEPLOYMENT_PROCEDURES.md)
- [Troubleshooting Guide](../docs/TROUBLESHOOTING_GUIDE.md)
- [Infrastructure Setup](../docs/INFRASTRUCTURE_SETUP.md)
- [Development Guide](../docs/DEVELOPMENT_GUIDE.md)
