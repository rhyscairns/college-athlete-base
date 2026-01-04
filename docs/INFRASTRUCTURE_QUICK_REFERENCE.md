# Infrastructure Quick Reference

Quick commands and information for managing the College Athlete Base infrastructure.

## Quick Start

```bash
# Install dependencies
cd infrastructure && npm install

# Deploy development
npm run deploy:dev

# Deploy production
npm run deploy:prod
```

## Common Commands

### CDK Commands

```bash
# Preview changes
npm run diff:dev
npm run diff:prod

# Deploy
npm run deploy:dev
npm run deploy:prod

# Destroy
npm run destroy:dev
npm run destroy:prod

# Synthesize CloudFormation
npm run synth

# List all stacks
cdk list
```

### AWS CLI Commands

```bash
# Get database credentials
aws secretsmanager get-secret-value \
  --secret-id development/college-athlete-base/db-credentials \
  --query SecretString --output text | jq -r

# Check certificate status
aws acm describe-certificate \
  --certificate-arn <ARN> \
  --region us-east-1 \
  --query 'Certificate.Status'

# List ECS services
aws ecs list-services \
  --cluster development-college-athlete-base

# View ECS service details
aws ecs describe-services \
  --cluster development-college-athlete-base \
  --services development-college-athlete-base

# Check target group health
aws elbv2 describe-target-health \
  --target-group-arn <ARN>
```

## Environment URLs

- **Development**: https://collegeathletebase-dev.com
- **Production**: https://collegeathletebase.com
- **Health Check**: `/api/health`

## Stack Outputs

After deployment, get stack outputs:

```bash
# Development
aws cloudformation describe-stacks \
  --stack-name DevStack \
  --query 'Stacks[0].Outputs'

# Production
aws cloudformation describe-stacks \
  --stack-name ProdStack \
  --query 'Stacks[0].Outputs'
```

## Resource Names

### Development
- **Stack**: DevStack
- **Cluster**: development-college-athlete-base
- **Service**: development-college-athlete-base
- **Database**: DevStack-Database*
- **Cache**: DevStack-CacheCluster*
- **Secret**: development/college-athlete-base/db-credentials

### Production
- **Stack**: ProdStack
- **Cluster**: production-college-athlete-base
- **Service**: production-college-athlete-base
- **Database**: ProdStack-Database*
- **Cache**: ProdStack-CacheCluster*
- **Secret**: production/college-athlete-base/db-credentials

## CloudWatch Logs

```bash
# View application logs
aws logs tail /ecs/development-college-athlete-base --follow

# View database logs
aws logs tail /aws/rds/instance/<instance-id>/postgresql --follow
```

## Database Access

```bash
# Get connection string
aws secretsmanager get-secret-value \
  --secret-id development/college-athlete-base/db-credentials \
  --query SecretString --output text

# Connect with psql
psql -h <endpoint> -U postgres -d college_athlete_base
```

## Scaling

### Manual Scaling

```bash
# Update desired count
aws ecs update-service \
  --cluster development-college-athlete-base \
  --service development-college-athlete-base \
  --desired-count 3
```

### Auto-Scaling Limits

Edit `infrastructure/bin/app.ts` and redeploy:

```typescript
minCapacity: 1,
maxCapacity: 5,
```

## Monitoring

### Key Metrics

- **ECS Service**: CPU, Memory, Task Count
- **ALB**: Request Count, Target Response Time, HTTP Errors
- **RDS**: CPU, Connections, Storage, IOPS
- **ElastiCache**: CPU, Memory, Cache Hits/Misses

### CloudWatch Dashboard

Create custom dashboard:
```bash
aws cloudwatch put-dashboard \
  --dashboard-name CollegeAthleteBase-Dev \
  --dashboard-body file://dashboard.json
```

## Troubleshooting

### Check Service Status

```bash
# ECS service status
aws ecs describe-services \
  --cluster development-college-athlete-base \
  --services development-college-athlete-base \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount}'

# Task status
aws ecs list-tasks \
  --cluster development-college-athlete-base \
  --service-name development-college-athlete-base
```

### View Recent Logs

```bash
# Last 10 minutes
aws logs tail /ecs/development-college-athlete-base \
  --since 10m \
  --follow
```

### Check Health

```bash
# Application health
curl https://collegeathletebase-dev.com/api/health

# Target group health
aws elbv2 describe-target-health \
  --target-group-arn <ARN> \
  --query 'TargetHealthDescriptions[*].{Target:Target.Id,Health:TargetHealth.State}'
```

## Cost Management

### View Current Costs

```bash
# This month's costs
aws ce get-cost-and-usage \
  --time-period Start=$(date -u -d "$(date +%Y-%m-01)" +%Y-%m-%d),End=$(date -u +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --group-by Type=TAG,Key=Environment
```

### Cost Optimization

1. **Stop development environment overnight**:
   ```bash
   aws ecs update-service \
     --cluster development-college-athlete-base \
     --service development-college-athlete-base \
     --desired-count 0
   ```

2. **Use Savings Plans** for predictable workloads
3. **Enable RDS auto-pause** for development (if using Aurora Serverless)
4. **Review and delete unused resources** regularly

## Backup and Recovery

### Create Manual Snapshot

```bash
# RDS snapshot
aws rds create-db-snapshot \
  --db-instance-identifier <instance-id> \
  --db-snapshot-identifier manual-snapshot-$(date +%Y%m%d)
```

### Restore from Snapshot

```bash
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier restored-instance \
  --db-snapshot-identifier <snapshot-id>
```

## Security

### Rotate Database Credentials

```bash
# Trigger rotation
aws secretsmanager rotate-secret \
  --secret-id development/college-athlete-base/db-credentials
```

### Update Security Groups

```bash
# Add IP to security group
aws ec2 authorize-security-group-ingress \
  --group-id <sg-id> \
  --protocol tcp \
  --port 5432 \
  --cidr <your-ip>/32
```

## Emergency Procedures

### Rollback Deployment

```bash
# Revert to previous task definition
aws ecs update-service \
  --cluster production-college-athlete-base \
  --service production-college-athlete-base \
  --task-definition <previous-task-def>
```

### Scale Down Immediately

```bash
aws ecs update-service \
  --cluster production-college-athlete-base \
  --service production-college-athlete-base \
  --desired-count 1
```

### Stop All Tasks

```bash
# List tasks
TASKS=$(aws ecs list-tasks \
  --cluster production-college-athlete-base \
  --service-name production-college-athlete-base \
  --query 'taskArns[]' --output text)

# Stop each task
for task in $TASKS; do
  aws ecs stop-task --cluster production-college-athlete-base --task $task
done
```

## Useful Links

- [AWS Console - ECS](https://console.aws.amazon.com/ecs)
- [AWS Console - RDS](https://console.aws.amazon.com/rds)
- [AWS Console - CloudWatch](https://console.aws.amazon.com/cloudwatch)
- [AWS Console - Secrets Manager](https://console.aws.amazon.com/secretsmanager)
- [AWS Console - Route53](https://console.aws.amazon.com/route53)
- [AWS Console - Certificate Manager](https://console.aws.amazon.com/acm)

## Support Contacts

- **AWS Support**: https://console.aws.amazon.com/support
- **Infrastructure Issues**: Check CloudFormation events
- **Application Issues**: Check CloudWatch Logs
