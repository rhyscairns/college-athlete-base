# Deployment Quick Reference

Quick reference for common deployment operations. For detailed procedures, see [DEPLOYMENT_PROCEDURES.md](./DEPLOYMENT_PROCEDURES.md).

## Common Operations

### Deploy to Development
```bash
npm run deploy:dev
```

### Deploy to Production
```bash
npm run deploy:prod
```

### Check Application Health
```bash
# Development
npm run health:dev

# Production
npm run health:prod
```

### Run Database Migrations
```bash
# Development
npm run db:migrate:dev

# Production
npm run db:migrate:prod
```

### Backup Database
```bash
# Development
npm run db:backup:dev

# Production
npm run db:backup:prod
```

### Restore Database
```bash
# Development
npm run db:restore:dev backups/dev/backup_YYYYMMDD_HHMMSS.sql.gz

# Production (requires confirmation)
npm run db:restore:prod backups/prod/backup_YYYYMMDD_HHMMSS.sql.gz
```

### Seed Database
```bash
# Development
npm run db:seed:dev

# Production (requires confirmation)
npm run db:seed:prod
```

### Performance Testing
```bash
# Quick smoke test
npm run perf:smoke

# Full load test
npm run perf:load

# Stress test
npm run perf:stress

# Spike test
npm run perf:spike
```

### Teardown Environment
```bash
# Development
npm run teardown:dev

# Production (requires confirmation)
npm run teardown:prod
```

## Emergency Procedures

### Rollback Deployment
```bash
# Checkout previous version
git checkout <previous-tag>

# Redeploy
npm run deploy:prod

# Verify
npm run health:prod
```

### Rollback Database Migration
```bash
./scripts/db-migrate.sh prod down
```

### Restore from Backup
```bash
# List available backups
ls -lh backups/prod/

# Restore
./scripts/restore-database.sh prod backups/prod/backup_YYYYMMDD_HHMMSS.sql.gz
```

## Pre-Deployment Checklist

- [ ] All tests passing locally
- [ ] Code reviewed and approved
- [ ] Changes tested in development environment
- [ ] Database migrations tested
- [ ] Backup created (for production)
- [ ] Team notified of deployment
- [ ] Rollback plan prepared

## Post-Deployment Checklist

- [ ] Health checks passing
- [ ] Critical user flows tested
- [ ] No errors in logs
- [ ] Performance metrics normal
- [ ] Team notified of completion

## Monitoring

### View Logs
```bash
# Docker logs
docker logs college-athlete-base --tail 100 -f

# AWS CloudWatch logs
aws logs tail /aws/ecs/college-athlete --follow
```

### Check Metrics
```bash
# CPU usage
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=college-athlete-service \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average

# Memory usage
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name MemoryUtilization \
  --dimensions Name=ServiceName,Value=college-athlete-service \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

## Troubleshooting

### Deployment Fails
1. Check GitHub Actions logs
2. Verify AWS credentials
3. Check CloudFormation events
4. Review application logs
5. See [TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)

### Health Check Fails
1. Check application logs
2. Verify database connectivity
3. Check environment variables
4. Test health endpoint manually
5. See [TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)

### Performance Issues
1. Run performance tests
2. Check CloudWatch metrics
3. Review database queries
4. Check for memory leaks
5. See [TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)

## Useful Commands

```bash
# Build and test locally
npm run build
npm test
npm run test:e2e

# Docker operations
npm run docker:build
npm run docker:up
npm run docker:down
npm run docker:logs

# Infrastructure operations
cd infrastructure
npm run diff:dev
npm run diff:prod
npm run synth

# Branch protection
npm run branch-protection:configure
npm run branch-protection:verify
```

## Environment URLs

- **Development**: https://collegeathletebase-dev.com
- **Production**: https://collegeathletebase.com

## Support

- Documentation: `docs/` directory
- Troubleshooting: [TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)
- Deployment Procedures: [DEPLOYMENT_PROCEDURES.md](./DEPLOYMENT_PROCEDURES.md)
- Scripts Documentation: [scripts/README.md](../scripts/README.md)
