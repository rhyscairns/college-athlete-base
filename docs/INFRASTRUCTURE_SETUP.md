# Infrastructure Setup Guide

This guide walks you through setting up the complete infrastructure for the College Athlete Base platform on AWS.

## Overview

The infrastructure consists of two separate environments:
- **Development**: collegeathletebase-dev.com
- **Production**: collegeathletebase.com

Each environment includes:
- VPC with multi-tier networking (public, private, isolated subnets)
- ECS Fargate for containerized application hosting
- Application Load Balancer with SSL/TLS
- RDS PostgreSQL database
- ElastiCache Redis for caching
- Auto-scaling and health monitoring
- CloudWatch logging

## Prerequisites

Before starting, ensure you have:

1. **AWS Account** with administrative access
2. **AWS CLI** installed and configured
   ```bash
   aws configure
   ```
3. **Node.js** (v18 or higher)
   ```bash
   node --version
   ```
4. **AWS CDK** installed globally
   ```bash
   npm install -g aws-cdk
   cdk --version
   ```
5. **Domain Names** registered:
   - collegeathletebase-dev.com (development)
   - collegeathletebase.com (production)

## Step-by-Step Setup

### Step 1: Install Infrastructure Dependencies

```bash
cd infrastructure
npm install
```

### Step 2: Bootstrap AWS CDK

Bootstrap your AWS account for CDK (only needed once per account/region):

```bash
cdk bootstrap aws://YOUR-ACCOUNT-ID/us-east-1
```

Replace `YOUR-ACCOUNT-ID` with your actual AWS account ID.

### Step 3: Set Up DNS Hosted Zones

Create Route53 hosted zones for both domains:

```bash
cd scripts
./setup-dns.sh
```

This script will:
- Create hosted zones for both domains
- Output the nameservers for each domain

**Action Required**: Update your domain registrar with the nameservers provided by the script.

**Note**: DNS propagation can take 24-48 hours. You can verify with:
```bash
dig NS collegeathletebase-dev.com
dig NS collegeathletebase.com
```

### Step 4: Request SSL Certificates

Request SSL certificates from AWS Certificate Manager:

```bash
./setup-certificates.sh
```

This script will:
- Request certificates for both domains (including wildcard subdomains)
- Output the certificate ARNs
- Display DNS validation records

### Step 5: Validate Certificates

Add the DNS validation records to Route53:

```bash
./validate-certificates.sh
```

This script automatically adds the validation records to your hosted zones.

**Wait for Validation**: Certificate validation typically takes 5-30 minutes. Check status with:

```bash
# Development
aws acm describe-certificate \
  --certificate-arn YOUR-DEV-CERT-ARN \
  --region us-east-1 \
  --query 'Certificate.Status'

# Production
aws acm describe-certificate \
  --certificate-arn YOUR-PROD-CERT-ARN \
  --region us-east-1 \
  --query 'Certificate.Status'
```

Wait until both show `"ISSUED"` before proceeding.

### Step 6: Configure Environment Variables

Create a `.env` file in the infrastructure directory:

```bash
cd ..
cp .env.example .env
```

Edit `.env` with your actual values:

```bash
# AWS Account Configuration
CDK_DEFAULT_ACCOUNT=123456789012
CDK_DEFAULT_REGION=us-east-1

# Development Environment
DEV_CERTIFICATE_ARN=arn:aws:acm:us-east-1:123456789012:certificate/dev-cert-id
DEV_HOSTED_ZONE_ID=Z1234567890ABC

# Production Environment
PROD_CERTIFICATE_ARN=arn:aws:acm:us-east-1:123456789012:certificate/prod-cert-id
PROD_HOSTED_ZONE_ID=Z0987654321XYZ
```

### Step 7: Preview Infrastructure Changes

Before deploying, preview what will be created:

```bash
# Development
npm run diff:dev

# Production
npm run diff:prod
```

### Step 8: Deploy Development Environment

Deploy the development infrastructure:

```bash
npm run deploy:dev
```

This will create:
- VPC with networking components
- RDS PostgreSQL database (db.t4g.micro)
- ElastiCache Redis cluster (cache.t4g.micro)
- ECS Fargate cluster and service
- Application Load Balancer with SSL
- Auto-scaling configuration
- CloudWatch logging

**Deployment Time**: Approximately 15-20 minutes

### Step 9: Verify Development Deployment

After deployment completes, note the outputs:

```bash
Outputs:
DevStack.LoadBalancerDNS = dev-alb-123456789.us-east-1.elb.amazonaws.com
DevStack.ServiceURL = https://collegeathletebase-dev.com
DevStack.DatabaseEndpoint = dev-db.abc123.us-east-1.rds.amazonaws.com
DevStack.RedisEndpoint = dev-cache.abc123.0001.use1.cache.amazonaws.com:6379
DevStack.DatabaseSecretArn = arn:aws:secretsmanager:us-east-1:123456789012:secret:...
```

Test the health endpoint:

```bash
curl https://collegeathletebase-dev.com/api/health
```

### Step 10: Deploy Production Environment

Deploy the production infrastructure:

```bash
npm run deploy:prod
```

**Important**: This deployment requires manual approval due to production safeguards.

Production includes:
- Multi-AZ database for high availability
- Larger instance sizes (db.t4g.small, cache.t4g.small)
- Multiple NAT gateways for redundancy
- Deletion protection enabled
- 7-day backup retention
- Container insights enabled

**Deployment Time**: Approximately 20-25 minutes

### Step 11: Verify Production Deployment

Test the production health endpoint:

```bash
curl https://collegeathletebase.com/api/health
```

## Post-Deployment Configuration

### Update GitHub Secrets

Add these secrets to your GitHub repository for CI/CD:

```bash
# AWS Credentials
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION

# Development Environment
DEV_DATABASE_SECRET_ARN
DEV_ECS_CLUSTER_NAME
DEV_ECS_SERVICE_NAME

# Production Environment
PROD_DATABASE_SECRET_ARN
PROD_ECS_CLUSTER_NAME
PROD_ECS_SERVICE_NAME
```

### Configure Database

Connect to the database and run initial migrations:

```bash
# Get database credentials
aws secretsmanager get-secret-value \
  --secret-id development/college-athlete-base/db-credentials \
  --query SecretString \
  --output text | jq -r

# Connect using psql
psql -h <database-endpoint> -U postgres -d college_athlete_base
```

### Set Up Monitoring

1. **CloudWatch Dashboards**: Create custom dashboards for key metrics
2. **Alarms**: Set up alarms for critical metrics (CPU, memory, errors)
3. **SNS Topics**: Configure notifications for alerts

## Environment Access

### Development Environment

- **URL**: https://collegeathletebase-dev.com
- **Database**: Access via Secrets Manager
- **Redis**: Available at endpoint from stack outputs
- **Logs**: CloudWatch Logs `/ecs/development-college-athlete-base`

### Production Environment

- **URL**: https://collegeathletebase.com
- **Database**: Access via Secrets Manager (with stricter access controls)
- **Redis**: Available at endpoint from stack outputs
- **Logs**: CloudWatch Logs `/ecs/production-college-athlete-base`

## Cost Estimates

### Development Environment
- **Monthly**: ~$50-100
  - RDS: $15
  - ElastiCache: $12
  - ECS Fargate: $15-30
  - NAT Gateway: $32
  - ALB: $16

### Production Environment
- **Monthly**: ~$200-400
  - RDS: $60 (Multi-AZ)
  - ElastiCache: $24
  - ECS Fargate: $60-180
  - NAT Gateway: $64 (2x)
  - ALB: $16

## Maintenance

### Regular Tasks

1. **Monitor Costs**: Review AWS Cost Explorer weekly
2. **Check Logs**: Review CloudWatch Logs for errors
3. **Database Backups**: Verify automated backups are running
4. **Security Updates**: Keep dependencies updated
5. **Certificate Renewal**: ACM handles this automatically

### Scaling Adjustments

To adjust auto-scaling limits, edit `infrastructure/bin/app.ts`:

```typescript
// Development
minCapacity: 1,
maxCapacity: 2,

// Production
minCapacity: 2,
maxCapacity: 10,
```

Then redeploy:
```bash
npm run deploy:dev  # or deploy:prod
```

## Troubleshooting

### Certificate Validation Stuck

If certificates remain in "Pending Validation":
1. Verify DNS records are correct in Route53
2. Check nameservers are properly configured at registrar
3. Wait up to 72 hours for DNS propagation
4. Check for DNSSEC issues

### Deployment Fails

Common issues:
1. **Insufficient Permissions**: Ensure IAM user has required permissions
2. **Resource Limits**: Check AWS service quotas
3. **VPC Limits**: Verify VPC and subnet availability
4. **Certificate Not Issued**: Ensure certificates are validated

### Application Not Accessible

1. Check ECS service is running: AWS Console → ECS → Clusters
2. Verify target group health: AWS Console → EC2 → Target Groups
3. Check security groups allow traffic
4. Verify DNS records point to load balancer
5. Check certificate is valid and attached to ALB

### Database Connection Issues

1. Verify security group rules allow ECS → RDS traffic
2. Check database is available: AWS Console → RDS
3. Verify credentials in Secrets Manager
4. Check VPC and subnet configuration
5. Review database logs in CloudWatch

## Cleanup

### Remove Development Environment

```bash
npm run destroy:dev
```

### Remove Production Environment

Production has deletion protection. First disable it:

1. Go to AWS Console → RDS
2. Select the production database
3. Modify → Disable deletion protection
4. Then run:
   ```bash
   npm run destroy:prod
   ```

**Warning**: This will permanently delete all resources and data.

## Next Steps

After infrastructure is set up:

1. ✅ Configure CI/CD pipelines to deploy to these environments
2. ✅ Set up monitoring and alerting
3. ✅ Configure database migrations
4. ✅ Implement backup and disaster recovery procedures
5. ✅ Set up application performance monitoring (APM)

## Support

For issues or questions:
- Check AWS CloudFormation events in the console
- Review CloudWatch Logs for application errors
- Consult the [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- Review the infrastructure README: `infrastructure/README.md`
