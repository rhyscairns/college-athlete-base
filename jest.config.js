const nextJest = require('next/jest')

const createJestConfig = nextJest({
    dir: './',
})

const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.stories.{js,jsx,ts,tsx}',
        '!src/**/__tests__/**',
        '!src/**/__mocks__/**',
        '!src/**/*.example.{js,jsx,ts,tsx}',
        // Next.js page/layout/route entry points — logic lives in components & services
        '!src/app/**',
    ],
    coverageThreshold: {
        global: {
            branches: 60,
            functions: 60,
            lines: 60,
            statements: 60,
        },
    },
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.(test|spec).[jt]s?(x)',
        '<rootDir>/src/**/?(*.)+(spec|test).[jt]s?(x)',
    ],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/.next/',
        '/e2e/',
        '.*\\.example\\.(test|spec)\\.[jt]sx?$',
    ],
}

module.exports = createJestConfig(customJestConfig)
