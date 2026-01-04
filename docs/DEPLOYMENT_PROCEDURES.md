# Deployment Procedures

This document provides comprehensive procedures for deploying and managing the College Athlete Base platform across different environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Workflows](#deployment-workflows)
- [Database Management](#database-management)
- [Backup and Restore](#backup-and-restore)
- [Performance Testing](#performance-testing)
- [Rollback Procedures](#rollback-procedures)

## Prerequisites

Before deploying, ensure you have:

- AWS CLI configured with appropriate credentials
- Docker installed and running
- Node.js 18+ and npm installed
- Access to GitHub repository with appropriate permissions
- Environment variables configured for target environment

## Environment Setup

### Development Environment

Deploy to the development environment (collegeathletebase-dev.com):

```bash
# Deploy infrastructure and application
./scripts/deploy-environment.sh dev

# Run health checks
./scripts/health-check.sh collegeathletebase-dev.com
```

### Production Environment

Deploy to the production environment (collegeathletebase.com):

```bash
# Deploy infrastructure and application
./scripts/deploy-environment.sh prod

# Run health checks
./scripts/health-check.sh collegeathletebase.com
```

**Note:** Production deployments require manual approval and additional safety checks.

## Deployment Workflows

### Automated Development Deployment

Development deployments are triggered automatically when code is merged to the main branch:

1. Code is merged to `main` branch
2. GitHub Actions workflow `.github/workflows/deploy-dev.yml` triggers
3. Application is built and tested
4. Docker image is created and pushed to registry
5. Infrastructure is deployed via CDK
6. Health checks verify deployment success

### Manual Production Deployment

Production deployments require manual triggering:

1. Navigate to GitHub Actions
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Provide required inputs (version, approval)
5. Monitor deployment progress
6. Verify health checks pass

## Database Management

### Running Migrations

Apply database migrations to an environment:

```bash
# Development
./scripts/db-migrate.sh dev up

# Production (requires confirmation)
./scripts/db-migrate.sh prod up
```

### Rolling Back Migrations

Rollback the last migration:

```bash
# Development
./scripts/db-migrate.sh dev down

# Production (requires confirmation)
./scripts/db-migrate.sh prod down
```

### Seeding Database

Populate database with seed data:

```bash
# Development with default seed data
./scripts/db-seed.sh dev

# Development with specific seed type
./scripts/db-seed.sh dev test-data

# Production (requires confirmation)
./scripts/db-seed.sh prod
```

## Backup and Restore

### Creating Backups

Create a database backup:

```bash
# Development
./scripts/backup-database.sh dev

# Production
./scripts/backup-database.sh prod
```

Backups are stored in `backups/[environment]/` directory and automatically compressed.

Production backups are also uploaded to S3 for redundancy.

### Restoring from Backup

Restore database from a backup file:

```bash
# Development
./scripts/restore-database.sh dev backups/dev/backup_20260104_120000.sql.gz

# Production (requires confirmation)
./scripts/restore-database.sh prod backups/prod/backup_20260104_120000.sql.gz
```

**Warning:** Restoring will overwrite the current database. A backup of the current state is created automatically before restore.

### Backup Retention

- Development backups: 30 days
- Production backups: 90 days (in S3)
- Automated cleanup runs after each backup

## Performance Testing

### Running Performance Tests

Test application performance under various load conditions:

```bash
# Smoke test (minimal load)
./scripts/performance-test.sh collegeathletebase-dev.com smoke

# Load test (sustained load)
./scripts/performance-test.sh collegeathletebase-dev.com load

# Stress test (increasing load)
./scripts/performance-test.sh collegeathletebase-dev.com stress

# Spike test (sudden traffic spike)
./scripts/performance-test.sh collegeathletebase-dev.com spike
```

Results are saved to `test-results/performance/` directory.

### Performance Test Types

- **Smoke Test**: 1 VU for 1 minute - verifies basic functionality
- **Load Test**: 10 VUs for 5 minutes - tests normal load conditions
- **Stress Test**: Ramps up to 100 VUs - finds breaking point
- **Spike Test**: Sudden spike to 100 VUs - tests elasticity

### Performance Thresholds

- Response time (p95): < 1000ms for normal operations
- Error rate: < 5% under load
- Health check: < 200ms response time

## Rollback Procedures

### Application Rollback

If a deployment fails or issues are detected:

1. **Automatic Rollback**: Production deployments automatically rollback on health check failure
2. **Manual Rollback**: Redeploy previous version

```bash
# Redeploy previous version
git checkout <previous-version-tag>
./scripts/deploy-environment.sh prod
```

### Database Rollback

If database migration causes issues:

```bash
# Rollback migration
./scripts/db-migrate.sh prod down

# Or restore from backup
./scripts/restore-database.sh prod backups/prod/backup_<timestamp>.sql.gz
```

### Infrastructure Rollback

If infrastructure changes cause issues:

```bash
cd infrastructure
git checkout <previous-version>
npm run deploy:prod
```

## Environment Teardown

### Tearing Down an Environment

Remove all resources for an environment:

```bash
# Development
./scripts/teardown-environment.sh dev

# Production (requires confirmation)
./scripts/teardown-environment.sh prod
```

**Warning:** This will delete all infrastructure and resources. Production teardown requires explicit confirmation.

## Monitoring and Verification

### Post-Deployment Checks

After any deployment, verify:

1. **Health Checks**: Application responds to health endpoint
2. **Functionality**: Critical user flows work correctly
3. **Performance**: Response times are within acceptable range
4. **Logs**: No critical errors in application logs
5. **Metrics**: CPU, memory, and database metrics are normal

### Health Check Command

```bash
./scripts/health-check.sh <domain>
```

The script will:
- Make up to 30 attempts with 10-second delays
- Check HTTP status code (expects 200)
- Display detailed health response
- Exit with error code if health check fails

## Emergency Procedures

### Application Down

1. Check health endpoint: `./scripts/health-check.sh <domain>`
2. Check application logs in CloudWatch
3. Verify infrastructure is running: `cd infrastructure && npm run diff:prod`
4. If needed, rollback to previous version
5. Escalate to on-call engineer if issue persists

### Database Issues

1. Check database connectivity
2. Review recent migrations
3. Check database logs
4. If needed, rollback migration or restore from backup
5. Verify data integrity after restore

### Performance Degradation

1. Run performance tests to identify bottleneck
2. Check CloudWatch metrics for resource constraints
3. Review recent code changes
4. Scale infrastructure if needed
5. Consider rollback if performance doesn't improve

## Best Practices

1. **Always backup before major changes**: Migrations, deployments, configuration changes
2. **Test in development first**: Never deploy untested changes to production
3. **Monitor deployments**: Watch logs and metrics during and after deployment
4. **Use feature flags**: For risky features, use feature flags to enable gradually
5. **Document incidents**: Keep a log of issues and resolutions for future reference
6. **Automate when possible**: Use scripts and workflows to reduce human error
7. **Verify rollback procedures**: Regularly test rollback procedures in development

## Support and Escalation

For deployment issues:

1. Check this documentation and troubleshooting guide
2. Review application and infrastructure logs
3. Consult with team members
4. Escalate to DevOps team if needed
5. For critical production issues, follow incident response procedures
