# Monitoring and Logging Guide

This guide covers the monitoring, logging, and notification systems implemented for the College Athlete Base platform.

## Table of Contents

- [Overview](#overview)
- [Health Checks](#health-checks)
- [Logging System](#logging-system)
- [Error Tracking](#error-tracking)
- [Notifications](#notifications)
- [Status Badges](#status-badges)
- [Alerting](#alerting)

## Overview

The platform includes comprehensive monitoring and logging capabilities to ensure system health, track errors, and provide visibility into application performance.

### Key Features

- **Health Check API**: Endpoint for deployment verification and monitoring
- **Centralized Logging**: Structured logging for server and client-side events
- **Error Boundaries**: Graceful error handling for React components
- **Deployment Notifications**: Automated notifications for deployment events
- **Status Badges**: Real-time pipeline status visibility
- **Automated Alerting**: Notifications for pipeline failures and application issues

## Health Checks

### Health Check Endpoint

The application provides a comprehensive health check endpoint at `/api/health`.

**Endpoint**: `GET /api/health`

**Response Format**:
```json
{
  "status": "ok",
  "timestamp": "2026-01-04T12:00:00.000Z",
  "uptime": 3600,
  "version": "0.1.0",
  "environment": "production",
  "checks": {
    "server": {
      "status": "ok",
      "message": "Server is running"
    },
    "memory": {
      "status": "ok",
      "usage": 256,
      "limit": 512,
      "percentage": 50
    }
  }
}
```

**Status Codes**:
- `200`: System is healthy
- `503`: System is degraded or experiencing errors

**Health Status Levels**:
- `ok`: All systems operational
- `degraded`: System operational but with warnings (e.g., high memory usage)
- `error`: System experiencing critical issues

### Using Health Checks

**In Deployment Workflows**:
```bash
# Check application health
curl -f https://collegeathletebase.com/api/health

# With retry logic
for i in {1..10}; do
  if curl -f https://collegeathletebase.com/api/health; then
    echo "Health check passed"
    exit 0
  fi
  sleep 10
done
```

**In Monitoring Systems**:
- Configure uptime monitoring (e.g., UptimeRobot, Pingdom)
- Set up CloudWatch alarms based on health check responses
- Integrate with load balancer health checks

## Logging System

### Server-Side Logging

The application uses a centralized logging utility (`src/lib/logger.ts`) for structured logging.

**Usage**:
```typescript
import { logger } from '@/lib/logger';

// Info logging
logger.info('User logged in', { userId: '123', email: 'user@example.com' });

// Error logging
try {
  // Some operation
} catch (error) {
  logger.error('Operation failed', error, { operation: 'userUpdate' });
}

// API error logging
logger.apiError('/api/users', error, 500, { userId: '123' });

// Deployment event logging
logger.deployment('Application started', { version: '1.0.0' });
```

**Log Levels**:
- `debug`: Detailed debugging information
- `info`: General informational messages
- `warn`: Warning messages for potentially harmful situations
- `error`: Error messages for serious problems

**Log Format**:
```json
{
  "level": "error",
  "message": "API Error: /api/users",
  "timestamp": "2026-01-04T12:00:00.000Z",
  "environment": "production",
  "source": "server",
  "context": {
    "endpoint": "/api/users",
    "statusCode": 500,
    "userId": "123"
  },
  "error": {
    "name": "DatabaseError",
    "message": "Connection timeout",
    "stack": "..."
  }
}
```

### Client-Side Logging

Client-side errors can be logged using the `useClientLogger` hook.

**Usage**:
```typescript
'use client';

import { useClientLogger } from '@/hooks/useClientLogger';

export function MyComponent() {
  const logger = useClientLogger();

  const handleAction = async () => {
    try {
      // Some operation
      logger.info('Action completed', { action: 'buttonClick' });
    } catch (error) {
      logger.error('Action failed', error, { action: 'buttonClick' });
    }
  };

  return <button onClick={handleAction}>Click Me</button>;
}
```

**Client Log API**:

Client logs are sent to the server via `/api/log` endpoint for centralized logging.

```typescript
// Automatic via useClientLogger hook
const logger = useClientLogger();
logger.error('Something went wrong', error);

// Manual API call
await fetch('/api/log', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    level: 'error',
    message: 'Something went wrong',
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    context: { page: '/dashboard' }
  })
});
```

## Error Tracking

### Error Boundary

The application includes an Error Boundary component for graceful error handling in React.

**Usage**:
```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Layout({ children }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
```

**Features**:
- Catches React component errors
- Logs errors to centralized logging system
- Displays user-friendly error message
- Shows detailed error info in development mode
- Provides "Refresh Page" option for users

**Custom Fallback UI**:
```typescript
<ErrorBoundary fallback={<CustomErrorPage />}>
  <YourComponent />
</ErrorBoundary>
```

### Integration with Error Tracking Services

To integrate with services like Sentry, Datadog, or New Relic:

1. **Update Logger** (`src/lib/logger.ts`):
```typescript
private sendToLoggingService(logEntry: LogEntry): void {
  if (this.environment === 'production') {
    // Sentry example
    if (logEntry.level === 'error' && logEntry.error) {
      Sentry.captureException(new Error(logEntry.error.message), {
        contexts: {
          custom: logEntry.context
        }
      });
    }
  }
}
```

2. **Update Error Boundary**:
```typescript
componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
  // Send to Sentry
  Sentry.captureException(error, {
    contexts: {
      react: {
        componentStack: errorInfo.componentStack
      }
    }
  });
  
  // Also log to our system
  logger.error('React Error Boundary caught an error', error, {
    componentStack: errorInfo.componentStack
  });
}
```

## Notifications

### Deployment Notifications

Deployment workflows include notification steps for both successful and failed deployments.

**Slack Integration** (example):

1. Create a Slack webhook URL
2. Add to GitHub Secrets as `SLACK_WEBHOOK_URL`
3. Uncomment notification code in workflows:

```yaml
- name: Notify deployment status
  run: |
    curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
      -H 'Content-Type: application/json' \
      -d '{
        "text": "✅ Production Deployment Successful",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Production Deployment*\n\nStatus: Success\nEnvironment: Production\nURL: https://collegeathletebase.com"
            }
          }
        ]
      }'
```

**Email Notifications**:

Configure GitHub Actions to send email notifications:

1. Use a service like SendGrid, AWS SES, or Mailgun
2. Add API credentials to GitHub Secrets
3. Add notification step to workflows

**Microsoft Teams Integration**:

Similar to Slack, create an incoming webhook and use it in workflows.

### PR Check Notifications

The PR check workflow includes a notification job that reports the status of all checks.

**Features**:
- Summary of all check results
- Links to failed checks
- Author and PR information
- Can be configured for Slack, Teams, or email

## Status Badges

### Available Badges

The README includes status badges for:

1. **CI/CD Pipeline**: Shows PR check status
2. **Development Deployment**: Shows dev deployment status
3. **Production Deployment**: Shows prod deployment status
4. **Quality Gate**: Shows SonarCloud quality gate status
5. **Coverage**: Shows code coverage percentage

### Updating Badge URLs

Replace placeholders in `README.md`:

```markdown
[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/pr-check.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/pr-check.yml)
```

Replace:
- `YOUR_USERNAME` with your GitHub username or organization
- `YOUR_REPO` with your repository name
- `YOUR_PROJECT_KEY` with your SonarCloud project key

### Custom Badges

Add custom badges using [shields.io](https://shields.io/):

```markdown
![Uptime](https://img.shields.io/uptimerobot/ratio/m123456789-abcdef1234567890)
![Response Time](https://img.shields.io/uptimerobot/response/m123456789-abcdef1234567890)
```

## Alerting

### Pipeline Failure Alerts

Configure alerts for pipeline failures:

1. **GitHub Notifications**:
   - Go to repository Settings → Notifications
   - Enable notifications for workflow failures

2. **Slack Alerts**:
   - Use GitHub Slack app
   - Subscribe to repository: `/github subscribe owner/repo workflows:{event:"pull_request","push"}`

3. **Email Alerts**:
   - Configure in GitHub notification settings
   - Set up workflow-specific notifications

### Application Alerts

Set up alerts for application issues:

1. **Health Check Monitoring**:
   ```bash
   # Example with UptimeRobot
   # Monitor: https://collegeathletebase.com/api/health
   # Alert when: Status code != 200
   # Notification: Email, Slack, SMS
   ```

2. **Error Rate Monitoring**:
   - Monitor error logs in CloudWatch
   - Set up alarms for error rate thresholds
   - Configure SNS topics for notifications

3. **Performance Monitoring**:
   - Monitor response times
   - Set up alerts for slow responses
   - Track memory and CPU usage

### CloudWatch Alarms (AWS)

Example CloudWatch alarm configuration:

```typescript
// In infrastructure/lib/college-athlete-base-stack.ts
const errorAlarm = new cloudwatch.Alarm(this, 'ErrorAlarm', {
  metric: logGroup.metricFilterPattern('ERROR', {
    statistic: 'Sum',
  }),
  threshold: 10,
  evaluationPeriods: 1,
  alarmDescription: 'Alert when error count exceeds threshold',
});

// Send to SNS topic
errorAlarm.addAlarmAction(new cloudwatchActions.SnsAction(snsTopic));
```

## Best Practices

### Logging Best Practices

1. **Use Structured Logging**: Always use the logger utility with context
2. **Include Relevant Context**: Add user IDs, request IDs, etc.
3. **Don't Log Sensitive Data**: Never log passwords, tokens, or PII
4. **Use Appropriate Log Levels**: Reserve error for actual errors
5. **Log Actionable Information**: Include enough detail to debug issues

### Monitoring Best Practices

1. **Monitor Key Metrics**: Response time, error rate, uptime
2. **Set Realistic Thresholds**: Avoid alert fatigue
3. **Test Alerts**: Verify notifications are working
4. **Document Runbooks**: Create procedures for common alerts
5. **Review Regularly**: Adjust thresholds and alerts as needed

### Notification Best Practices

1. **Prioritize Notifications**: Critical vs informational
2. **Include Context**: Provide enough info to take action
3. **Link to Resources**: Include links to logs, dashboards
4. **Avoid Spam**: Don't notify for every minor event
5. **Test Notification Channels**: Ensure they're working

## Troubleshooting

### Logs Not Appearing

1. Check logger is imported correctly
2. Verify log level is appropriate
3. Check CloudWatch log group exists
4. Verify IAM permissions for logging

### Health Checks Failing

1. Check application is running
2. Verify health endpoint is accessible
3. Check memory/resource usage
4. Review application logs for errors

### Notifications Not Sending

1. Verify webhook URLs are correct
2. Check GitHub Secrets are set
3. Test webhook manually with curl
4. Review workflow logs for errors

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- [SonarCloud Documentation](https://docs.sonarcloud.io/)
