# Infrastructure Architecture

## High-Level Architecture

```mermaid
graph TB
    subgraph "Internet"
        Users[Users]
        GitHub[GitHub Actions]
    end

    subgraph "AWS Cloud"
        subgraph "Route53"
            DNS[DNS Records]
        end

        subgraph "ACM"
            Cert[SSL Certificates]
        end

        subgraph "VPC"
            subgraph "Public Subnets"
                ALB[Application Load Balancer]
                NAT[NAT Gateway]
            end

            subgraph "Private Subnets"
                ECS[ECS Fargate Tasks]
            end

            subgraph "Isolated Subnets"
                RDS[(PostgreSQL Database)]
                Redis[(ElastiCache Redis)]
            end
        end

        subgraph "Supporting Services"
            ECR[Container Registry]
            Secrets[Secrets Manager]
            CW[CloudWatch Logs]
        end
    end

    Users -->|HTTPS| DNS
    DNS -->|Route| ALB
    ALB -->|Forward| ECS
    ECS -->|Query| RDS
    ECS -->|Cache| Redis
    ECS -->|Egress| NAT
    ECS -->|Logs| CW
    ECS -->|Secrets| Secrets
    GitHub -->|Deploy| ECR
    ECR -->|Pull Image| ECS
    Cert -->|Terminate SSL| ALB
```

## Network Architecture

```mermaid
graph LR
    subgraph "VPC - 10.0.0.0/16"
        subgraph "Availability Zone 1"
            PubSub1[Public Subnet<br/>10.0.0.0/24]
            PrivSub1[Private Subnet<br/>10.0.1.0/24]
            IsoSub1[Isolated Subnet<br/>10.0.2.0/28]
        end

        subgraph "Availability Zone 2"
            PubSub2[Public Subnet<br/>10.0.16.0/24]
            PrivSub2[Private Subnet<br/>10.0.17.0/24]
            IsoSub2[Isolated Subnet<br/>10.0.18.0/28]
        end

        IGW[Internet Gateway]
        NAT1[NAT Gateway 1]
        NAT2[NAT Gateway 2]
    end

    Internet -->|Inbound| IGW
    IGW --> PubSub1
    IGW --> PubSub2
    PubSub1 --> NAT1
    PubSub2 --> NAT2
    NAT1 --> PrivSub1
    NAT2 --> PrivSub2
    PrivSub1 -.->|No Internet| IsoSub1
    PrivSub2 -.->|No Internet| IsoSub2
```

## Security Groups

```mermaid
graph TD
    Internet[Internet] -->|HTTPS:443| ALB_SG[ALB Security Group]
    Internet -->|HTTP:80| ALB_SG
    ALB_SG -->|HTTP:3000| App_SG[App Security Group]
    App_SG -->|PostgreSQL:5432| DB_SG[Database Security Group]
    App_SG -->|Redis:6379| Cache_SG[Cache Security Group]
    App_SG -->|HTTPS:443| Internet
```

## Deployment Flow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant GHA as GitHub Actions
    participant ECR as ECR
    participant ECS as ECS
    participant ALB as Load Balancer
    participant RDS as Database

    Dev->>GH: Push to main
    GH->>GHA: Trigger workflow
    GHA->>GHA: Build Docker image
    GHA->>GHA: Run tests
    GHA->>ECR: Push image
    GHA->>ECS: Update task definition
    ECS->>ECR: Pull new image
    ECS->>ECS: Start new tasks
    ECS->>ALB: Register new tasks
    ALB->>ECS: Health check
    ECS->>RDS: Run migrations
    ECS-->>ALB: Healthy
    ALB->>ECS: Route traffic
    ECS->>ECS: Drain old tasks
```

## Auto-Scaling Architecture

```mermaid
graph TB
    CW[CloudWatch Metrics] -->|CPU > 70%| Scale_Out[Scale Out Policy]
    CW -->|Memory > 80%| Scale_Out
    CW -->|CPU < 50%| Scale_In[Scale In Policy]
    CW -->|Memory < 60%| Scale_In
    
    Scale_Out -->|Increase| ECS[ECS Service]
    Scale_In -->|Decrease| ECS
    
    ECS -->|Min: 1-2<br/>Max: 2-10| Tasks[Running Tasks]
```

## Data Flow

```mermaid
graph LR
    User[User Request] -->|HTTPS| ALB[Load Balancer]
    ALB -->|HTTP| App[Next.js App]
    
    App -->|Check Cache| Redis[(Redis)]
    Redis -->|Cache Hit| App
    Redis -->|Cache Miss| App
    
    App -->|Query| DB[(PostgreSQL)]
    DB -->|Data| App
    
    App -->|Update Cache| Redis
    App -->|Response| ALB
    ALB -->|HTTPS| User
```

## Monitoring and Logging

```mermaid
graph TB
    subgraph "Application Layer"
        App[Next.js Application]
    end

    subgraph "Infrastructure Layer"
        ECS[ECS Service]
        RDS[RDS Database]
        Redis[ElastiCache]
        ALB[Load Balancer]
    end

    subgraph "Monitoring"
        CW[CloudWatch Metrics]
        Logs[CloudWatch Logs]
        Alarms[CloudWatch Alarms]
    end

    App -->|Application Logs| Logs
    ECS -->|Container Metrics| CW
    RDS -->|Database Metrics| CW
    RDS -->|Query Logs| Logs
    Redis -->|Cache Metrics| CW
    ALB -->|Access Logs| Logs
    ALB -->|Request Metrics| CW
    
    CW -->|Threshold Breach| Alarms
    Alarms -->|Notification| SNS[SNS Topic]
```

## Disaster Recovery

```mermaid
graph TB
    subgraph "Primary Region"
        App1[Application]
        DB1[(Primary Database)]
        Redis1[(Primary Cache)]
    end

    subgraph "Backup Strategy"
        Snap[Automated Snapshots]
        Manual[Manual Snapshots]
        PITR[Point-in-Time Recovery]
    end

    subgraph "Recovery"
        Restore[Restore Process]
        NewDB[(Restored Database)]
    end

    DB1 -->|Daily| Snap
    DB1 -->|On-Demand| Manual
    DB1 -->|Continuous| PITR
    
    Snap -->|Restore| Restore
    Manual -->|Restore| Restore
    PITR -->|Restore| Restore
    
    Restore --> NewDB
    NewDB --> App1
```

## Cost Breakdown

### Development Environment (~$50-100/month)

| Service | Instance Type | Monthly Cost |
|---------|--------------|--------------|
| RDS PostgreSQL | db.t4g.micro | ~$15 |
| ElastiCache Redis | cache.t4g.micro | ~$12 |
| ECS Fargate | 0.5 vCPU, 1GB | ~$15-30 |
| NAT Gateway | 1 gateway | ~$32 |
| Application Load Balancer | - | ~$16 |
| Data Transfer | Minimal | ~$5 |

### Production Environment (~$200-400/month)

| Service | Instance Type | Monthly Cost |
|---------|--------------|--------------|
| RDS PostgreSQL | db.t4g.small (Multi-AZ) | ~$60 |
| ElastiCache Redis | cache.t4g.small | ~$24 |
| ECS Fargate | 1 vCPU, 2GB (2-10 tasks) | ~$60-180 |
| NAT Gateway | 2 gateways | ~$64 |
| Application Load Balancer | - | ~$16 |
| Data Transfer | Moderate | ~$20 |

## Scalability Limits

### Current Configuration

| Resource | Development | Production |
|----------|-------------|------------|
| ECS Tasks | 1-2 | 2-10 |
| Database | Single-AZ | Multi-AZ |
| Database Storage | 20-100 GB | 100-500 GB |
| Cache Nodes | 1 | 1 |
| NAT Gateways | 1 | 2 |

### Scaling Considerations

1. **Horizontal Scaling**: ECS tasks can scale from 2 to 10 (production)
2. **Vertical Scaling**: Database and cache can be upgraded to larger instance types
3. **Database Scaling**: Can migrate to Aurora for better scalability
4. **Cache Scaling**: Can add read replicas or use Redis Cluster mode
5. **Multi-Region**: Can deploy to multiple regions for global distribution

## Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        WAF[WAF - Optional]
        ALB[Load Balancer + SSL]
        SG[Security Groups]
        NACL[Network ACLs]
        IAM[IAM Roles]
        Secrets[Secrets Manager]
        Encrypt[Encryption at Rest]
    end

    Internet -->|Filter| WAF
    WAF -->|HTTPS Only| ALB
    ALB -->|Restricted Ports| SG
    SG -->|Network Rules| NACL
    
    ECS[ECS Tasks] -->|Assume| IAM
    ECS -->|Retrieve| Secrets
    
    RDS[(Database)] -->|KMS| Encrypt
    Redis[(Cache)] -->|KMS| Encrypt
```

## High Availability

### Development
- Single AZ deployment
- Single NAT Gateway
- Automated backups (1 day retention)
- Manual failover required

### Production
- Multi-AZ deployment
- Dual NAT Gateways
- Automated backups (7 day retention)
- Automatic failover for database
- Multiple ECS tasks across AZs
- Load balancer health checks

## Performance Optimization

1. **Caching Strategy**
   - Redis for session storage
   - Redis for frequently accessed data
   - CloudFront CDN (optional, not included)

2. **Database Optimization**
   - Connection pooling in application
   - Read replicas (can be added)
   - Query optimization and indexing

3. **Application Optimization**
   - Next.js static generation
   - Image optimization
   - Code splitting and lazy loading

4. **Network Optimization**
   - Keep-alive connections
   - HTTP/2 support via ALB
   - Compression enabled
