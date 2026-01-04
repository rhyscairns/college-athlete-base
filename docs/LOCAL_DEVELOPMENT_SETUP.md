# Local Development Setup

This guide explains how to set up your local development environment to work with the College Athlete Base platform. Your local Next.js application will connect to the shared development environment (AWS) for database and cache services.

## Architecture Overview

```
┌─────────────────────────┐
│   Your Local Machine    │
│                         │
│  ┌──────────────────┐  │
│  │   Next.js App    │  │
│  │  localhost:3000  │  │
│  └────────┬─────────┘  │
└───────────┼─────────────┘
            │
            │ HTTPS/TCP
            │
┌───────────▼─────────────┐
│   AWS Development Env   │
│                         │
│  ┌──────────────────┐  │
│  │  RDS PostgreSQL  │  │
│  └──────────────────┘  │
│                         │
│  ┌──────────────────┐  │
│  │ ElastiCache Redis│  │
│  └──────────────────┘  │
└─────────────────────────┘
```

## Prerequisites

Before you begin, ensure you have:

1. **Node.js 18+** installed
   ```bash
   node --version
   ```

2. **Git** configured
   ```bash
   git --version
   ```

3. **AWS CLI** installed and configured (for retrieving credentials)
   ```bash
   aws --version
   aws configure
   ```

4. **Access to the development environment** (AWS credentials with appropriate permissions)

5. **VPN or IP Whitelisting** (if required by your team's security policies)

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd college-athlete-base
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Get Development Environment Credentials

You need to retrieve the database and Redis connection details from AWS.

### Option 1: Using AWS CLI (Recommended)

Run this script to automatically retrieve and display the connection details:

```bash
./scripts/get-dev-credentials.sh
```

### Option 2: Manual Retrieval

#### Get Database Credentials

```bash
# Get the database password from Secrets Manager
aws secretsmanager get-secret-value \
  --secret-id development/college-athlete-base/db-credentials \
  --query SecretString \
  --output text | jq -r '.password'

# Get the database endpoint
aws cloudformation describe-stacks \
  --stack-name DevStack \
  --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' \
  --output text
```

#### Get Redis Endpoint

```bash
aws cloudformation describe-stacks \
  --stack-name DevStack \
  --query 'Stacks[0].Outputs[?OutputKey==`RedisEndpoint`].OutputValue' \
  --output text
```

## Step 4: Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` with the actual values from Step 3:

```bash
# Environment
NODE_ENV=development
ENVIRONMENT=development

# Database (from AWS RDS - development environment)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@dev-db-endpoint.us-east-1.rds.amazonaws.com:5432/college_athlete_base

# Redis (from AWS ElastiCache - development environment)
REDIS_URL=redis://dev-cache-endpoint.us-east-1.cache.amazonaws.com:6379

# Application Settings
LOG_LEVEL=debug
PORT=3000

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Important**: Never commit `.env.local` to Git. It's already in `.gitignore`.

## Step 5: Configure Network Access

The AWS development environment's database and Redis are in private subnets. You need network access to connect.

### Option A: VPN Connection (Recommended for Teams)

If your team has a VPN to the AWS VPC:

1. Connect to the VPN
2. Verify connectivity:
   ```bash
   # Test database connection
   nc -zv <database-endpoint> 5432
   
   # Test Redis connection
   nc -zv <redis-endpoint> 6379
   ```

### Option B: SSH Tunnel via Bastion Host

If you have a bastion host in the public subnet:

```bash
# Database tunnel
ssh -i ~/.ssh/your-key.pem -L 5432:<db-endpoint>:5432 ec2-user@<bastion-ip> -N &

# Redis tunnel
ssh -i ~/.ssh/your-key.pem -L 6379:<redis-endpoint>:6379 ec2-user@<bastion-ip> -N &
```

Then update your `.env.local` to use localhost:
```bash
DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/college_athlete_base
REDIS_URL=redis://localhost:6379
```

### Option C: Temporary Security Group Rule (Development Only)

**Warning**: Only use this for temporary development. Remove the rule when done.

```bash
# Get your public IP
MY_IP=$(curl -s https://checkip.amazonaws.com)

# Add your IP to the database security group
aws ec2 authorize-security-group-ingress \
  --group-id <db-security-group-id> \
  --protocol tcp \
  --port 5432 \
  --cidr $MY_IP/32

# Add your IP to the cache security group
aws ec2 authorize-security-group-ingress \
  --group-id <cache-security-group-id> \
  --protocol tcp \
  --port 6379 \
  --cidr $MY_IP/32
```

## Step 6: Run Database Migrations

Before starting the app, ensure the database schema is up to date:

```bash
npm run db:migrate
```

## Step 7: Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Step 8: Verify the Setup

### Check Application Health

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "environment": "development",
  "database": "connected",
  "cache": "connected"
}
```

### Check Database Connection

```bash
# Using psql
psql "$DATABASE_URL" -c "SELECT version();"
```

### Check Redis Connection

```bash
# Using redis-cli
redis-cli -u "$REDIS_URL" ping
```

## Development Workflow

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** to the code

3. **Test locally** - your changes will interact with the dev database

4. **Run tests**:
   ```bash
   npm test
   ```

5. **Commit and push**:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

### Database Changes

When working with database changes:

1. **Create a migration**:
   ```bash
   npm run db:migration:create -- --name your_migration_name
   ```

2. **Edit the migration file** in `migrations/`

3. **Run the migration locally**:
   ```bash
   npm run db:migrate
   ```

4. **Test your changes** thoroughly

5. **Commit the migration file** with your code changes

**Note**: Migrations will automatically run in the dev environment when your PR is merged.

### Shared Development Database

Since all developers share the same development database:

- **Coordinate with your team** when making schema changes
- **Use migrations** for all database changes (never manual SQL)
- **Test thoroughly** before merging to avoid breaking others
- **Communicate** in your team chat when deploying breaking changes

## Troubleshooting

### Cannot Connect to Database

**Error**: `ECONNREFUSED` or `timeout`

**Solutions**:
1. Verify VPN connection is active
2. Check security group rules allow your IP
3. Verify database endpoint is correct
4. Check if database is running in AWS Console

### Cannot Connect to Redis

**Error**: `ECONNREFUSED` or `timeout`

**Solutions**:
1. Verify VPN connection is active
2. Check security group rules allow your IP
3. Verify Redis endpoint is correct
4. Check if Redis cluster is running in AWS Console

### Database Password Incorrect

**Error**: `password authentication failed`

**Solutions**:
1. Retrieve the latest password from Secrets Manager
2. Ensure no extra spaces in `.env.local`
3. Check if password was recently rotated

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solutions**:
```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Environment Variables Not Loading

**Solutions**:
1. Ensure file is named `.env.local` (not `.env`)
2. Restart the development server
3. Check for syntax errors in `.env.local`
4. Verify no quotes around values (unless needed)

### Slow Database Queries

**Solutions**:
1. Check your internet connection
2. Consider using a VPN with better routing
3. Add database indexes if queries are complex
4. Use Redis caching for frequently accessed data

## Best Practices

### Security

- ✅ **Never commit** `.env.local` or any file with credentials
- ✅ **Rotate credentials** if accidentally exposed
- ✅ **Use VPN** when available instead of IP whitelisting
- ✅ **Remove temporary security group rules** when done
- ✅ **Use read-only credentials** if you don't need write access

### Performance

- ✅ **Use Redis caching** to reduce database queries
- ✅ **Limit data fetching** during development
- ✅ **Use database connection pooling** (configured by default)
- ✅ **Close connections** properly in your code

### Collaboration

- ✅ **Communicate** before making schema changes
- ✅ **Use migrations** for all database changes
- ✅ **Test thoroughly** before pushing
- ✅ **Document** any special setup requirements
- ✅ **Keep dependencies updated** regularly

## Alternative: Local Database (Optional)

If you prefer to use a local database for development:

1. **Start local services**:
   ```bash
   npm run docker:up
   ```

2. **Update `.env.local`** to use local services:
   ```bash
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/college_athlete_base
   REDIS_URL=redis://localhost:6379
   ```

3. **Run migrations**:
   ```bash
   npm run db:migrate
   ```

**Note**: With local database, you won't see data from other developers or the dev environment.

## Getting Help

If you encounter issues:

1. Check this documentation first
2. Search existing GitHub issues
3. Ask in the team chat
4. Create a new GitHub issue with:
   - Error message
   - Steps to reproduce
   - Your environment (OS, Node version, etc.)

## Quick Reference

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Type check
npm run type-check

# Database migrations
npm run db:migrate

# Get dev credentials
./scripts/get-dev-credentials.sh

# Check health
curl http://localhost:3000/api/health
```

## Next Steps

- Review the [Contributing Guidelines](../CONTRIBUTING.md)
- Read the [Architecture Documentation](../infrastructure/ARCHITECTURE.md)
- Check out the [API Documentation](./API.md)
- Join the team chat for questions
