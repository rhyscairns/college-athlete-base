# College Athlete Base

[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/pr-check.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/pr-check.yml)
[![Deploy to Development](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/deploy-dev.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/deploy-dev.yml)
[![Deploy to Production](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/deploy-prod.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/deploy-prod.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=YOUR_PROJECT_KEY&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=YOUR_PROJECT_KEY)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=YOUR_PROJECT_KEY&metric=coverage)](https://sonarcloud.io/summary/new_code?id=YOUR_PROJECT_KEY)

A comprehensive platform for college athletes built with Next.js, TypeScript, and Docker.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **Cache**: Redis
- **Containerization**: Docker & Docker Compose

## Getting Started

**New to the project? Start here:** [Quick Start Guide](docs/QUICK_START.md)

**Complete overview:** [Setup Summary](docs/SETUP_SUMMARY.md)

### Prerequisites

- Node.js 20 or higher
- AWS CLI configured (for connecting to dev environment)
- Access to the development AWS environment

### Local Development (Recommended)

Run the Next.js application locally while connecting to the shared development environment (AWS) for database and Redis.

**Quick Setup:**

1. Install dependencies:
```bash
npm install
```

2. Get development environment credentials:
```bash
npm run dev:setup
# or: ./scripts/get-dev-credentials.sh
```

This script will:
- Retrieve database and Redis connection details from AWS
- Optionally create your `.env.local` file automatically
- Test network connectivity

3. Ensure network access (choose one):
   - Connect to team VPN, or
   - Use SSH tunnel via bastion host, or
   - Temporarily add your IP to security groups

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

**Your local app will connect to the shared dev database and Redis on AWS.**

For detailed setup instructions, troubleshooting, and network configuration options, see:
- [AWS Dev Environment Access Guide](docs/AWS_DEV_ENVIRONMENT_ACCESS.md) - **NEW!** Complete AWS connection guide
- [Local Development Setup Guide](docs/LOCAL_DEVELOPMENT_SETUP.md)

### Alternative: Fully Local Development with Docker

If you prefer to run everything locally (isolated from the dev environment):

1. Start all services (app, database, redis):
```bash
npm run docker:up
```

2. View logs:
```bash
npm run docker:logs
```

3. Stop all services:
```bash
npm run docker:down
```

The application will be available at [http://localhost:3000](http://localhost:3000).

**Note**: With Docker, you'll have a local database that won't sync with other developers or the dev environment.

### Local Database Setup (For API Development)

If you're working on backend features (like the player registration API), you'll need a local PostgreSQL database.

**Quick Setup:**

1. **Start local PostgreSQL database:**
```bash
npm run db:local:start
```

2. **Create `.env.local` file:**
```bash
cp .env.local.example .env.local
```

3. **Run migrations:**
```bash
npm run db:migrate:local
```

4. **Seed test data:**
```bash
npm run db:seed:local
```

5. **Start development:**
```bash
npm run dev
```

**For complete workflow documentation, see:** [Local Database Workflow Guide](docs/LOCAL_DATABASE_WORKFLOW.md)

This comprehensive guide covers:
- Step-by-step setup instructions
- Running migrations and seeding data
- Switching between local and AWS dev databases
- Database management commands
- Troubleshooting common issues
- Complete workflow examples

**Test Your Setup:**
```bash
npm run db:test
```

This will verify that all database commands work correctly.

**Quick Reference - Database Commands:**
- `npm run db:local:start` - Start PostgreSQL container
- `npm run db:local:stop` - Stop PostgreSQL container
- `npm run db:local:reset` - Reset database (deletes all data)
- `npm run db:local:logs` - View database logs
- `npm run db:local:psql` - Connect to database with psql client
- `npm run db:migrate:local` - Run database migrations
- `npm run db:seed:local` - Seed test data
- `npm run db:reset:local` - Complete reset and prepare

**See also:** [Database Quick Reference Card](docs/DATABASE_QUICK_REFERENCE.md) - Printable cheat sheet

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run unit and integration tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:all` - Run all tests (unit + E2E)

#### AWS Development Environment
- `npm run dev:setup` - Get AWS dev credentials and create .env.local
- `npm run dev:test-aws` - Test AWS connectivity (database & Redis)
- `npm run db:switch:local` - Switch to local Docker database
- `npm run db:switch:aws` - Switch to AWS dev database

#### Logging and Monitoring
- `npm run logs` - View application logs
- `npm run logs:follow` - Follow logs in real-time
- `npm run logs:error` - View error logs only
- `npm run logs:docker` - View Docker container logs

#### Docker & Local Database
- `npm run docker:build` - Build Docker image
- `npm run docker:up` - Start Docker Compose services
- `npm run docker:down` - Stop Docker Compose services
- `npm run docker:logs` - View Docker Compose logs
- `npm run db:local:start` - Start local PostgreSQL database
- `npm run db:local:stop` - Stop local PostgreSQL database
- `npm run db:local:reset` - Reset local database (deletes all data)
- `npm run db:local:logs` - View database logs
- `npm run db:local:psql` - Connect to database with psql
- `npm run db:migrate:local` - Run database migrations locally
- `npm run db:seed:local` - Seed local database with test data
- `npm run db:reset:local` - Reset and prepare local database
- `npm run db:test` - Test local database workflow

### Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to enforce code quality:

- **Pre-Push Hook**: Automatically runs all tests before pushing to any branch
  - If tests fail, the push is blocked
  - Prevents broken code from reaching remote repository
  - Can be bypassed with `git push --no-verify` (use with caution)

See [Git Hooks Documentation](docs/GIT_HOOKS.md) for more details.

## Project Structure

```
.
├── src/
│   ├── app/              # Next.js App Router pages and layouts
│   │   ├── api/          # API routes
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
├── public/               # Static assets
├── Dockerfile            # Multi-stage Docker build
├── docker-compose.yml    # Local development services
└── next.config.ts        # Next.js configuration
```

## Docker Configuration

The project uses a multi-stage Docker build optimized for Next.js:

- **Stage 1 (deps)**: Install dependencies
- **Stage 2 (builder)**: Build the application
- **Stage 3 (runner)**: Minimal production runtime

The Docker Compose setup includes:
- Next.js application (port 3000)
- PostgreSQL database (port 5432)
- Redis cache (port 6379)

## Health Check

The application includes a health check endpoint at `/api/health` that returns the application status.

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment with comprehensive quality gates.

### Branch Protection

The `main` branch is protected with the following rules:
- Pull request reviews required before merging
- All status checks must pass (build, test, lint, code-quality)
- Conversations must be resolved
- Direct pushes blocked

#### Configure Branch Protection

**Option 1: Automated Script**
```bash
./scripts/configure-branch-protection.sh
```

**Option 2: Manual Configuration**
See detailed instructions in [docs/BRANCH_PROTECTION_SETUP.md](docs/BRANCH_PROTECTION_SETUP.md)

#### Verify Branch Protection

```bash
./scripts/verify-branch-protection.sh
```

### CI/CD Workflows

- **Pull Request Checks** (`.github/workflows/pr-check.yml`): Runs on every PR
  - Build Docker image
  - Run tests with coverage
  - Lint and type checking
  - SonarCloud code quality analysis

- **Development Deployment** (`.github/workflows/deploy-dev.yml`): Automatic on merge to main
  - Deploys to collegeathletebase-dev.com

- **Production Deployment** (`.github/workflows/deploy-prod.yml`): Manual trigger
  - Deploys to collegeathletebase.com
  - Includes health checks and rollback

For more details, see:
- [Production Deployment Guide](docs/PRODUCTION_DEPLOYMENT.md)
- [Deployment Quick Reference](docs/DEPLOYMENT_QUICK_REFERENCE.md)
- [Quality Gates](docs/QUALITY_GATES.md)

## Infrastructure

The platform infrastructure is managed using AWS CDK (Infrastructure as Code) with separate environments for development and production.

### Environments

- **Development**: collegeathletebase-dev.com
  - Auto-deploys on merge to main
  - Smaller instance sizes for cost optimization
  - 1-day backup retention

- **Production**: collegeathletebase.com
  - Manual deployment with approval
  - Multi-AZ for high availability
  - 7-day backup retention
  - Deletion protection enabled

### Infrastructure Components

Each environment includes:
- VPC with public, private, and isolated subnets
- ECS Fargate cluster for containerized application
- Application Load Balancer with SSL/TLS
- RDS PostgreSQL database with automated backups
- ElastiCache Redis for caching
- Auto-scaling based on CPU and memory
- CloudWatch logging and monitoring

### Setup and Deployment

For detailed infrastructure setup instructions, see:
- [Infrastructure Setup Guide](docs/INFRASTRUCTURE_SETUP.md) - Complete setup walkthrough
- [Infrastructure Quick Reference](docs/INFRASTRUCTURE_QUICK_REFERENCE.md) - Common commands and troubleshooting

Quick start:
```bash
cd infrastructure
npm install
npm run deploy:dev    # Deploy development
npm run deploy:prod   # Deploy production
```

## Development

### Testing

The project includes a comprehensive testing framework with unit, integration, and end-to-end tests.

**Quick Start:**
```bash
npm run test              # Run unit tests
npm run test:coverage     # Run with coverage report
npm run test:e2e          # Run E2E tests
```

**Documentation:**
- **[Testing Guide](docs/TESTING_GUIDE.md)** - Complete testing documentation
- **[Testing Quick Reference](docs/TESTING_QUICK_REFERENCE.md)** - Common commands and tips

**Coverage Requirements:**
- Minimum 80% coverage for branches, functions, lines, and statements
- Coverage reports integrated with SonarCloud
- Tests run automatically in CI pipeline

### Documentation

- **[Quick Start Guide](docs/QUICK_START.md)** - Get started in 5 minutes
- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)** - Complete development workflow
- **[Local Development Setup](docs/LOCAL_DEVELOPMENT_SETUP.md)** - Detailed setup instructions
- **[Local Dev Architecture](docs/LOCAL_DEV_ARCHITECTURE.md)** - How local dev connects to AWS

### Infrastructure & Deployment

- **[Infrastructure Setup](docs/INFRASTRUCTURE_SETUP.md)** - AWS infrastructure setup
- **[Infrastructure Quick Reference](docs/INFRASTRUCTURE_QUICK_REFERENCE.md)** - Common commands
- **[Production Deployment](docs/PRODUCTION_DEPLOYMENT.md)** - Deployment procedures
- **[Deployment Quick Reference](docs/DEPLOYMENT_QUICK_REFERENCE.md)** - Deployment commands
- **[Player Registration API Deployment](docs/PLAYER_REGISTRATION_DEPLOYMENT.md)** - Player registration feature deployment guide

### CI/CD & Quality

- **[Quality Gates](docs/QUALITY_GATES.md)** - Code quality requirements
- **[Branch Protection Setup](docs/BRANCH_PROTECTION_SETUP.md)** - Branch protection rules

## Contributing

We welcome contributions! Please follow these guidelines:

1. Read the [Development Guide](docs/DEVELOPMENT_GUIDE.md)
2. Create a feature branch from `main`
3. Make your changes and test thoroughly
4. Ensure all checks pass (lint, type-check, tests)
5. Submit a Pull Request with a clear description
6. Respond to code review feedback

## License

More details coming soon...