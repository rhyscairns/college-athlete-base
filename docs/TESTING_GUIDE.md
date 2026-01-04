# Testing Guide

This document provides comprehensive information about the testing framework and best practices for the College Athlete Base project.

## Overview

The project uses a multi-layered testing approach:
- **Unit Tests**: Jest with React Testing Library for component and API route testing
- **Integration Tests**: Jest for testing interactions between components and services
- **End-to-End Tests**: Playwright for full application flow testing

## Test Structure

```
src/
├── __tests__/           # Unit and integration tests
│   ├── app/
│   │   ├── layout.test.tsx
│   │   ├── page.test.tsx
│   │   └── api/
│   │       └── health/
│   │           └── route.test.ts
e2e/                     # End-to-end tests
├── home.spec.ts
└── api-health.spec.ts
```

## Running Tests

### Unit and Integration Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### End-to-End Tests

```bash
# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed
```

### Run All Tests

```bash
# Run unit tests with coverage and E2E tests
npm run test:all
```

## Writing Tests

### Unit Tests for Components

```typescript
import { render, screen } from '@testing-library/react'
import MyComponent from '@/app/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Unit Tests for API Routes

```typescript
/**
 * @jest-environment node
 */
import { GET } from '@/app/api/my-route/route'

describe('/api/my-route', () => {
  it('returns expected data', async () => {
    const response = await GET()
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('key', 'value')
  })
})
```

### End-to-End Tests

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should perform expected action', async ({ page }) => {
    await page.goto('/')
    
    await page.click('button[data-testid="my-button"]')
    
    await expect(page.locator('.result')).toBeVisible()
  })
})
```

## Coverage Requirements

The project enforces minimum coverage thresholds:
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

Coverage reports are generated in the `coverage/` directory and uploaded as artifacts in CI.

## CI Integration

Tests run automatically on:
- Pull request creation and updates
- Push to main branch

### CI Test Jobs

1. **Unit Tests**: Runs Jest tests with coverage reporting
2. **E2E Tests**: Runs Playwright tests against built application
3. **Code Quality**: SonarCloud analysis with coverage data

## Best Practices

### General

- Write tests alongside feature development
- Aim for meaningful test coverage, not just high percentages
- Test behavior, not implementation details
- Use descriptive test names that explain what is being tested

### Unit Tests

- Mock external dependencies
- Test edge cases and error conditions
- Keep tests focused and isolated
- Use `data-testid` attributes for reliable element selection

### E2E Tests

- Test critical user flows
- Keep E2E tests stable and reliable
- Use page object pattern for complex pages
- Run E2E tests against production-like builds

### API Route Tests

- Use `@jest-environment node` for API route tests
- Test all response codes (success and error cases)
- Verify response structure and data types
- Test authentication and authorization

## Debugging Tests

### Jest Tests

```bash
# Run specific test file
npm run test -- path/to/test.test.ts

# Run tests matching pattern
npm run test -- --testNamePattern="my test name"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Playwright Tests

```bash
# Run specific test file
npm run test:e2e -- e2e/my-test.spec.ts

# Debug with Playwright Inspector
npm run test:e2e -- --debug

# Run with headed browser
npm run test:e2e:headed
```

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Cannot find module '@/...'"
**Solution**: Check `moduleNameMapper` in `jest.config.js` is correctly configured

**Issue**: Playwright tests timeout
**Solution**: Increase timeout in `playwright.config.ts` or check if dev server is running

**Issue**: Coverage threshold not met
**Solution**: Add tests for uncovered code or adjust thresholds in `jest.config.js`

## Configuration Files

- `jest.config.js`: Jest configuration and coverage thresholds
- `jest.setup.js`: Jest setup file for test environment
- `playwright.config.ts`: Playwright configuration for E2E tests

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Next.js Testing](https://nextjs.org/docs/testing)
