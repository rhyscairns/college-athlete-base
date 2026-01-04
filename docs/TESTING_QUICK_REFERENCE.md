# Testing Quick Reference

Quick reference for running tests in the College Athlete Base project.

## Commands

### Unit & Integration Tests

```bash
npm run test                 # Run all tests
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Run tests with coverage report
```

### End-to-End Tests

```bash
npm run test:e2e            # Run E2E tests (headless)
npm run test:e2e:ui         # Run E2E tests with UI
npm run test:e2e:headed     # Run E2E tests in headed mode
```

### All Tests

```bash
npm run test:all            # Run unit tests + E2E tests
```

## Test File Patterns

- Unit tests: `*.test.ts`, `*.test.tsx`
- E2E tests: `*.spec.ts` (in `e2e/` directory)
- Test utilities: `src/__tests__/utils/`
- Example tests: `*.example.test.ts` (excluded from runs)

## Coverage Thresholds

All thresholds set to **80%**:
- Branches
- Functions
- Lines
- Statements

## CI Integration

Tests run automatically on:
- Pull requests (unit + E2E)
- Push to main branch
- Nightly validation (scheduled)

## Quick Tips

1. **Run specific test file:**
   ```bash
   npm run test -- path/to/test.test.ts
   ```

2. **Run tests matching pattern:**
   ```bash
   npm run test -- --testNamePattern="my test"
   ```

3. **Debug tests:**
   ```bash
   node --inspect-brk node_modules/.bin/jest --runInBand
   ```

4. **Update snapshots:**
   ```bash
   npm run test -- -u
   ```

5. **Run E2E test in debug mode:**
   ```bash
   npm run test:e2e -- --debug
   ```

## Test Reports

- **Coverage**: `coverage/lcov-report/index.html`
- **Playwright**: `playwright-report/index.html`

## Common Issues

| Issue | Solution |
|-------|----------|
| Tests timeout | Increase timeout in config |
| Module not found | Check `moduleNameMapper` in `jest.config.js` |
| Coverage too low | Add tests or adjust thresholds |
| E2E tests fail | Ensure app builds successfully |

## Resources

- [Full Testing Guide](./TESTING_GUIDE.md)
- [Jest Docs](https://jestjs.io/)
- [Playwright Docs](https://playwright.dev/)
