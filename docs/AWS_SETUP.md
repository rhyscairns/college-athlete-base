# AWS Infrastructure Setup Guide

This guide walks through setting up the AWS infrastructure required for the College Athlete Base CI/CD pipeline.

## Architecture Overview

The application uses the following AWS services:

- **ECS (Elastic Container Service)** - Container orchestration
- **Fargate** - Serverless compute for containers
- **Application Load Balancer** - Traffic distribution and health checks
- **RDS (PostgreSQL)** - Relational database
- **ElastiCache (Redis)** - Caching layer
- **ECR or GHCR** - Container registry
- **CloudWatch** - Logging and monitoring
- **IAM** - Access control and permissions

## Prerequisites

- AWS CLI installed and configured
- AWS account with appropriate permissions
- GitHub repository with Actions enabled
- Docker images pushed to container registry

## Step 1: Create VPC and Networking

```bash
# Create VPC
aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=college-athlete-base-vpc}]'

# Create public subnets (for ALB)
aws ec2 create-subnet \
  --vpc-id <vpc-id> \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=public-subnet-1a}]'

aws ec2 create-subnet \
  --vpc-id <vpc-id> \
  --cidr-block 10.0.2.0/24 \
  --availability-zone us-east-1b \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=public-subnet-1b}]'

# Create private subnets (for ECS tasks)
aws ec2 create-subnet \
  --vpc-id <vpc-id> \
  --cidr-block 10.0.10.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=private-subnet-1a}]'

aws ec2 create-subnet \
  --vpc-id <vpc-id> \
  --cidr-block 10.0.11.0/24 \
  --availability-zone us-east-1b \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=private-subnet-1b}]'

# Create Internet Gateway
aws ec2 create-internet-gateway \
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=college-athlete-base-igw}]'

aws ec2 attach-internet-gateway \
  --vpc-id <vpc-id> \
  --internet-gateway-id <igw-id>

# Create NAT Gateway (for private subnets to access internet)
aws ec2 allocate-address --domain vpc

aws ec2 create-nat-gateway \
  --subnet-id <public-subnet-id> \
  --allocation-id <eip-allocation-id>
```

## Step 2: Create Security Groups

```bash
# ALB Security Group
aws ec2 create-security-group \
  --group-name alb-sg \
  --description "Security group for Application Load Balancer" \
  --vpc-id <vpc-id>

aws ec2 authorize-security-group-ingress \
  --group-id <alb-sg-id> \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id <alb-sg-id> \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# ECS Tasks Security Group
aws ec2 create-security-group \
  --group-name ecs-tasks-sg \
  --description "Security group for ECS tasks" \
  --vpc-id <vpc-id>

aws ec2 authorize-security-group-ingress \
  --group-id <ecs-tasks-sg-id> \
  --protocol tcp \
  --port 3000 \
  --source-group <alb-sg-id>

# RDS Security Group
aws ec2 create-security-group \
  --group-name rds-sg \
  --description "Security group for RDS database" \
  --vpc-id <vpc-id>

aws ec2 authorize-security-group-ingress \
  --group-id <rds-sg-id> \
  --protocol tcp \
  --port 5432 \
  --source-group <ecs-tasks-sg-id>

# Redis Security Group
aws ec2 create-security-group \
  --group-name redis-sg \
  --description "Security group for Redis" \
  --vpc-id <vpc-id>

aws ec2 authorize-security-group-ingress \
  --group-id <redis-sg-id> \
  --protocol tcp \
  --port 6379 \
  --source-group <ecs-tasks-sg-id>
```

## Step 3: Create RDS Database

```bash
# Create DB subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name college-athlete-base-db-subnet \
  --db-subnet-group-description "Subnet group for College Athlete Base database" \
  --subnet-ids <private-subnet-1-id> <private-subnet-2-id>

# Create RDS instance (Development)
aws rds create-db-instance \
  --db-instance-identifier dev-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username dbadmin \
  --master-user-password <secure-password> \
  --allocated-storage 20 \
  --db-subnet-group-name college-athlete-base-db-subnet \
  --vpc-security-group-ids <rds-sg-id> \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00" \
  --enable-cloudwatch-logs-exports '["postgresql"]' \
  --tags Key=Environment,Value=development

# Create RDS instance (Production)
aws rds create-db-instance \
  --db-instance-identifier prod-db \
  --db-instance-class db.t3.small \
  --engine postgres \
  --engine-version 15.4 \
  --master-username dbadmin \
  --master-user-password <secure-password> \
  --allocated-storage 100 \
  --db-subnet-group-name college-athlete-base-db-subnet \
  --vpc-security-group-ids <rds-sg-id> \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00" \
  --multi-az \
  --enable-cloudwatch-logs-exports '["postgresql"]' \
  --tags Key=Environment,Value=production
```

## Step 4: Create ElastiCache Redis

```bash
# Create cache subnet group
aws elasticache create-cache-subnet-group \
  --cache-subnet-group-name college-athlete-base-redis-subnet \
  --cache-subnet-group-description "Subnet group for Redis" \
  --subnet-ids <private-subnet-1-id> <private-subnet-2-id>

# Create Redis cluster (Development)
aws elasticache create-cache-cluster \
  --cache-cluster-id dev-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1 \
  --cache-subnet-group-name college-athlete-base-redis-subnet \
  --security-group-ids <redis-sg-id> \
  --tags Key=Environment,Value=development

# Create Redis cluster (Production)
aws elasticache create-replication-group \
  --replication-group-id prod-redis \
  --replication-group-description "Production Redis cluster" \
  --cache-node-type cache.t3.small \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-clusters 2 \
  --automatic-failover-enabled \
  --cache-subnet-group-name college-athlete-base-redis-subnet \
  --security-group-ids <redis-sg-id> \
  --tags Key=Environment,Value=production
```

## Step 5: Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name college-athlete-base-alb \
  --subnets <public-subnet-1-id> <public-subnet-2-id> \
  --security-groups <alb-sg-id> \
  --scheme internet-facing \
  --type application \
  --ip-address-type ipv4 \
  --tags Key=Environment,Value=production

# Create target groups
aws elbv2 create-target-group \
  --name dev-target-group \
  --protocol HTTP \
  --port 3000 \
  --vpc-id <vpc-id> \
  --target-type ip \
  --health-check-enabled \
  --health-check-protocol HTTP \
  --health-check-path /api/health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3

aws elbv2 create-target-group \
  --name prod-target-group \
  --protocol HTTP \
  --port 3000 \
  --vpc-id <vpc-id> \
  --target-type ip \
  --health-check-enabled \
  --health-check-protocol HTTP \
  --health-check-path /api/health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3

# Create listeners
aws elbv2 create-listener \
  --load-balancer-arn <alb-arn> \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=<prod-target-group-arn>
```

## Step 6: Create IAM Roles

```bash
# ECS Task Execution Role
cat > ecs-task-execution-role-trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document file://ecs-task-execution-role-trust-policy.json

aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# ECS Task Role (for application permissions)
cat > ecs-task-role-trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws iam create-role \
  --role-name collegeAthleteBaseTaskRole \
  --assume-role-policy-document file://ecs-task-role-trust-policy.json

# GitHub Actions Deployment Role
cat > github-actions-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "ecs:DescribeTasks",
        "ecs:ListTasks",
        "ecs:RegisterTaskDefinition",
        "ecs:UpdateService",
        "ecs:TagResource"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "rds:CreateDBSnapshot",
        "rds:DescribeDBSnapshots"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:PassRole"
      ],
      "Resource": "arn:aws:iam::*:role/ecsTaskExecutionRole"
    }
  ]
}
EOF

aws iam create-policy \
  --policy-name GitHubActionsDeploymentPolicy \
  --policy-document file://github-actions-policy.json
```

## Step 7: Create ECS Cluster

```bash
# Create ECS clusters
aws ecs create-cluster \
  --cluster-name dev-cluster \
  --capacity-providers FARGATE FARGATE_SPOT \
  --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1 \
  --tags key=Environment,value=development

aws ecs create-cluster \
  --cluster-name prod-cluster \
  --capacity-providers FARGATE \
  --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1 \
  --tags key=Environment,value=production
```

## Step 8: Create ECS Task Definitions

```bash
# Development task definition
cat > dev-task-definition.json << EOF
{
  "family": "college-athlete-base-dev",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::<account-id>:role/collegeAthleteBaseTaskRole",
  "containerDefinitions": [
    {
      "name": "app",
      "image": "ghcr.io/<org>/<repo>:dev-latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "development"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:dev/database-url"
        },
        {
          "name": "REDIS_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:dev/redis-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/college-athlete-base-dev",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
EOF

aws ecs register-task-definition --cli-input-json file://dev-task-definition.json

# Production task definition (similar structure with production values)
```

## Step 9: Create ECS Services

```bash
# Development service
aws ecs create-service \
  --cluster dev-cluster \
  --service-name college-athlete-base-dev \
  --task-definition college-athlete-base-dev:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[<private-subnet-1-id>,<private-subnet-2-id>],securityGroups=[<ecs-tasks-sg-id>],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=<dev-target-group-arn>,containerName=app,containerPort=3000" \
  --health-check-grace-period-seconds 60 \
  --enable-execute-command

# Production service
aws ecs create-service \
  --cluster prod-cluster \
  --service-name college-athlete-base-prod \
  --task-definition college-athlete-base-prod:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[<private-subnet-1-id>,<private-subnet-2-id>],securityGroups=[<ecs-tasks-sg-id>],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=<prod-target-group-arn>,containerName=app,containerPort=3000" \
  --health-check-grace-period-seconds 120 \
  --deployment-configuration "deploymentCircuitBreaker={enable=true,rollback=true},maximumPercent=200,minimumHealthyPercent=100" \
  --enable-execute-command
```

## Step 10: Configure GitHub Secrets

Add the following secrets to your GitHub repository:

### Development Environment
- `DEV_AWS_ACCESS_KEY_ID`
- `DEV_AWS_SECRET_ACCESS_KEY`
- `DEV_AWS_REGION` = `us-east-1`
- `DEV_ECS_CLUSTER` = `dev-cluster`
- `DEV_ECS_SERVICE` = `college-athlete-base-dev`
- `DEV_ECS_TASK_FAMILY` = `college-athlete-base-dev`
- `DEV_DATABASE_URL` = (from RDS endpoint)
- `DEV_REDIS_URL` = (from ElastiCache endpoint)

### Production Environment
- `PROD_AWS_ACCESS_KEY_ID`
- `PROD_AWS_SECRET_ACCESS_KEY`
- `PROD_AWS_REGION` = `us-east-1`
- `PROD_ECS_CLUSTER` = `prod-cluster`
- `PROD_ECS_SERVICE` = `college-athlete-base-prod`
- `PROD_ECS_TASK_FAMILY` = `college-athlete-base-prod`
- `PROD_DB_INSTANCE_ID` = `prod-db`
- `PROD_DATABASE_URL` = (from RDS endpoint)
- `PROD_REDIS_URL` = (from ElastiCache endpoint)

## Step 11: Configure CloudWatch Logs

```bash
# Create log groups
aws logs create-log-group --log-group-name /ecs/college-athlete-base-dev
aws logs create-log-group --log-group-name /ecs/college-athlete-base-prod

# Set retention policy
aws logs put-retention-policy \
  --log-group-name /ecs/college-athlete-base-dev \
  --retention-in-days 7

aws logs put-retention-policy \
  --log-group-name /ecs/college-athlete-base-prod \
  --retention-in-days 30
```

## Step 12: Configure Auto Scaling (Optional)

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/prod-cluster/college-athlete-base-prod \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/prod-cluster/college-athlete-base-prod \
  --policy-name cpu-scaling-policy \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

## Verification

After setup, verify everything is working:

```bash
# Check ECS service status
aws ecs describe-services \
  --cluster prod-cluster \
  --services college-athlete-base-prod

# Check task health
aws ecs list-tasks \
  --cluster prod-cluster \
  --service-name college-athlete-base-prod

# Check ALB target health
aws elbv2 describe-target-health \
  --target-group-arn <prod-target-group-arn>

# Test application endpoint
curl https://collegeathletebase.com/api/health
```

## Cost Optimization Tips

1. **Use Fargate Spot** for development environments
2. **Enable RDS automated backups** with appropriate retention
3. **Use CloudWatch Logs retention policies** to manage storage costs
4. **Configure auto-scaling** to scale down during low traffic
5. **Use NAT Gateway** only where necessary (consider VPC endpoints)
6. **Monitor costs** with AWS Cost Explorer and set up billing alerts

## Troubleshooting

### ECS Tasks Not Starting
- Check security group rules
- Verify IAM role permissions
- Check CloudWatch Logs for errors
- Verify task definition configuration

### Health Checks Failing
- Verify health check endpoint is accessible
- Check application logs
- Verify security group allows ALB to reach tasks
- Increase health check grace period if needed

### Database Connection Issues
- Verify security group allows ECS tasks to reach RDS
- Check database credentials in Secrets Manager
- Verify RDS instance is in available state
- Check VPC routing and subnet configuration
