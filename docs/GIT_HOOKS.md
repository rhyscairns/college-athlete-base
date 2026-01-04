# Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to manage Git hooks that enforce code quality before commits and pushes.

## Overview

Git hooks are scripts that run automatically at specific points in the Git workflow. They help maintain code quality by preventing commits or pushes that don't meet project standards.

## Installed Hooks

### Pre-Push Hook

**Location:** `.husky/pre-push`

**Purpose:** Runs all tests in `src/__tests__/` before allowing a push to any branch.

**What it does:**
1. Runs `npm test` with all tests in the project
2. If any test fails, the push is aborted
3. If all tests pass, the push proceeds

**Example output:**

```bash
$ git push origin feature-branch
🧪 Running tests before push...

PASS src/__tests__/app/layout.test.tsx
PASS src/__tests__/components/ErrorBoundary.test.tsx
PASS src/__tests__/hooks/useClientLogger.test.ts
PASS src/__tests__/app/page.test.tsx
PASS src/__tests__/app/api/health/route.test.ts
PASS src/__tests__/app/api/log/route.test.ts
PASS src/__tests__/lib/logger.test.ts

Test Suites: 7 passed, 7 total
Tests:       57 passed, 57 total

✅ All tests passed! Proceeding with push...
```

**If tests fail:**

```bash
$ git push origin feature-branch
🧪 Running tests before push...

FAIL src/__tests__/app/page.test.tsx
  ● Home page › renders correctly

    expect(received).toBeInTheDocument()

❌ Tests failed! Push aborted.
Fix the failing tests before pushing.
error: failed to push some refs to 'origin'
```

## Why Use Pre-Push Hooks?

1. **Prevent broken code from reaching remote** - Catches test failures before they're pushed
2. **Maintain code quality** - Ensures all code meets testing standards
3. **Faster feedback** - Developers find issues immediately, not in CI/CD
4. **Reduce CI/CD failures** - Fewer failed pipeline runs
5. **Team protection** - Prevents accidental pushes of broken code

## Setup

Husky is automatically set up when you run `npm install`:

```bash
npm install
```

This runs the `prepare` script which initializes Husky and installs the Git hooks.

## Bypassing Hooks (Use with Caution)

In rare cases where you need to bypass the pre-push hook:

```bash
git push --no-verify
```

**⚠️ Warning:** Only use `--no-verify` when absolutely necessary, such as:
- Emergency hotfixes where tests are temporarily broken
- Pushing work-in-progress to a personal branch
- CI/CD system issues

**Never** use `--no-verify` when pushing to:
- `main` or `master` branch
- Shared feature branches
- Release branches

## Running Tests Manually

You can run the same tests that the pre-push hook runs:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage

# Run all tests (unit + e2e)
npm run test:all
```

## Troubleshooting

### Hook Not Running

If the pre-push hook isn't running:

1. **Reinstall Husky:**
   ```bash
   npm run prepare
   ```

2. **Check hook is executable:**
   ```bash
   chmod +x .husky/pre-push
   ```

3. **Verify Husky is installed:**
   ```bash
   ls -la .husky/
   ```

### Tests Failing Locally

If tests fail when you try to push:

1. **Run tests to see failures:**
   ```bash
   npm test
   ```

2. **Fix the failing tests**

3. **Commit the fixes:**
   ```bash
   git add .
   git commit -m "fix: resolve test failures"
   ```

4. **Try pushing again:**
   ```bash
   git push
   ```

### Hook Runs But Tests Don't Execute

If the hook runs but tests don't execute:

1. **Check Jest is installed:**
   ```bash
   npm list jest
   ```

2. **Verify test script in package.json:**
   ```bash
   cat package.json | grep '"test"'
   ```

3. **Run tests manually to debug:**
   ```bash
   npm test -- --verbose
   ```

## Customizing Hooks

### Modifying the Pre-Push Hook

To change what the pre-push hook does, edit `.husky/pre-push`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🧪 Running tests before push..."

# Run only unit tests (example)
npm test -- --testPathPattern=src/__tests__

# Or run specific test suites
# npm test -- src/__tests__/app/

if [ $? -ne 0 ]; then
  echo "❌ Tests failed! Push aborted."
  exit 1
fi

echo "✅ All tests passed! Proceeding with push..."
```

### Adding More Hooks

You can add other hooks like pre-commit:

```bash
# Create pre-commit hook
echo '#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint
npm run type-check
' > .husky/pre-commit

chmod +x .husky/pre-commit
```

## Best Practices

1. **Keep hooks fast** - Slow hooks frustrate developers
2. **Run only essential checks** - Save comprehensive checks for CI/CD
3. **Provide clear error messages** - Help developers fix issues quickly
4. **Make hooks skippable** - Allow `--no-verify` for emergencies
5. **Document hook behavior** - Keep this file updated

## Hook Performance

Current pre-push hook performance:
- **Average runtime:** 4-5 seconds
- **Test count:** 57 tests across 7 suites
- **Acceptable:** Yes (under 10 seconds)

If the hook becomes too slow:
- Consider running only changed tests
- Move some checks to CI/CD
- Optimize slow tests

## CI/CD Integration

The pre-push hook complements CI/CD, not replaces it:

| Check | Pre-Push Hook | CI/CD Pipeline |
|-------|---------------|----------------|
| Unit tests | ✅ Yes | ✅ Yes |
| E2E tests | ❌ No | ✅ Yes |
| Linting | ❌ No | ✅ Yes |
| Type checking | ❌ No | ✅ Yes |
| Build | ❌ No | ✅ Yes |
| Security scan | ❌ No | ✅ Yes |
| Deploy | ❌ No | ✅ Yes |

The pre-push hook runs fast, essential checks. CI/CD runs comprehensive checks.

## Related Documentation

- [Testing Guide](./TESTING_GUIDE.md)
- [Development Guide](./DEVELOPMENT_GUIDE.md)
- [CI/CD Pipeline](../.github/workflows/)
- [Husky Documentation](https://typicode.github.io/husky/)

## Support

If you encounter issues with Git hooks:

1. Check this documentation
2. Run tests manually to verify they work
3. Check `.husky/` directory permissions
4. Consult with team members
5. Review Husky documentation
