# Quick Start Guide

Get up and running with College Athlete Base in 5 minutes.

## For New Developers

### 1. Prerequisites Check

Ensure you have these installed:

```bash
# Check Node.js (need 18+)
node --version

# Check npm
npm --version

# Check AWS CLI
aws --version

# Check Git
git --version
```

If anything is missing:
- **Node.js**: Download from [nodejs.org](https://nodejs.org/)
- **AWS CLI**: Follow [AWS CLI installation guide](https://aws.amazon.com/cli/)
- **Git**: Download from [git-scm.com](https://git-scm.com/)

### 2. Get AWS Access

Contact your team lead to:
- Get AWS credentials
- Get added to the development environment security groups
- Get VPN access (if applicable)

Configure AWS CLI:
```bash
aws configure
```

### 3. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd college-athlete-base

# Install dependencies
npm install

# Get development credentials (this will create .env.local for you)
npm run dev:setup
```

When prompted, type `y` to automatically create your `.env.local` file.

### 4. Connect to Network

Choose one option:

**Option A: VPN (Recommended)**
- Connect to your team's VPN
- The script will verify connectivity

**Option B: SSH Tunnel**
- Ask your team lead for bastion host details
- See [Local Development Setup](./LOCAL_DEVELOPMENT_SETUP.md#option-b-ssh-tunnel-via-bastion-host)

**Option C: Temporary IP Whitelist**
- Only for quick testing
- See [Local Development Setup](./LOCAL_DEVELOPMENT_SETUP.md#option-c-temporary-security-group-rule-development-only)

### 5. Start Developing

```bash
# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 6. Verify Everything Works

```bash
# Check health endpoint
curl http://localhost:3000/api/health
```

You should see:
```json
{
  "status": "ok",
  "environment": "development",
  "database": "connected",
  "cache": "connected"
}
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run dev:setup        # Get AWS credentials

# Code Quality
npm run lint             # Run linter
npm run type-check       # Check TypeScript types
npm test                 # Run tests

# Database (when configured)
npm run db:migrate       # Run migrations

# Docker (alternative local setup)
npm run docker:up        # Start local services
npm run docker:down      # Stop local services
```

## Your First Change

1. **Create a branch**:
   ```bash
   git checkout -b feature/my-first-change
   ```

2. **Make a small change** (e.g., edit `src/app/page.tsx`)

3. **Test locally**:
   ```bash
   npm run dev
   # Visit http://localhost:3000
   ```

4. **Run checks**:
   ```bash
   npm run lint
   npm run type-check
   npm test
   ```

5. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat: my first change"
   git push origin feature/my-first-change
   ```

6. **Create a Pull Request** on GitHub

## Troubleshooting

### "Cannot connect to database"

1. Check VPN is connected
2. Verify AWS credentials: `aws sts get-caller-identity`
3. Re-run setup: `npm run dev:setup`
4. See [Local Development Setup](./LOCAL_DEVELOPMENT_SETUP.md#troubleshooting)

### "Port 3000 already in use"

```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### "Module not found"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Environment variables not loading

1. Ensure file is named `.env.local` (not `.env`)
2. Restart dev server
3. Check for typos in variable names

## Project Structure

```
college-athlete-base/
├── src/
│   ├── app/              # Next.js pages and API routes
│   │   ├── api/          # API endpoints
│   │   ├── page.tsx      # Home page
│   │   └── layout.tsx    # Root layout
│   └── ...
├── docs/                 # Documentation
├── infrastructure/       # AWS CDK infrastructure code
├── scripts/              # Utility scripts
├── .env.local           # Your local environment variables (not in Git)
├── .env.example         # Template for environment variables
└── package.json         # Dependencies and scripts
```

## Key Files

- **`.env.local`**: Your local environment configuration (never commit!)
- **`src/app/api/`**: Backend API endpoints
- **`src/app/page.tsx`**: Frontend pages
- **`package.json`**: Project dependencies and scripts

## Development Workflow

```
1. Pull latest main
   ↓
2. Create feature branch
   ↓
3. Make changes
   ↓
4. Test locally (connects to dev DB)
   ↓
5. Run lint/type-check/tests
   ↓
6. Commit and push
   ↓
7. Create Pull Request
   ↓
8. Code review
   ↓
9. Merge to main
   ↓
10. Auto-deploy to dev environment
```

## Important Notes

### Shared Development Database

- All developers share the same dev database
- Your local changes affect the shared database
- Coordinate with team on schema changes
- Use migrations for database changes

### Security

- ✅ Never commit `.env.local`
- ✅ Never commit AWS credentials
- ✅ Never commit secrets or passwords
- ✅ Use VPN when available
- ✅ Remove temporary security group rules

### Best Practices

- ✅ Pull latest main before creating branches
- ✅ Keep branches small and focused
- ✅ Write descriptive commit messages
- ✅ Test thoroughly before pushing
- ✅ Respond to PR feedback promptly

## Getting Help

1. **Check documentation**:
   - [Local Development Setup](./LOCAL_DEVELOPMENT_SETUP.md)
   - [Infrastructure Setup](./INFRASTRUCTURE_SETUP.md)
   - [Deployment Guide](./PRODUCTION_DEPLOYMENT.md)

2. **Search existing issues** on GitHub

3. **Ask in team chat**

4. **Create a GitHub issue** with:
   - What you're trying to do
   - What happened
   - Error messages
   - Steps to reproduce

## Next Steps

Now that you're set up:

1. ✅ Read the [Contributing Guidelines](../CONTRIBUTING.md) (if available)
2. ✅ Review the [Architecture Documentation](../infrastructure/ARCHITECTURE.md)
3. ✅ Check out open issues on GitHub
4. ✅ Join the team chat
5. ✅ Attend the next team standup

## Useful Links

- **Repository**: <repository-url>
- **Dev Environment**: https://collegeathletebase-dev.com
- **Prod Environment**: https://collegeathletebase.com
- **AWS Console**: https://console.aws.amazon.com
- **GitHub Actions**: <repository-url>/actions

---

**Welcome to the team! 🎉**

If you have any questions, don't hesitate to ask. We're here to help!
