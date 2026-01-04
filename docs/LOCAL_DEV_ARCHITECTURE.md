# Local Development Architecture

This document explains how local development connects to the shared AWS development environment.

## Architecture Diagram

```mermaid
graph TB
    subgraph "Developer's Local Machine"
        Browser[Web Browser<br/>localhost:3000]
        NextJS[Next.js Dev Server<br/>Port 3000]
        EnvFile[.env.local<br/>Connection Strings]
    end

    subgraph "Network Layer"
        VPN[VPN Connection<br/>or<br/>SSH Tunnel<br/>or<br/>IP Whitelist]
    end

    subgraph "AWS Development Environment<br/>collegeathletebase-dev.com"
        subgraph "VPC"
            subgraph "Public Subnet"
                ALB[Application Load Balancer<br/>HTTPS]
                NAT[NAT Gateway]
            end
            
            subgraph "Private Subnet"
                ECS[ECS Fargate<br/>Deployed App]
            end
            
            subgraph "Isolated Subnet"
                RDS[(RDS PostgreSQL<br/>Development DB)]
                Redis[(ElastiCache Redis<br/>Development Cache)]
            end
        end
        
        Secrets[Secrets Manager<br/>DB Credentials]
    end

    Browser -->|HTTP| NextJS
    NextJS -->|Reads| EnvFile
    NextJS -->|TCP/IP| VPN
    
    VPN -->|Port 5432| RDS
    VPN -->|Port 6379| Redis
    
    ECS -->|Query| RDS
    ECS -->|Cache| Redis
    ECS -->|Get Credentials| Secrets
    
    ALB -->|Route Traffic| ECS

    style NextJS fill:#61dafb
    style RDS fill:#336791
    style Redis fill:#dc382d
    style VPN fill:#ff9900
```

## How It Works

### 1. Local Development Server

Your local machine runs the Next.js development server:
- Hot reload for instant feedback
- Full debugging capabilities
- Fast iteration cycle

### 2. Shared Development Database

All developers connect to the same AWS RDS PostgreSQL database:
- **Pros**: 
  - Shared data across team
  - Realistic data for testing
  - No need to maintain local DB
  - Consistent environment
- **Cons**: 
  - Requires network connectivity
  - Changes affect all developers
  - Need coordination for schema changes

### 3. Shared Development Cache

All developers connect to the same AWS ElastiCache Redis:
- Session storage
- Application caching
- Real-time features

### 4. Network Connectivity

Three options to connect to AWS resources:

#### Option A: VPN (Recommended)
```
Local Machine → VPN Client → AWS VPN → VPC → Database/Redis
```
- Most secure
- Always-on connection
- Best performance

#### Option B: SSH Tunnel
```
Local Machine → SSH → Bastion Host → VPC → Database/Redis
```
- Good for temporary access
- No VPN client needed
- Requires bastion host

#### Option C: IP Whitelist
```
Local Machine → Internet → Security Group (Your IP) → Database/Redis
```
- Quick setup
- Less secure
- IP changes require updates

## Data Flow

### Read Operation

```mermaid
sequenceDiagram
    participant Browser
    participant NextJS as Next.js (Local)
    participant Redis as Redis (AWS)
    participant RDS as PostgreSQL (AWS)

    Browser->>NextJS: GET /api/users
    NextJS->>Redis: Check cache
    alt Cache Hit
        Redis-->>NextJS: Return cached data
    else Cache Miss
        NextJS->>RDS: Query database
        RDS-->>NextJS: Return data
        NextJS->>Redis: Update cache
    end
    NextJS-->>Browser: Return response
```

### Write Operation

```mermaid
sequenceDiagram
    participant Browser
    participant NextJS as Next.js (Local)
    participant Redis as Redis (AWS)
    participant RDS as PostgreSQL (AWS)

    Browser->>NextJS: POST /api/users
    NextJS->>RDS: Insert data
    RDS-->>NextJS: Confirm insert
    NextJS->>Redis: Invalidate cache
    Redis-->>NextJS: Confirm
    NextJS-->>Browser: Return success
```

## Environment Comparison

| Aspect | Local Dev | Docker Local | AWS Dev | AWS Prod |
|--------|-----------|--------------|---------|----------|
| **Next.js** | Local | Container | ECS Fargate | ECS Fargate |
| **Database** | AWS RDS | Local Container | AWS RDS | AWS RDS (Multi-AZ) |
| **Redis** | AWS ElastiCache | Local Container | AWS ElastiCache | AWS ElastiCache |
| **Data Sharing** | ✅ Shared | ❌ Isolated | ✅ Shared | ✅ Production |
| **Network** | VPN/Tunnel | None | VPC | VPC |
| **Cost** | Free (uses dev) | Free | ~$50-100/mo | ~$200-400/mo |

## Security Considerations

### What's Secure

✅ Database credentials stored in AWS Secrets Manager
✅ Credentials retrieved via AWS CLI (IAM authentication)
✅ SSL/TLS for database connections
✅ VPC isolation for database and cache
✅ `.env.local` in `.gitignore` (never committed)

### What to Watch Out For

⚠️ VPN connection can drop (monitor connectivity)
⚠️ Shared database means shared data (coordinate changes)
⚠️ IP whitelist rules need maintenance
⚠️ Local `.env.local` contains sensitive data (protect your machine)

### Best Practices

1. **Use VPN** when available (most secure)
2. **Rotate credentials** if exposed
3. **Remove temporary security group rules** when done
4. **Never commit** `.env.local` or credentials
5. **Use read-only credentials** if you don't need write access
6. **Lock your computer** when away (credentials in memory)

## Performance Considerations

### Network Latency

Local development connecting to AWS will have some latency:
- **Database queries**: 20-100ms (vs <1ms local)
- **Redis operations**: 20-50ms (vs <1ms local)
- **Impact**: Noticeable but acceptable for development

### Optimization Tips

1. **Use Redis caching** aggressively
2. **Batch database queries** when possible
3. **Use connection pooling** (configured by default)
4. **Consider local Docker** for offline work
5. **Use VPN with good routing** for better latency

## Troubleshooting Network Issues

### Check Connectivity

```bash
# Test database connection
nc -zv <db-endpoint> 5432

# Test Redis connection
nc -zv <redis-endpoint> 6379

# Check VPN status
# (varies by VPN client)

# Verify AWS credentials
aws sts get-caller-identity
```

### Common Issues

| Issue | Symptom | Solution |
|-------|---------|----------|
| VPN Disconnected | Connection timeout | Reconnect VPN |
| Wrong Endpoint | Connection refused | Check `.env.local` |
| Security Group | Connection timeout | Add your IP |
| Credentials Expired | Auth failed | Run `aws configure` |
| Port Conflict | Address in use | Kill process on port |

## Switching Between Environments

### Use Local Docker

```bash
# Stop using AWS dev
# Update .env.local to use localhost

# Start local services
npm run docker:up

# Update .env.local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/college_athlete_base
REDIS_URL=redis://localhost:6379
```

### Use AWS Dev

```bash
# Stop local services
npm run docker:down

# Get AWS credentials
npm run dev:setup

# .env.local will be updated with AWS endpoints
```

## Collaboration Tips

### Coordinating Database Changes

1. **Announce schema changes** in team chat
2. **Use migrations** for all schema changes
3. **Test migrations** before merging
4. **Run migrations** during low-traffic times
5. **Have rollback plan** ready

### Avoiding Conflicts

1. **Use feature flags** for incomplete features
2. **Namespace test data** (e.g., `test_user_yourname`)
3. **Clean up test data** when done
4. **Communicate** before bulk operations
5. **Use transactions** for multi-step operations

## Monitoring Your Local Development

### Check Application Health

```bash
curl http://localhost:3000/api/health
```

### Monitor Database Connections

```bash
# Connect to database
psql "$DATABASE_URL"

# Check active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'college_athlete_base';
```

### Monitor Redis

```bash
# Connect to Redis
redis-cli -u "$REDIS_URL"

# Check info
INFO
```

## Cost Implications

### Local Development Cost

- **Your machine**: Free (electricity only)
- **AWS Dev Environment**: Shared cost (~$50-100/month for team)
- **Network**: VPN cost (if applicable)

### Cost Optimization

1. **Share dev environment** across team (already doing this)
2. **Use local Docker** when offline
3. **Stop dev environment** overnight (optional)
4. **Use smaller instances** for dev (already configured)

## Future Enhancements

Potential improvements to the local dev setup:

1. **Local cache layer** to reduce AWS calls
2. **Database read replicas** for better performance
3. **GraphQL subscriptions** for real-time updates
4. **Hot reload** for infrastructure changes
5. **Dev environment auto-sleep** to save costs

## Summary

**Local Development Setup:**
- ✅ Fast iteration with hot reload
- ✅ Full debugging capabilities
- ✅ Shared data with team
- ✅ Realistic environment
- ✅ No local infrastructure maintenance

**Trade-offs:**
- ⚠️ Requires network connectivity
- ⚠️ Some latency vs fully local
- ⚠️ Shared database requires coordination
- ⚠️ VPN/network setup required

This setup provides the best balance of development speed, team collaboration, and operational simplicity.
