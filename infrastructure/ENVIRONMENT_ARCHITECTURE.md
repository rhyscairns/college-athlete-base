# Environment Architecture

This document shows how the app runs across all three environments: local, dev, and production.

---

## Overview

```mermaid
graph TB
    subgraph LOCAL["🖥️  Local (localhost:3000)"]
        direction TB
        L_Next["Next.js Dev Server\nnpm run dev"]
        L_DB["PostgreSQL\nDocker · port 5432"]
        L_Redis["Redis\nDocker · port 6379"]
        L_Stripe["Stripe\n(simulated — no real calls)"]

        L_Next -->|"direct SQL"| L_DB
        L_Next -->|"session cache"| L_Redis
        L_Next -.->|"bypassed locally\nisCABMember set in DB"| L_Stripe
    end

    subgraph DEV["☁️  Dev (collegeathletebase-dev.com)"]
        direction TB
        D_GH["GitHub Actions\npush to main"]
        D_ECR["GHCR\nContainer Registry"]
        D_ALB["Application Load Balancer\nHTTPS · SSL termination"]
        D_ECS["ECS Fargate\nNext.js container\n0.5 vCPU · 1 GB"]
        D_Auth["Auth Lambda\nlogin / register"]
        D_Pay["Payment Lambda\nStripe webhook handler"]
        D_DB["RDS PostgreSQL\ndb.t4g.micro · Single-AZ"]
        D_Redis["ElastiCache Redis\ncache.t4g.micro"]
        D_Secrets["Secrets Manager\nDB · JWT · Stripe test keys"]
        D_Stripe["Stripe\nTest mode (pk_test_ / sk_test_)"]

        D_GH -->|"build & push image"| D_ECR
        D_GH -->|"update task definition"| D_ECS
        D_ECR -->|"pull image"| D_ECS
        D_ALB -->|"HTTP :3000"| D_ECS
        D_ECS -->|"proxy auth requests"| D_Auth
        D_ECS -->|"direct SQL"| D_DB
        D_ECS -->|"session cache"| D_Redis
        D_ECS -->|"read secrets at startup"| D_Secrets
        D_Auth -->|"SQL"| D_DB
        D_Auth -->|"read secrets"| D_Secrets
        D_Pay -->|"SQL"| D_DB
        D_Pay -->|"read secrets"| D_Secrets
        D_Stripe -->|"webhook events"| D_Pay
    end

    subgraph PROD["🚀  Production (collegeathletebase.com)"]
        direction TB
        P_GH["GitHub Actions\nmanual workflow_dispatch"]
        P_ECR["GHCR\nContainer Registry"]
        P_ALB["Application Load Balancer\nHTTPS · SSL termination\nMulti-AZ"]
        P_ECS["ECS Fargate\nNext.js container\n1 vCPU · 2 GB\n2–10 tasks · auto-scale"]
        P_Auth["Auth Lambda\nlogin / register"]
        P_Pay["Payment Lambda\nStripe webhook handler"]
        P_DB["RDS PostgreSQL\ndb.t4g.small · Multi-AZ\ndeletion protection on"]
        P_Redis["ElastiCache Redis\ncache.t4g.small"]
        P_Secrets["Secrets Manager\nDB · JWT · Stripe live keys"]
        P_Stripe["Stripe\nLive mode (pk_live_ / sk_live_)"]

        P_GH -->|"build & push image"| P_ECR
        P_GH -->|"update task definition\n+ DB snapshot first"| P_ECS
        P_ECR -->|"pull image"| P_ECS
        P_ALB -->|"HTTP :3000"| P_ECS
        P_ECS -->|"proxy auth requests"| P_Auth
        P_ECS -->|"direct SQL"| P_DB
        P_ECS -->|"session cache"| P_Redis
        P_ECS -->|"read secrets at startup"| P_Secrets
        P_Auth -->|"SQL"| P_DB
        P_Auth -->|"read secrets"| P_Secrets
        P_Pay -->|"SQL"| P_DB
        P_Pay -->|"read secrets"| P_Secrets
        P_Stripe -->|"webhook events"| P_Pay
    end
```

---

## Environment Comparison

| | Local | Dev | Production |
|---|---|---|---|
| URL | `localhost:3000` | `collegeathletebase-dev.com` | `collegeathletebase.com` |
| Next.js | `npm run dev` (hot reload) | ECS Fargate (0.5 vCPU / 1 GB) | ECS Fargate (1 vCPU / 2 GB, 2–10 tasks) |
| Database | Docker PostgreSQL | RDS `db.t4g.micro` Single-AZ | RDS `db.t4g.small` Multi-AZ |
| Redis | Docker Redis | ElastiCache `cache.t4g.micro` | ElastiCache `cache.t4g.small` |
| Auth | Direct DB (no Lambda) | Auth Lambda | Auth Lambda |
| Payments | Simulated (no Stripe) | Stripe test keys | Stripe live keys |
| Secrets | `.env.local` file | AWS Secrets Manager | AWS Secrets Manager |
| Deployments | Manual (`npm run dev`) | Auto on push to `main` | Manual `workflow_dispatch` |
| DB backups | None | 1-day retention | 7-day retention + pre-deploy snapshot |
| Rollback | N/A | Manual (previous task def) | Automatic (circuit breaker) |

---

## Request Flow

### Local

```mermaid
sequenceDiagram
    participant Browser
    participant Next as Next.js (localhost:3000)
    participant DB as PostgreSQL (Docker)
    participant Redis as Redis (Docker)

    Browser->>Next: HTTP request
    Next->>Redis: Check session cache
    Redis-->>Next: Cache hit/miss
    Next->>DB: SQL query (direct)
    DB-->>Next: Data
    Next-->>Browser: Response
```

### Dev & Production

```mermaid
sequenceDiagram
    participant Browser
    participant DNS as Route53 DNS
    participant ALB as Load Balancer
    participant Next as ECS / Next.js
    participant Lambda as Auth Lambda
    participant DB as RDS PostgreSQL
    participant Redis as ElastiCache
    participant Stripe as Stripe

    Browser->>DNS: collegeathletebase[-dev].com
    DNS-->>Browser: ALB IP
    Browser->>ALB: HTTPS request
    ALB->>Next: HTTP :3000
    Next->>Redis: Check session cache
    Redis-->>Next: Cache hit/miss

    alt Auth request (login/register)
        Next->>Lambda: Proxy to Auth Lambda
        Lambda->>DB: SQL query
        DB-->>Lambda: Data
        Lambda-->>Next: JWT token
    else Regular request
        Next->>DB: SQL query
        DB-->>Next: Data
    end

    Next-->>ALB: Response
    ALB-->>Browser: HTTPS response

    Note over Stripe,Lambda: Stripe sends webhook events<br/>directly to Payment Lambda URL
    Stripe->>Lambda: POST /webhook
    Lambda->>DB: Update subscription status
```

---

## CI/CD Flow

```mermaid
flowchart LR
    subgraph Dev Pipeline
        D1["Push to main"] --> D2["Build Docker image"]
        D2 --> D3["Push to GHCR"]
        D3 --> D4["Update ECS task def\n(inject secrets from\nSecrets Manager)"]
        D4 --> D5["Deploy ECS service"]
        D5 --> D6["Health check\n/api/health"]
        D6 -->|fail| D7["Rollback to\nprevious task def"]
        D6 -->|pass| D8["Deploy Lambdas\n(auth + payment)"]
    end

    subgraph Prod Pipeline
        P1["workflow_dispatch\n(manual trigger)"] --> P2["Snapshot RDS\n(pre-deploy backup)"]
        P2 --> P3["Update ECS task def\n(inject secrets from\nSecrets Manager)"]
        P3 --> P4["Deploy ECS service\n(circuit breaker on)"]
        P4 --> P5["Health checks\n× 15 attempts"]
        P5 -->|fail| P6["Auto rollback\n(circuit breaker)"]
        P5 -->|pass| P7["Deploy Lambdas\n(auth + payment)"]
        P7 --> P8["Smoke tests"]
    end
```

---

## Network Layout (Dev & Production)

```mermaid
graph TB
    Internet -->|HTTPS :443| ALB

    subgraph VPC["VPC  10.0.0.0/16"]
        subgraph Public["Public Subnets (2 AZs)"]
            ALB["Application\nLoad Balancer"]
            NAT["NAT Gateway\n(1 dev · 2 prod)"]
        end

        subgraph Private["Private Subnets (2 AZs)"]
            ECS["ECS Fargate Tasks\n(Next.js)"]
            Lambda["Lambda Functions\n(Auth · Payment)"]
        end

        subgraph Isolated["Isolated Subnets (2 AZs)"]
            RDS["RDS PostgreSQL"]
            Redis["ElastiCache Redis"]
        end
    end

    ALB -->|HTTP :3000| ECS
    ECS -->|egress via| NAT
    ECS --> RDS
    ECS --> Redis
    Lambda --> RDS
```

---

## Key Differences: Local vs Cloud

**What's bypassed locally:**
- No AWS — everything runs in Docker
- No Auth Lambda — Next.js talks to the DB directly for auth
- No Stripe — a simulation button sets `isCABMember=true` in the local DB
- No Secrets Manager — credentials come from `.env.local`
- `RUNTIME_ENV=local` is the flag the app checks to switch between these modes

**What changes between Dev and Prod:**
- Stripe switches from test keys (`pk_test_`) to live keys (`pk_live_`)
- RDS goes from Single-AZ to Multi-AZ with deletion protection
- ECS scales from 1 task to 2–10 tasks with auto-scaling
- Production deployments require a manual trigger and take a DB snapshot first
- Production has an automatic circuit-breaker rollback; dev does a manual rollback
