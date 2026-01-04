# College Athlete Base - Infrastructure

This directory contains the Infrastructure as Code (IaC) for the College Athlete Base platform using AWS CDK (Cloud Development Kit) with TypeScript.

## Architecture Overview

The infrastructure creates two separate environments:
- **Development**: collegeathletebase-dev.com
- **Production**: collegeathletebase.com

Each environment includes:
- VPC with public, private, and isolated subnets
- ECS Fargate cluster for containerized Next.js application
- Application Load Balancer with SSL/TLS termination
- RDS PostgreSQL database with automated backups
- ElastiCache Redis for caching and session management
- Auto-scaling based on CPU and memory utilization
- CloudWatch logging and monitoring

## Prerequisites

1. **AWS Account**: Active AWS account with appropriate permissions
2. **AWS CLI**: Installed and configured with credentials
3. **Node.js**: Version 18 or higher
4. **AWS CDK**: Install globally with `npm install -g aws-cdk`
5. **Domain Names**: Registered domains for both environments
6. **SSL Certificates**: ACM certificates for both domains
7. **Route53 Hosted Zones**: DNS zones for both domains

## Initial Setup

### 1. Install Dependencies

```bash
cd infrastructure
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- AWS account ID and region
- ACM certificate ARNs for both environments
- Route53 hosted zone IDs for both domains

### 3. Bootstrap CDK (First Time Only)

Bootstrap your AWS account for CDK deployments:

```bash
cdk bootstrap aws://ACCOUNT-ID/REGION
```

Replace `ACCOUNT-ID` and `REGION` with your values.

## SSL Certificate Setup

### Option 1: Request Certificates via AWS Console

1. Go to AWS Certificate Manager (ACM) in us-east-1 region
2. Request a public certificate
3. Enter domain name (e.g., `collegeathletebase-dev.com` and `*.collegeathletebase-dev.com`)
4. Choose DNS validation
5. Add the CNAME records to your Route53 hosted zone
6. Wait for validation to complete
7. Copy the certificate ARN to your `.env` file

### Option 2: Request Certificates via AWS CLI

```bash
# Development certificate
aws acm request-certificate \
  --domain-name collegeathletebase-dev.com \
  --subject-alternative-names *.collegeathletebase-dev.com \
  --validation-method DNS \
  --region us-east-1

# Production certificate
aws acm request-certificate \
  --domain-name collegeathletebase.com \
  --subject-alternative-names *.collegeathletebase.com \
  --validation-method DNS \
  --region us-east-1
```

## Route53 DNS Setup

### Create Hosted Zones

If you don't have hosted zones yet:

```bash
# Development
aws route53 create-hosted-zone \
  --name collegeathletebase-dev.com \
  --caller-reference $(date +%s)

# Production
aws route53 create-hosted-zone \
  --name collegeathletebase.com \
  --caller-reference $(date +%s)
```

Update your domain registrar's nameservers to point to the Route53 nameservers provided in the hosted zone.

## Deployment

### Development Environment

```bash
# Preview changes
npm run diff:dev

# Deploy
npm run deploy:dev
```

### Production Environment

```bash
# Preview changes
npm run diff:prod

# Deploy (requires manual approval)
npm run deploy:prod
```

## Stack Outputs

After deployment, the stack will output:

- **LoadBalancerDNS**: DNS name of the Application Load Balancer
- **ServiceURL**: Full URL to access the application
- **DatabaseEndpoint**: PostgreSQL database endpoint
- **RedisEndpoint**: Redis cache endpoint
- **DatabaseSecretArn**: ARN of the secret containing database credentials

## Environment Configuration

### Development Environment

- **Domain**: collegeathletebase-dev.com
- **Database**: db.t4g.micro (1 vCPU, 1 GB RAM)
- **Cache**: cache.t4g.micro
- **ECS Task**: 512 CPU, 1024 MB memory
- **Min/Max Capacity**: 1-2 tasks
- **NAT Gateways**: 1
- **Multi-AZ**: No
- **Backup Retention**: 1 day

### Production Environment

- **Domain**: collegeathletebase.com
- **Database**: db.t4g.small (2 vCPU, 2 GB RAM)
- **Cache**: cache.t4g.small
- **ECS Task**: 1024 CPU, 2048 MB memory
- **Min/Max Capacity**: 2-10 tasks
- **NAT Gateways**: 2 (high availability)
- **Multi-AZ**: Yes
- **Backup Retention**: 7 days
- **Deletion Protection**: Enabled

## Connecting to Resources

### Database Connection

The database credentials are stored in AWS Secrets Manager. To retrieve them:

```bash
# Development
aws secretsmanager get-secret-value \
  --secret-id development/college-athlete-base/db-credentials \
  --query SecretString \
  --output text | jq -r

# Production
aws secretsmanager get-secret-value \
  --secret-id production/college-athlete-base/db-credentials \
  --query SecretString \
  --output text | jq -r
```

### Redis Connection

Redis endpoints are available in the stack outputs. The application automatically connects using the `REDIS_URL` environment variable.

## Auto-Scaling

The application automatically scales based on:

- **CPU Utilization**: Target 70%
- **Memory Utilization**: Target 80%
- **Cooldown Period**: 60 seconds

## Monitoring and Logging

### CloudWatch Logs

Application logs are available in CloudWatch Logs:
- Log Group: `/ecs/{environment}-college-athlete-base`
- Retention: 30 days

### Database Logs

PostgreSQL logs are exported to CloudWatch:
- Log Group: `/aws/rds/instance/{instance-id}/postgresql`

### Metrics

Key metrics to monitor:
- ECS Service CPU and Memory utilization
- ALB request count and latency
- Database connections and performance
- Cache hit/miss ratio

## Cost Optimization

### Development Environment

Estimated monthly cost: $50-100
- RDS: ~$15 (db.t4g.micro)
- ElastiCache: ~$12 (cache.t4g.micro)
- ECS Fargate: ~$15-30 (1-2 tasks)
- NAT Gateway: ~$32
- ALB: ~$16

### Production Environment

Estimated monthly cost: $200-400
- RDS: ~$60 (db.t4g.small, Multi-AZ)
- ElastiCache: ~$24 (cache.t4g.small)
- ECS Fargate: ~$60-180 (2-10 tasks)
- NAT Gateway: ~$64 (2 gateways)
- ALB: ~$16

## Disaster Recovery

### Database Backups

- **Development**: Daily automated backups, 1-day retention
- **Production**: Daily automated backups, 7-day retention, final snapshot on deletion

### Restore from Backup

```bash
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier restored-instance \
  --db-snapshot-identifier snapshot-id
```

## Security

### Network Security

- Application runs in private subnets
- Database and cache in isolated subnets
- Security groups restrict access between components
- ALB in public subnets with SSL/TLS termination

### Secrets Management

- Database credentials stored in AWS Secrets Manager
- Automatic rotation supported (configure separately)
- Secrets injected as environment variables in ECS tasks

### Encryption

- Database storage encrypted at rest
- SSL/TLS for data in transit
- Secrets Manager encryption with AWS KMS

## Troubleshooting

### Deployment Fails

1. Check AWS credentials: `aws sts get-caller-identity`
2. Verify CDK bootstrap: `cdk bootstrap --show-template`
3. Check CloudFormation events in AWS Console
4. Review CDK diff output: `npm run diff:dev` or `npm run diff:prod`

### Application Not Accessible

1. Check ECS service status in AWS Console
2. Verify target group health checks
3. Check security group rules
4. Verify DNS records in Route53
5. Check certificate validation status

### Database Connection Issues

1. Verify security group allows traffic from ECS tasks
2. Check database status in RDS console
3. Verify credentials in Secrets Manager
4. Check VPC and subnet configuration

## Cleanup

### Destroy Development Environment

```bash
npm run destroy:dev
```

### Destroy Production Environment

```bash
npm run destroy:prod
```

**Warning**: Production stack has deletion protection enabled. You must disable it in the AWS Console before destroying.

## CI/CD Integration

The infrastructure is designed to work with GitHub Actions workflows:

1. **deploy-dev.yml**: Automatically deploys to development on merge to main
2. **deploy-prod.yml**: Manually triggered production deployments

The workflows should:
1. Build Docker image
2. Push to ECR (Elastic Container Registry)
3. Update ECS task definition with new image
4. Deploy new task definition to ECS service

## Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [RDS Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)
- [ElastiCache Best Practices](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/BestPractices.html)
