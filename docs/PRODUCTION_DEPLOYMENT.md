# Production Deployment Guide

This document describes the production deployment workflow and configuration requirements for the College Athlete Base platform.

## Overview

The production deployment workflow (`.github/workflows/deploy-prod.yml`) implements a safe, controlled deployment process with the following features:

- **Manual trigger with approval** - Deployments require explicit manual initiation
- **GitHub Environment protection** - Uses GitHub's environment protection rules for approval gates
- **Health checks** - Comprehensive health verification before considering deployment successful
- **Automatic rollback** - Rolls back to previous version if deployment fails
- **Canary deployment support** - Gradual traffic shifting for safer rollouts
- **Audit trail** - Complete deployment records and notifications

## Triggering a Production Deployment

### Via GitHub UI

1. Navigate to **Actions** tab in the repository
2. Select **Deploy to Production** workflow
3. Click **Run workflow**
4. Optionally specify:
   - **Image tag**: Specific Docker image to deploy (defaults to latest dev image)
   - **Skip health checks**: Only use in emergency situations (not recommended)
5. Click **Run workflow** button

### Via GitHub CLI

```bash
# Deploy latest dev image
gh workflow run deploy-prod.yml

# Deploy specific image tag
gh workflow run deploy-prod.yml -f image-tag=ghcr.io/org/repo:sha-abc123

# Skip health checks (emergency only)
gh workflow run deploy-prod.yml -f skip-health-checks=true
```

## Required Secrets and Variables

### GitHub Environment Configuration

The workflow uses a GitHub Environment named `production` which should be configured with:

1. **Protection rules**:
   - Required reviewers (at least 1-2 team members)
   - Wait timer (optional, e.g., 5 minutes)
   - Deployment branches (limit to main branch only)

2. **Environment secrets**:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `PROD_AWS_ACCESS_KEY_ID` | AWS access key for production deployments | `AKIA...` |
| `PROD_AWS_SECRET_ACCESS_KEY` | AWS secret key for production deployments | `...` |
| `PROD_AWS_REGION` | AWS region for production resources | `us-east-1` |
| `PROD_ECS_CLUSTER` | ECS cluster name for production | `prod-cluster` |
| `PROD_ECS_SERVICE` | ECS service name for production | `college-athlete-base-prod` |
| `PROD_ECS_TASK_FAMILY` | ECS task definition family name | `college-athlete-base-prod` |
| `PROD_DB_INSTANCE_ID` | RDS database instance identifier | `prod-db` |
| `PROD_DATABASE_URL` | Production database connection string | `postgresql://user:pass@host:5432/db` |
| `PROD_REDIS_URL` | Production Redis connection string | `redis://host:6379` |
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications | `https://hooks.slack.com/...` |

### Development Environment Secrets

For the development workflow, configure these secrets:

| Secret Name | Description |
|------------|-------------|
| `DEV_AWS_ACCESS_KEY_ID` | AWS access key for development deployments |
| `DEV_AWS_SECRET_ACCESS_KEY` | AWS secret key for development deployments |
| `DEV_AWS_REGION` | AWS region for development resources |
| `DEV_ECS_CLUSTER` | ECS cluster name for development |
| `DEV_ECS_SERVICE` | ECS service name for development |
| `DEV_ECS_TASK_FAMILY` | ECS task definition family name for development |
| `DEV_DATABASE_URL` | Development database connection string |
| `DEV_REDIS_URL` | Development Redis connection string |

### Repository Secrets

These secrets are available to all workflows:

| Secret Name | Description |
|------------|-------------|
| `GITHUB_TOKEN` | Automatically provided by GitHub Actions |

## Deployment Process

### 1. Preparation Phase

- Determines which Docker image to deploy
- Verifies the image exists in the registry
- Creates a unique deployment ID for tracking
- Records current production ECS task definition for potential rollback

### 2. Approval Gate

- Workflow pauses and waits for manual approval
- Configured reviewers receive notification
- Deployment proceeds only after approval

### 3. Deployment Phase

- Configures AWS credentials using GitHub Actions AWS integration
- Creates RDS database snapshot for backup
- Retrieves current ECS task definition
- Creates new task definition with updated Docker image
- Updates ECS service with new task definition
- Enables ECS circuit breaker for automatic rollback on failure
- Waits for ECS service to reach steady state

### 4. Health Check Phase

- Runs comprehensive health checks (15 attempts over 5 minutes)
- Verifies HTTP endpoints return 200 status
- Checks response times are acceptable (< 2 seconds)
- Requires 3 consecutive successful checks
- Verifies ECS deployment status (running count matches desired count)
- Checks production metrics and error rates

### 5. Verification Phase

- Verifies ECS deployment status
- Confirms all tasks are running successfully
- Tags ECS service with deployment metadata

### 6. Post-Deployment Verification

- Runs smoke tests on critical paths
- Verifies database migrations
- Monitors initial production traffic

### 7. Notification Phase

- Sends deployment status to team (Slack, email, etc.)
- Creates deployment record for audit trail
- Updates deployment tracking systems

## Automatic Rollback

The workflow automatically rolls back if:

- Health checks fail after deployment
- Response times exceed thresholds
- Error rates spike above acceptable levels
- Any deployment step fails
- ECS circuit breaker detects deployment failure

### Rollback Process

1. Detects deployment failure
2. Retrieves previous ECS task definition
3. Updates ECS service to use previous task definition
4. Waits for ECS service to reach steady state
5. Verifies application health after rollback
6. Sends high-priority failure notifications

### ECS Circuit Breaker

The deployment uses AWS ECS Circuit Breaker which provides:
- Automatic detection of deployment failures
- Automatic rollback to last stable task definition
- Configurable failure thresholds
- Integration with ECS deployment monitoring

## AWS Infrastructure Setup

### Prerequisites

Before using the deployment workflows, ensure you have:

1. **AWS ECS Cluster** - Created for both development and production
2. **ECS Services** - Configured with load balancers and auto-scaling
3. **ECS Task Definitions** - Initial task definitions with container configurations
4. **RDS Database** - PostgreSQL database instances for each environment
5. **ElastiCache Redis** - Redis clusters for caching
6. **Application Load Balancer** - For routing traffic to ECS tasks
7. **IAM Roles** - Proper permissions for ECS tasks and GitHub Actions
8. **ECR or GHCR** - Container registry for Docker images

### Required IAM Permissions

The AWS credentials used by GitHub Actions need the following permissions:

```json
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
```

### ECS Task Definition Structure

Your ECS task definition should include:

- Container definition with image placeholder
- Environment variables (DATABASE_URL, REDIS_URL, etc.)
- Health check configuration
- Resource limits (CPU, memory)
- Logging configuration (CloudWatch Logs)
- Task execution role and task role

### ECS Service Configuration

Configure your ECS service with:

- **Deployment Configuration**:
  - Maximum percent: 200 (allows rolling deployment)
  - Minimum healthy percent: 100 (ensures zero downtime)
  - Circuit breaker: Enabled with rollback
- **Load Balancer**: Application Load Balancer with target group
- **Auto Scaling**: Based on CPU/memory or custom metrics
- **Health Check Grace Period**: 60-120 seconds

## Infrastructure Requirements

The deployment workflow is configured for AWS ECS but can be adapted for other platforms if needed.

## Monitoring and Observability

### Key Metrics to Monitor

- **Response times** - Should remain under 2 seconds
- **Error rates** - Should stay below 1%
- **CPU/Memory usage** - Should not spike abnormally
- **Database connections** - Should remain stable
- **Request throughput** - Should match expected traffic

### Recommended Tools

- **Application Performance Monitoring**: New Relic, Datadog, Dynatrace
- **Log Aggregation**: CloudWatch Logs, Elasticsearch, Splunk
- **Uptime Monitoring**: Pingdom, UptimeRobot, StatusCake
- **Alerting**: PagerDuty, Opsgenie, VictorOps

## Troubleshooting

### Deployment Fails During Health Checks

1. Check application logs for errors
2. Verify database connectivity
3. Check for configuration issues
4. Review recent code changes
5. Verify infrastructure capacity

### Rollback Fails

1. Manually verify previous version is available
2. Check infrastructure status
3. Manually trigger rollback via cloud provider console
4. Contact on-call engineer if issues persist

### Approval Not Received

1. Check GitHub notifications
2. Verify reviewers are configured correctly
3. Contact team members directly
4. Use emergency override if critical (with justification)

## Best Practices

1. **Always deploy to development first** - Verify changes work in dev before production
2. **Deploy during low-traffic periods** - Minimize user impact
3. **Have team members available** - Ensure support during deployment
4. **Monitor closely after deployment** - Watch metrics for first 30 minutes
5. **Document changes** - Keep deployment notes and changelog updated
6. **Test rollback procedures** - Regularly verify rollback works
7. **Use specific image tags** - Avoid deploying "latest" tags
8. **Communicate with team** - Announce deployments in team channels

## Emergency Procedures

### Emergency Rollback

If you need to manually rollback outside the workflow:

```bash
# Get previous task definition
PREVIOUS_TASK_DEF=$(aws ecs describe-services \
  --cluster prod-cluster \
  --services college-athlete-base-prod \
  --query 'services[0].deployments[1].taskDefinition' \
  --output text)

# Rollback to previous task definition
aws ecs update-service \
  --cluster prod-cluster \
  --service college-athlete-base-prod \
  --task-definition "$PREVIOUS_TASK_DEF" \
  --force-new-deployment

# Wait for service to stabilize
aws ecs wait services-stable \
  --cluster prod-cluster \
  --services college-athlete-base-prod
```

### Skip Health Checks

Only use in emergency situations:

```bash
gh workflow run deploy-prod.yml -f skip-health-checks=true
```

**Warning**: Skipping health checks can result in deploying broken code to production.

## Audit and Compliance

All production deployments are tracked with:

- Deployment ID (unique identifier)
- Timestamp (UTC)
- Deployed by (GitHub username)
- Image tag (exact version deployed)
- Workflow run ID (link to GitHub Actions)
- Status (success/failure)

Deployment records are stored for audit purposes and compliance requirements.
