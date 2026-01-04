# Development Guide

Complete guide for developing on the College Athlete Base platform.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Architecture](#architecture)
4. [Best Practices](#best-practices)
5. [Common Tasks](#common-tasks)
6. [Troubleshooting](#troubleshooting)

## Getting Started

### For New Developers

**Start here:** [Quick Start Guide](./QUICK_START.md)

The Quick Start will get you up and running in 5 minutes.

### Detailed Setup

For comprehensive setup instructions: [Local Development Setup](./LOCAL_DEVELOPMENT_SETUP.md)

### Architecture Overview

Understand how local development works: [Local Dev Architecture](./LOCAL_DEV_ARCHITECTURE.md)

## Development Workflow

### Daily Workflow

```bash
# 1. Start your day
git checkout main
git pull origin main

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Ensure you have latest credentials (if needed)
npm run dev:setup

# 4. Start development server
npm run dev

# 5. Make your changes
# Edit files in src/

# 6. Test your changes
npm run lint
npm run type-check
npm test

# 7. Commit and push
git add .
git commit -m "feat: description of changes"
git push origin feature/your-feature-name

# 8. Create Pull Request on GitHub
```

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes
- `chore/` - Maintenance tasks

Examples:
- `feature/user-authentication`
- `fix/login-validation`
- `docs/api-documentation`

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

Examples:
```bash
git commit -m "feat(auth): add user login endpoint"
git commit -m "fix(api): handle null user data"
git commit -m "docs: update setup instructions"
```

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Developer Machine                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Next.js Development Server                  │ │
│  │              (localhost:3000)                       │ │
│  └───────────────────┬────────────────────────────────┘ │
└────────────────────┼─────────────────────────────────────┘
                     │
                     │ VPN / SSH Tunnel
                     │
┌────────────────────▼─────────────────────────────────────┐
│              AWS Development Environment                 │
│  ┌──────────────────────────────────────────────────┐   │
│  │  RDS PostgreSQL (Shared Development Database)    │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  ElastiCache Redis (Shared Development Cache)    │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

### Project Structure

```
college-athlete-base/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   └── health/        # Health check endpoint
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components (future)
│   ├── lib/                   # Utility functions (future)
│   └── types/                 # TypeScript types (future)
├── public/                    # Static assets
├── docs/                      # Documentation
├── infrastructure/            # AWS CDK infrastructure
├── scripts/                   # Utility scripts
├── .github/workflows/         # CI/CD workflows
├── .env.local                # Local environment (not in Git)
├── .env.example              # Environment template
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── package.json              # Dependencies and scripts
```

## Best Practices

### Code Quality

1. **TypeScript**: Use strict typing
   ```typescript
   // Good
   interface User {
     id: string;
     name: string;
     email: string;
   }
   
   function getUser(id: string): Promise<User> {
     // ...
   }
   
   // Avoid
   function getUser(id: any): any {
     // ...
   }
   ```

2. **Linting**: Fix all lint errors before committing
   ```bash
   npm run lint
   ```

3. **Type Checking**: Ensure no TypeScript errors
   ```bash
   npm run type-check
   ```

4. **Testing**: Write tests for new features
   ```bash
   npm test
   ```

### Database Best Practices

1. **Use Migrations**: Never modify schema manually
   ```bash
   npm run db:migration:create -- --name add_user_table
   ```

2. **Use Transactions**: For multi-step operations
   ```typescript
   await db.transaction(async (trx) => {
     await trx('users').insert(user);
     await trx('profiles').insert(profile);
   });
   ```

3. **Index Properly**: Add indexes for frequently queried columns
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   ```

4. **Clean Up Test Data**: Remove test data when done
   ```typescript
   // Use namespaced test data
   const testUser = {
     email: 'test_yourname@example.com'
   };
   ```

### API Best Practices

1. **RESTful Routes**: Follow REST conventions
   ```
   GET    /api/users       # List users
   GET    /api/users/:id   # Get user
   POST   /api/users       # Create user
   PATCH  /api/users/:id   # Update user
   DELETE /api/users/:id   # Delete user
   ```

2. **Error Handling**: Return appropriate status codes
   ```typescript
   return NextResponse.json(
     { error: 'User not found' },
     { status: 404 }
   );
   ```

3. **Validation**: Validate input data
   ```typescript
   if (!email || !isValidEmail(email)) {
     return NextResponse.json(
       { error: 'Invalid email' },
       { status: 400 }
     );
   }
   ```

### Security Best Practices

1. **Never Commit Secrets**: Use environment variables
   ```typescript
   // Good
   const apiKey = process.env.API_KEY;
   
   // Never
   const apiKey = 'sk_live_abc123...';
   ```

2. **Sanitize Input**: Prevent SQL injection
   ```typescript
   // Good - using parameterized queries
   await db.query('SELECT * FROM users WHERE id = $1', [userId]);
   
   // Never - string concatenation
   await db.query(`SELECT * FROM users WHERE id = '${userId}'`);
   ```

3. **Validate Authorization**: Check user permissions
   ```typescript
   if (currentUser.id !== resourceOwnerId) {
     return NextResponse.json(
       { error: 'Unauthorized' },
       { status: 403 }
     );
   }
   ```

## Common Tasks

### Adding a New API Endpoint

1. Create the route file:
   ```bash
   # Create src/app/api/users/route.ts
   ```

2. Implement the handler:
   ```typescript
   import { NextResponse } from 'next/server';
   
   export async function GET() {
     // Your logic here
     return NextResponse.json({ users: [] });
   }
   ```

3. Test locally:
   ```bash
   curl http://localhost:3000/api/users
   ```

### Adding a New Page

1. Create the page file:
   ```bash
   # Create src/app/about/page.tsx
   ```

2. Implement the component:
   ```typescript
   export default function AboutPage() {
     return (
       <div>
         <h1>About</h1>
       </div>
     );
   }
   ```

3. Visit in browser:
   ```
   http://localhost:3000/about
   ```

### Working with Database

1. **Query data**:
   ```typescript
   const users = await db.select('*').from('users');
   ```

2. **Insert data**:
   ```typescript
   await db('users').insert({
     name: 'John Doe',
     email: 'john@example.com'
   });
   ```

3. **Update data**:
   ```typescript
   await db('users')
     .where({ id: userId })
     .update({ name: 'Jane Doe' });
   ```

4. **Delete data**:
   ```typescript
   await db('users').where({ id: userId }).delete();
   ```

### Working with Redis

1. **Set cache**:
   ```typescript
   await redis.set('user:123', JSON.stringify(user), 'EX', 3600);
   ```

2. **Get cache**:
   ```typescript
   const cached = await redis.get('user:123');
   const user = cached ? JSON.parse(cached) : null;
   ```

3. **Delete cache**:
   ```typescript
   await redis.del('user:123');
   ```

## Troubleshooting

### Common Issues

#### Cannot Connect to Database

**Symptoms**: Connection timeout, ECONNREFUSED

**Solutions**:
1. Check VPN connection
2. Verify `.env.local` has correct endpoint
3. Test connectivity: `nc -zv <db-endpoint> 5432`
4. Check security group rules

#### Port Already in Use

**Symptoms**: "Port 3000 is already in use"

**Solutions**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

#### Module Not Found

**Symptoms**: "Cannot find module 'xyz'"

**Solutions**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors

**Symptoms**: Type errors in IDE

**Solutions**:
1. Restart TypeScript server in IDE
2. Run `npm run type-check`
3. Check `tsconfig.json` is correct
4. Ensure all dependencies are installed

### Getting Help

1. **Check documentation** in `docs/` folder
2. **Search GitHub issues**
3. **Ask in team chat**
4. **Create GitHub issue** with details

## Additional Resources

### Documentation

- [Quick Start Guide](./QUICK_START.md) - Get started in 5 minutes
- [Local Development Setup](./LOCAL_DEVELOPMENT_SETUP.md) - Detailed setup
- [Local Dev Architecture](./LOCAL_DEV_ARCHITECTURE.md) - How it works
- [Infrastructure Setup](./INFRASTRUCTURE_SETUP.md) - AWS infrastructure
- [Production Deployment](./PRODUCTION_DEPLOYMENT.md) - Deployment guide

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Redis Documentation](https://redis.io/docs)

## Summary

**Key Points:**
- ✅ Run Next.js locally, connect to AWS dev environment
- ✅ Use feature branches for all changes
- ✅ Follow commit message conventions
- ✅ Test thoroughly before pushing
- ✅ Coordinate database changes with team
- ✅ Never commit secrets or credentials
- ✅ Ask for help when needed

**Happy coding! 🚀**
