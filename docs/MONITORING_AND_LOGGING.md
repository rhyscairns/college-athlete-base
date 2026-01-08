# Monitoring and Logging Guide

This guide explains the monitoring and logging infrastructure for the College Athlete Base application.

## Overview

The application uses structured logging with different log levels and contexts to provide comprehensive observability. Logs are formatted differently for local development (human-readable) vs production (JSON for CloudWatch).

## Log Levels

### DEBUG
- **Purpose**: Detailed information for debugging
- **When to use**: Database queries, connection events, detailed flow tracking
- **Example**: `Database query executed in 15ms`
- **Enabled**: Only in development (LOG_LEVEL=debug)

### INFO
- **Purpose**: General informational messages
- **When to use**: Successful operations, key events, normal flow
- **Example**: `Player registered successfully`
- **Enabled**: Development and production

### WARN
- **Purpose**: Warning messages that don't prevent operation
- **When to use**: Validation failures, duplicate attempts, recoverable errors
- **Example**: `Duplicate email registration attempt`
- **Enabled**: Development and production

### ERROR
- **Purpose**: Error messages that prevent operation
- **When to use**: Database errors, unexpected failures, system errors
- **Example**: `Database connection failed`
- **Enabled**: Development and production

## Log Format

### Development (Local)
Human-readable format with colors:
```
[10:30:45] INFO: Player registered successfully { playerId: "123", email: "test@example.com", executionTime: "45ms" }
[10:30:46] ERROR: Database connection failed
  Error: Connection timeout
  at Database.connect (db.ts:45:10)
```

### Production (AWS)
Structured JSON format for CloudWatch:
```json
{
  "level": "info",
  "message": "Player registered successfully",
  "timestamp": "2026-01-08T17:30:45.123Z",
  "context": {
    "requestId": "abc-123",
    "playerId": "456",
    "email": "test@example.com",
    "executionTime": "45ms"
  }
}
```

## Using the Logger

### Import the Logger
```typescript
import { logger } from '@/lib/logger';
```

### Basic Logging
```typescript
// Debug - detailed information
logger.debug('Processing request', { userId: '123' });

// Info - general information
logger.info('User logged in', { userId: '123', method: 'email' });

// Warn - warnings
logger.warn('Rate limit approaching', { userId: '123', requests: 95 });

// Error - errors
logger.error('Failed to save data', { userId: '123' }, error);
```

### API Logging
```typescript
// Log incoming request
logger.apiRequest('POST', '/api/auth/register/player', { requestId });

// Log response
logger.apiResponse('POST', '/api/auth/register/player', 201, duration, { requestId });
```

### Database Logging
```typescript
// Log database operation
logger.dbOperation('createPlayer', { email: 'test@example.com' });

// Log database error
logger.dbError('createPlayer', error, { email: 'test@example.com' });
```

### Validation Logging
```typescript
// Log validation failure
logger.validationError('Registration validation failed', errors, { email: 'test@example.com' });
```

### Security Logging
```typescript
// Log security event
logger.securityEvent('Duplicate email attempt', { email: 'test@example.com' });
```

## What Gets Logged

### API Requests
- ✅ Request method and path
- ✅ Request ID (for tracing)
- ✅ Response status code
- ✅ Execution time
- ❌ Request body (may contain sensitive data)
- ❌ Passwords or tokens

### Database Operations
- ✅ Operation type (query, insert, update)
- ✅ Execution time
- ✅ Row count
- ✅ Error messages
- ❌ Sensitive data (passwords, tokens)
- ❌ Full query text (only first 100 chars in errors)

### Validation Errors
- ✅ Field names
- ✅ Error messages
- ✅ Email (for context)
- ❌ Password values
- ❌ Other sensitive fields

### Security Events
- ✅ Event type (duplicate email, failed login, etc.)
- ✅ Email or username
- ✅ Timestamp
- ❌ Passwords
- ❌ Session tokens

## Viewing Logs

### Local Development

**Option 1: Terminal Output**
```bash
# Logs appear in the terminal where you run:
npm run dev
```

**Option 2: View Logs Script**
```bash
# View all logs
./scripts/view-logs.sh

# Follow logs in real-time
./scripts/view-logs.sh --follow

# Filter by level
./scripts/view-logs.sh --level error

# Filter by pattern
./scripts/view-logs.sh --grep registration

# Combine filters
./scripts/view-logs.sh --follow --level warn
```

**Option 3: Docker Logs (if using local database)**
```bash
# View database logs
docker-compose logs postgres

# Follow database logs
docker-compose logs -f postgres

# View all service logs
docker-compose logs

# Follow all service logs
docker-compose logs -f
```

### AWS Development Environment

**Using AWS CLI:**
```bash
# Tail logs in real-time
aws logs tail /ecs/development-college-athlete-base --follow

# View logs from last hour
aws logs tail /ecs/development-college-athlete-base --since 1h

# Filter by pattern
aws logs tail /ecs/development-college-athlete-base --filter-pattern "ERROR"

# View specific time range
aws logs tail /ecs/development-college-athlete-base \
  --since "2026-01-08T10:00:00" \
  --until "2026-01-08T11:00:00"
```

**Using AWS Console:**
1. Go to CloudWatch → Log groups
2. Select `/ecs/development-college-athlete-base`
3. Click on a log stream
4. Use the filter box to search logs

### AWS Production Environment

**Using AWS CLI:**
```bash
# Tail production logs
aws logs tail /ecs/production-college-athlete-base --follow

# View errors only
aws logs tail /ecs/production-college-athlete-base \
  --filter-pattern '{ $.level = "error" }'

# View specific request
aws logs tail /ecs/production-college-athlete-base \
  --filter-pattern '{ $.context.requestId = "abc-123" }'
```

## Log Queries

### CloudWatch Insights Queries

**Find all errors in last hour:**
```
fields @timestamp, message, context.requestId, error.message
| filter level = "error"
| sort @timestamp desc
| limit 100
```

**Find slow API requests (>1000ms):**
```
fields @timestamp, message, context.executionTime, context.requestId
| filter message like /API Response/
| parse context.executionTime /(?<duration>\d+)ms/
| filter duration > 1000
| sort duration desc
```

**Count registrations by sport:**
```
fields context.sport
| filter message like /Player registered successfully/
| stats count() by context.sport
```

**Find validation errors:**
```
fields @timestamp, message, context.errors
| filter level = "warn" and message like /validation failed/
| sort @timestamp desc
```

**Track request by ID:**
```
fields @timestamp, level, message, context
| filter context.requestId = "abc-123"
| sort @timestamp asc
```

## Monitoring Metrics

### Key Metrics to Monitor

**API Performance:**
- Request count
- Response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Success rate

**Database:**
- Connection pool usage
- Query execution time
- Failed queries
- Connection errors

**Application:**
- Registration success rate
- Validation error rate
- Duplicate email attempts
- Memory usage
- CPU usage

### Setting Up CloudWatch Dashboards

**Create Dashboard:**
```bash
aws cloudwatch put-dashboard --dashboard-name PlayerRegistrationAPI \
  --dashboard-body file://cloudwatch-dashboard.json
```

**Example Dashboard Configuration:**
```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/ECS", "CPUUtilization", {"stat": "Average"}],
          [".", "MemoryUtilization", {"stat": "Average"}]
        ],
        "period": 300,
        "stat": "Average",
        "region": "us-east-1",
        "title": "ECS Resource Usage"
      }
    },
    {
      "type": "log",
      "properties": {
        "query": "fields @timestamp, message | filter level = 'error' | sort @timestamp desc | limit 20",
        "region": "us-east-1",
        "title": "Recent Errors"
      }
    }
  ]
}
```

### Setting Up Alarms

**High Error Rate Alarm:**
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name high-error-rate \
  --alarm-description "Alert when error rate exceeds 5%" \
  --metric-name ErrorRate \
  --namespace CollegeAthleteBase \
  --statistic Average \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

**Database Connection Failures:**
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name database-connection-failures \
  --alarm-description "Alert on database connection failures" \
  --metric-name DatabaseErrors \
  --namespace CollegeAthleteBase \
  --statistic Sum \
  --period 60 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1
```

## Log Retention

### Development
- **CloudWatch**: 7 days
- **Local Docker**: Until container is removed
- **Cost**: ~$0.50/GB ingested + $0.03/GB stored

### Production
- **CloudWatch**: 30 days
- **Archive to S3**: After 30 days (optional)
- **Cost**: ~$0.50/GB ingested + $0.03/GB stored

### Configure Retention:
```bash
aws logs put-retention-policy \
  --log-group-name /ecs/development-college-athlete-base \
  --retention-in-days 7
```

## Best Practices

### Do's ✅
- ✅ Use appropriate log levels
- ✅ Include context (requestId, userId, etc.)
- ✅ Log errors with stack traces
- ✅ Log execution times for performance tracking
- ✅ Use structured logging (JSON in production)
- ✅ Include timestamps
- ✅ Log security events
- ✅ Monitor error rates

### Don'ts ❌
- ❌ Log passwords or tokens
- ❌ Log full request bodies (may contain sensitive data)
- ❌ Log credit card numbers or PII
- ❌ Use console.log directly (use logger instead)
- ❌ Log in tight loops (causes performance issues)
- ❌ Include sensitive data in error messages
- ❌ Log at DEBUG level in production

## Troubleshooting

### No Logs Appearing

**Local Development:**
```bash
# Check if dev server is running
ps aux | grep "next dev"

# Check LOG_LEVEL environment variable
echo $LOG_LEVEL

# Restart dev server
npm run dev
```

**AWS:**
```bash
# Check if log group exists
aws logs describe-log-groups --log-group-name-prefix /ecs/

# Check if ECS task is running
aws ecs list-tasks --cluster development-college-athlete-base

# Check task logs
aws ecs describe-tasks --cluster development-college-athlete-base --tasks <task-id>
```

### Logs Too Verbose

**Reduce log level:**
```bash
# In .env.local
LOG_LEVEL=info  # or warn, or error
```

**Filter in CloudWatch:**
```bash
# Show only errors
aws logs tail /ecs/development-college-athlete-base \
  --filter-pattern '{ $.level = "error" }'
```

### Can't Find Specific Log

**Use request ID:**
```bash
# All logs for a specific request
aws logs tail /ecs/development-college-athlete-base \
  --filter-pattern '{ $.context.requestId = "abc-123" }'
```

**Use CloudWatch Insights:**
```
fields @timestamp, @message
| filter context.email = "test@example.com"
| sort @timestamp desc
```

## Cost Optimization

### Reduce Log Volume
1. Use appropriate log levels (avoid DEBUG in production)
2. Don't log in tight loops
3. Aggregate similar log messages
4. Use sampling for high-volume logs

### Reduce Storage Costs
1. Set appropriate retention periods
2. Archive old logs to S3
3. Delete unnecessary log groups
4. Use log filtering to reduce ingestion

### Example Cost Calculation
```
Assumptions:
- 1000 requests/day
- 5 log entries per request
- 500 bytes per log entry

Daily volume: 1000 * 5 * 500 bytes = 2.5 MB
Monthly volume: 2.5 MB * 30 = 75 MB

Cost:
- Ingestion: 0.075 GB * $0.50 = $0.04
- Storage: 0.075 GB * $0.03 = $0.002
- Total: ~$0.05/month
```

## Quick Reference

```bash
# Local development
npm run dev                          # View logs in terminal
./scripts/view-logs.sh              # View logs with script
docker-compose logs -f postgres     # View database logs

# AWS development
aws logs tail /ecs/development-college-athlete-base --follow
aws logs tail /ecs/development-college-athlete-base --filter-pattern "ERROR"

# AWS production
aws logs tail /ecs/production-college-athlete-base --follow
aws logs tail /ecs/production-college-athlete-base --since 1h

# CloudWatch Insights
# Go to CloudWatch → Insights → Select log group → Run query
```

## Additional Resources

- [AWS CloudWatch Logs Documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/)
- [CloudWatch Insights Query Syntax](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CWL_QuerySyntax.html)
- [ECS Logging Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/logging.html)

---

**Last Updated**: January 8, 2026
