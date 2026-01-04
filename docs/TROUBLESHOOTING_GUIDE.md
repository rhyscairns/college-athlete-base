# Troubleshooting Guide

This guide helps diagnose and resolve common issues with the College Athlete Base platform deployment and operations.

## Table of Contents

- [Deployment Issues](#deployment-issues)
- [Database Issues](#database-issues)
- [Performance Issues](#performance-issues)
- [Infrastructure Issues](#infrastructure-issues)
- [CI/CD Pipeline Issues](#cicd-pipeline-issues)
- [Application Issues](#application-issues)

## Deployment Issues

### Deployment Fails with Health Check Timeout

**Symptoms:**
- Deployment script times out waiting for health check
- Application doesn't respond to health endpoint

**Diagnosis:**
```bash
# Check if application is running
docker ps

# Check application logs
docker logs college-athlete-base

# Try health check manually
curl https://collegeathletebase-dev.com/api/health
```

**Solutions:**

1. **Application not starting:**
   ```bash
   # Check Docker logs for startup errors
   docker logs college-athlete-base --tail 100
   
   # Verify environment variables are set
   docker exec college-athlete-base env | grep DATABASE_URL
   ```

2. **Port binding issues:**
   ```bash
   # Check if port is already in use
   lsof -i :3000
   
   # Kill conflicting process or use different port
   ```

3. **Database connection issues:**
   ```bash
   # Test database connectivity
   docker exec college-athlete-base npm run db:test-connection
   ```

### Docker Build Fails

**Symptoms:**
- `docker build` command fails
- Build errors in CI/CD pipeline

**Diagnosis:**
```bash
# Build with verbose output
docker build --progress=plain -t college-athlete-base .

# Check Docker daemon status
docker info
```

**Solutions:**

1. **Dependency installation fails:**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Remove node_modules and package-lock.json
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Build context too large:**
   ```bash
   # Check .dockerignore file
   cat .dockerignore
   
   # Add missing exclusions
   echo "node_modules" >> .dockerignore
   echo ".next" >> .dockerignore
   ```

3. **Out of disk space:**
   ```bash
   # Clean up Docker resources
   docker system prune -a
   ```

### Infrastructure Deployment Fails

**Symptoms:**
- CDK deployment fails
- CloudFormation stack in failed state

**Diagnosis:**
```bash
cd infrastructure

# Check CDK diff
npm run diff:dev

# View CloudFormation events
aws cloudformation describe-stack-events --stack-name DevStack
```

**Solutions:**

1. **Resource already exists:**
   ```bash
   # Import existing resource or delete it
   aws cloudformation delete-stack --stack-name DevStack
   
   # Wait for deletion to complete
   aws cloudformation wait stack-delete-complete --stack-name DevStack
   
   # Redeploy
   npm run deploy:dev
   ```

2. **Insufficient permissions:**
   ```bash
   # Verify AWS credentials
   aws sts get-caller-identity
   
   # Check IAM permissions
   aws iam get-user
   ```

3. **Resource limit exceeded:**
   ```bash
   # Check service quotas
   aws service-quotas list-service-quotas --service-code ec2
   
   # Request quota increase if needed
   ```

## Database Issues

### Migration Fails

**Symptoms:**
- Migration script exits with error
- Database schema not updated

**Diagnosis:**
```bash
# Check database connectivity
psql $DATABASE_URL -c "SELECT version();"

# View migration status
npm run db:migration:status
```

**Solutions:**

1. **Migration already applied:**
   ```bash
   # Check migration history
   npm run db:migration:history
   
   # Skip or rollback conflicting migration
   ./scripts/db-migrate.sh dev down
   ```

2. **Syntax error in migration:**
   ```bash
   # Review migration file
   cat migrations/XXXXXX_migration_name.sql
   
   # Test SQL manually
   psql $DATABASE_URL -f migrations/XXXXXX_migration_name.sql
   ```

3. **Database locked:**
   ```bash
   # Check for long-running queries
   psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"
   
   # Terminate blocking queries (use with caution)
   psql $DATABASE_URL -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND pid != pg_backend_pid();"
   ```

### Cannot Connect to Database

**Symptoms:**
- Application cannot connect to database
- Connection timeout errors

**Diagnosis:**
```bash
# Test database connectivity
psql $DATABASE_URL -c "SELECT 1;"

# Check database is running
aws rds describe-db-instances --db-instance-identifier college-athlete-db-dev
```

**Solutions:**

1. **Incorrect connection string:**
   ```bash
   # Verify DATABASE_URL format
   echo $DATABASE_URL
   
   # Should be: postgresql://user:password@host:port/database
   ```

2. **Security group blocking connection:**
   ```bash
   # Check security group rules
   aws ec2 describe-security-groups --group-ids sg-xxxxx
   
   # Add inbound rule for database port
   aws ec2 authorize-security-group-ingress --group-id sg-xxxxx --protocol tcp --port 5432 --cidr 0.0.0.0/0
   ```

3. **Database not running:**
   ```bash
   # Start database instance
   aws rds start-db-instance --db-instance-identifier college-athlete-db-dev
   ```

### Backup or Restore Fails

**Symptoms:**
- Backup script fails to create backup
- Restore script fails to restore data

**Diagnosis:**
```bash
# Check disk space
df -h

# Verify backup file exists and is readable
ls -lh backups/dev/

# Test database access
psql $DATABASE_URL -c "SELECT 1;"
```

**Solutions:**

1. **Insufficient disk space:**
   ```bash
   # Clean up old backups
   find backups/ -name "*.sql.gz" -mtime +30 -delete
   
   # Free up space
   docker system prune -a
   ```

2. **Permission issues:**
   ```bash
   # Fix backup directory permissions
   chmod 755 backups/
   chmod 644 backups/dev/*.sql.gz
   ```

3. **Corrupted backup file:**
   ```bash
   # Test backup file integrity
   gunzip -t backups/dev/backup_XXXXXX.sql.gz
   
   # Use a different backup file
   ls -lt backups/dev/
   ```

## Performance Issues

### Slow Response Times

**Symptoms:**
- API requests take longer than expected
- Pages load slowly

**Diagnosis:**
```bash
# Run performance test
./scripts/performance-test.sh collegeathletebase-dev.com smoke

# Check application metrics
aws cloudwatch get-metric-statistics --namespace AWS/ECS --metric-name CPUUtilization --dimensions Name=ServiceName,Value=college-athlete-service --start-time 2026-01-04T00:00:00Z --end-time 2026-01-04T23:59:59Z --period 3600 --statistics Average
```

**Solutions:**

1. **High CPU usage:**
   ```bash
   # Scale up application instances
   aws ecs update-service --cluster college-athlete-cluster --service college-athlete-service --desired-count 3
   ```

2. **Database slow queries:**
   ```bash
   # Identify slow queries
   psql $DATABASE_URL -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
   
   # Add missing indexes
   ```

3. **Memory issues:**
   ```bash
   # Check memory usage
   docker stats college-athlete-base
   
   # Increase container memory limit
   ```

### High Error Rate

**Symptoms:**
- Performance tests show high error rate
- Users reporting errors

**Diagnosis:**
```bash
# Check application logs
docker logs college-athlete-base --tail 100 | grep ERROR

# Run load test to reproduce
./scripts/performance-test.sh collegeathletebase-dev.com load
```

**Solutions:**

1. **Rate limiting:**
   ```bash
   # Adjust rate limits in application configuration
   # Or scale up to handle more requests
   ```

2. **Resource exhaustion:**
   ```bash
   # Check database connection pool
   psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
   
   # Increase connection pool size
   ```

3. **Application errors:**
   ```bash
   # Review error logs for patterns
   docker logs college-athlete-base 2>&1 | grep -A 5 "ERROR"
   
   # Fix identified issues and redeploy
   ```

## Infrastructure Issues

### SSL Certificate Issues

**Symptoms:**
- HTTPS not working
- Certificate expired warnings

**Diagnosis:**
```bash
# Check certificate status
openssl s_client -connect collegeathletebase-dev.com:443 -servername collegeathletebase-dev.com

# Check ACM certificate
aws acm list-certificates
```

**Solutions:**

1. **Certificate not validated:**
   ```bash
   # Check DNS validation records
   aws acm describe-certificate --certificate-arn arn:aws:acm:...
   
   # Add required DNS records
   ```

2. **Certificate expired:**
   ```bash
   # Request new certificate
   aws acm request-certificate --domain-name collegeathletebase-dev.com
   
   # Update load balancer to use new certificate
   ```

### DNS Issues

**Symptoms:**
- Domain not resolving
- Wrong IP address returned

**Diagnosis:**
```bash
# Check DNS resolution
nslookup collegeathletebase-dev.com

# Check Route53 records
aws route53 list-resource-record-sets --hosted-zone-id Z1234567890ABC
```

**Solutions:**

1. **Missing DNS record:**
   ```bash
   # Add A record pointing to load balancer
   aws route53 change-resource-record-sets --hosted-zone-id Z1234567890ABC --change-batch file://dns-change.json
   ```

2. **DNS propagation delay:**
   ```bash
   # Wait for DNS propagation (up to 48 hours)
   # Use direct IP address temporarily
   curl http://XX.XX.XX.XX/api/health -H "Host: collegeathletebase-dev.com"
   ```

## CI/CD Pipeline Issues

### Pipeline Fails on Pull Request

**Symptoms:**
- GitHub Actions workflow fails
- Status checks not passing

**Diagnosis:**
```bash
# Check workflow logs in GitHub Actions UI
# Or use GitHub CLI
gh run list --workflow=pr-check.yml
gh run view <run-id> --log
```

**Solutions:**

1. **Test failures:**
   ```bash
   # Run tests locally
   npm test
   
   # Fix failing tests
   # Push changes
   ```

2. **Lint errors:**
   ```bash
   # Run linter locally
   npm run lint
   
   # Fix lint errors
   npm run lint -- --fix
   ```

3. **SonarCloud quality gate failure:**
   ```bash
   # View SonarCloud report
   # Fix identified code quality issues
   # Push changes
   ```

### Deployment Workflow Fails

**Symptoms:**
- Deployment workflow fails in GitHub Actions
- Application not deployed

**Diagnosis:**
```bash
# Check workflow logs
gh run list --workflow=deploy-dev.yml
gh run view <run-id> --log

# Check AWS resources
aws ecs describe-services --cluster college-athlete-cluster --services college-athlete-service
```

**Solutions:**

1. **AWS credentials expired:**
   ```bash
   # Update GitHub secrets with new credentials
   # Go to Settings > Secrets > Actions
   # Update AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
   ```

2. **Docker registry authentication:**
   ```bash
   # Re-authenticate to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   ```

3. **Deployment timeout:**
   ```bash
   # Increase timeout in workflow file
   # Or check why deployment is slow
   ```

## Application Issues

### Application Crashes on Startup

**Symptoms:**
- Container starts then immediately exits
- Application logs show startup errors

**Diagnosis:**
```bash
# Check container logs
docker logs college-athlete-base

# Check container status
docker ps -a | grep college-athlete-base
```

**Solutions:**

1. **Missing environment variables:**
   ```bash
   # Check required environment variables
   docker exec college-athlete-base env
   
   # Add missing variables to .env file or docker-compose.yml
   ```

2. **Port already in use:**
   ```bash
   # Find process using port
   lsof -i :3000
   
   # Kill process or change port
   ```

3. **Dependency issues:**
   ```bash
   # Rebuild with fresh dependencies
   docker build --no-cache -t college-athlete-base .
   ```

### Memory Leaks

**Symptoms:**
- Memory usage continuously increases
- Application becomes unresponsive over time

**Diagnosis:**
```bash
# Monitor memory usage
docker stats college-athlete-base

# Check for memory leaks in Node.js
docker exec college-athlete-base node --expose-gc --inspect=0.0.0.0:9229 dist/index.js
```

**Solutions:**

1. **Restart application periodically:**
   ```bash
   # Add health check and restart policy
   # In docker-compose.yml or ECS task definition
   ```

2. **Profile and fix memory leaks:**
   ```bash
   # Use Node.js profiling tools
   # Identify and fix leaking code
   ```

3. **Increase memory limit:**
   ```bash
   # Temporary solution while investigating
   docker update --memory 2g college-athlete-base
   ```

## Getting Help

If you cannot resolve an issue using this guide:

1. Check application and infrastructure logs for more details
2. Search for similar issues in the project's issue tracker
3. Consult with team members
4. For critical production issues, follow incident response procedures
5. Document the issue and solution for future reference

## Useful Commands Reference

```bash
# Health checks
./scripts/health-check.sh <domain>

# View logs
docker logs college-athlete-base --tail 100 -f
aws logs tail /aws/ecs/college-athlete --follow

# Database operations
./scripts/backup-database.sh <env>
./scripts/restore-database.sh <env> <backup-file>
./scripts/db-migrate.sh <env> up

# Performance testing
./scripts/performance-test.sh <domain> <test-type>

# Infrastructure
cd infrastructure && npm run diff:<env>
cd infrastructure && npm run deploy:<env>

# Rollback
git checkout <previous-version>
./scripts/deploy-environment.sh <env>
```
