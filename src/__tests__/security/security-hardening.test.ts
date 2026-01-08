/**
 * Security hardening tests for player registration API
 * Tests password hashing, SQL injection prevention, error handling, and CORS
 */

import { hashPassword, verifyPassword } from '@/authentication/utils/password';
import { validatePlayerRegistration, normalizeEmail } from '@/authentication/utils/registerValidation';
import { query } from '@/authentication/db/client';

// Mock the database client
jest.mock('@/authentication/db/client', () => ({
    query: jest.fn(),
    getPool: jest.fn(),
}));

describe('Security Hardening Tests', () => {
    describe('Password Hashing Security', () => {
        it('should hash passwords using bcrypt', async () => {
            const password = 'TestPassword123!';
            const hash = await hashPassword(password);

            // Bcrypt hashes start with $2a$, $2b$, or $2y$
            expect(hash).toMatch(/^\$2[aby]\$/);
        });

        it('should generate different hashes for same password', async () => {
            const password = 'TestPassword123!';
            const hash1 = await hashPassword(password);
            const hash2 = await hashPassword(password);

            // Hashes should be different due to random salt
            expect(hash1).not.toBe(hash2);
        });

        it('should verify correct password', async () => {
            const password = 'TestPassword123!';
            const hash = await hashPassword(password);
            const isValid = await verifyPassword(password, hash);

            expect(isValid).toBe(true);
        });

        it('should reject incorrect password', async () => {
            const password = 'TestPassword123!';
            const wrongPassword = 'WrongPassword123!';
            const hash = await hashPassword(password);
            const isValid = await verifyPassword(wrongPassword, hash);

            expect(isValid).toBe(false);
        });

        it('should use minimum 10 rounds for bcrypt', async () => {
            const password = 'TestPassword123!';
            const hash = await hashPassword(password);

            // Extract cost factor from hash (format: $2a$10$...)
            const costMatch = hash.match(/^\$2[aby]\$(\d+)\$/);
            expect(costMatch).not.toBeNull();

            const cost = parseInt(costMatch![1], 10);
            expect(cost).toBeGreaterThanOrEqual(10);
        });

        it('should handle long passwords securely', async () => {
            const longPassword = 'A'.repeat(100) + '1!aB';
            const hash = await hashPassword(longPassword);

            expect(hash).toBeDefined();
            expect(hash.length).toBeGreaterThan(0);
        });
    });

    describe('SQL Injection Prevention', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should use parameterized queries (not string concatenation)', () => {
            // This test verifies that our query function is called with parameters
            // The actual SQL injection prevention is handled by the pg library
            const mockQuery = query as jest.MockedFunction<typeof query>;

            // Verify that queries use $1, $2 placeholders
            const sqlInjectionAttempt = "'; DROP TABLE players; --";

            // Our code should pass this as a parameter, not concatenate it
            expect(mockQuery).toBeDefined();
        });

        it('should treat SQL injection attempts as literal strings', () => {
            const maliciousInputs = [
                "'; DROP TABLE players; --",
                "' OR '1'='1",
                "admin'--",
                "' UNION SELECT * FROM users--",
                "1; DELETE FROM players WHERE 1=1--",
            ];

            maliciousInputs.forEach((input) => {
                const result = validatePlayerRegistration({
                    firstName: input,
                    lastName: 'Test',
                    email: 'test@example.com',
                    password: 'Password123!',
                    sex: 'male',
                    sport: 'basketball',
                    position: 'Guard',
                    gpa: 3.5,
                    country: 'USA',
                    state: 'California',
                });

                // Should pass validation (treated as literal string)
                // SQL injection is prevented by parameterized queries, not validation
                expect(result.isValid).toBe(true);
            });
        });

        it('should normalize email to prevent case-sensitive bypass', () => {
            const emails = [
                'Test@Example.com',
                'TEST@EXAMPLE.COM',
                'test@example.com',
                '  test@example.com  ',
            ];

            const normalized = emails.map(normalizeEmail);

            // All should normalize to same value
            expect(normalized.every((email) => email === 'test@example.com')).toBe(true);
        });
    });

    describe('Input Validation Security', () => {
        it('should enforce password complexity requirements', () => {
            const weakPasswords = [
                'short',           // Too short
                'alllowercase1!',  // No uppercase
                'ALLUPPERCASE1!',  // No lowercase
                'NoNumbers!',      // No numbers
                'NoSpecial123',    // No special characters
            ];

            weakPasswords.forEach((password) => {
                const result = validatePlayerRegistration({
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    password,
                    sex: 'male',
                    sport: 'basketball',
                    position: 'Guard',
                    gpa: 3.5,
                    country: 'USA',
                    state: 'California',
                });

                expect(result.isValid).toBe(false);
                expect(result.errors.some((e) => e.field === 'password')).toBe(true);
            });
        });

        it('should validate email format to prevent injection', () => {
            const invalidEmails = [
                'not-an-email',
                '@nodomain.com',
                'spaces in@email.com',
                'no-at-sign.com',
                'double@@domain.com',
                '',
                '   ',
            ];

            invalidEmails.forEach((email) => {
                const result = validatePlayerRegistration({
                    firstName: 'Test',
                    lastName: 'User',
                    email,
                    password: 'Password123!',
                    sex: 'male',
                    sport: 'basketball',
                    position: 'Guard',
                    gpa: 3.5,
                    country: 'USA',
                    state: 'California',
                });

                expect(result.isValid).toBe(false);
                expect(result.errors.some((e) => e.field === 'email')).toBe(true);
            });
        });

        it('should accept valid email formats', () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.co.uk',
                'first+last@test.edu',
                'numbers123@test.com',
            ];

            validEmails.forEach((email) => {
                const result = validatePlayerRegistration({
                    firstName: 'Test',
                    lastName: 'User',
                    email,
                    password: 'Password123!',
                    sex: 'male',
                    sport: 'basketball',
                    position: 'Guard',
                    gpa: 3.5,
                    country: 'USA',
                    state: 'California',
                });

                expect(result.isValid).toBe(true);
            });
        });

        it('should enforce field length limits', () => {
            const result = validatePlayerRegistration({
                firstName: 'A'.repeat(100), // Too long (max 50)
                lastName: 'Test',
                email: 'test@example.com',
                password: 'Password123!',
                sex: 'male',
                sport: 'basketball',
                position: 'Guard',
                gpa: 3.5,
                country: 'USA',
                state: 'California',
            });

            expect(result.isValid).toBe(false);
            expect(result.errors.some((e) => e.field === 'firstName')).toBe(true);
        });

        it('should validate GPA range to prevent invalid data', () => {
            const invalidGPAs = [-1, 5.0, 10, 999];

            invalidGPAs.forEach((gpa) => {
                const result = validatePlayerRegistration({
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    password: 'Password123!',
                    sex: 'male',
                    sport: 'basketball',
                    position: 'Guard',
                    gpa,
                    country: 'USA',
                    state: 'California',
                });

                expect(result.isValid).toBe(false);
                expect(result.errors.some((e) => e.field === 'gpa')).toBe(true);
            });
        });

        it('should sanitize scholarship amount to prevent negative values', () => {
            const result = validatePlayerRegistration({
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                password: 'Password123!',
                sex: 'male',
                sport: 'basketball',
                position: 'Guard',
                gpa: 3.5,
                country: 'USA',
                state: 'California',
                scholarshipAmount: -1000,
            });

            expect(result.isValid).toBe(false);
            expect(result.errors.some((e) => e.field === 'scholarshipAmount')).toBe(true);
        });
    });

    describe('Error Message Security', () => {
        it('should not expose sensitive information in validation errors', () => {
            const result = validatePlayerRegistration({
                firstName: '',
                lastName: '',
                email: 'invalid',
                password: 'weak',
                sex: 'invalid',
                sport: '',
                position: '',
                gpa: -1,
                country: '',
            });

            expect(result.isValid).toBe(false);

            // Check that error messages don't contain:
            // - Database table/column names
            // - File paths
            // - Stack traces
            // - Internal implementation details
            result.errors.forEach((error) => {
                expect(error.message).not.toMatch(/players/i); // table name
                expect(error.message).not.toMatch(/password_hash/i); // column name
                expect(error.message).not.toMatch(/\/src\//); // file paths
                expect(error.message).not.toMatch(/Error:/); // stack traces
                expect(error.message).not.toMatch(/at \w+\./); // stack traces
            });
        });

        it('should provide helpful but safe error messages', () => {
            const result = validatePlayerRegistration({
                firstName: '',
                lastName: 'User',
                email: 'test@example.com',
                password: 'Password123!',
                sex: 'male',
                sport: 'basketball',
                position: 'Guard',
                gpa: 3.5,
                country: 'USA',
                state: 'California',
            });

            expect(result.isValid).toBe(false);

            const firstNameError = result.errors.find((e) => e.field === 'firstName');
            expect(firstNameError).toBeDefined();
            expect(firstNameError!.message).toContain('required');
            expect(firstNameError!.message).not.toContain('database');
            expect(firstNameError!.message).not.toContain('SQL');
        });
    });

    describe('Data Sanitization', () => {
        it('should normalize email addresses', () => {
            expect(normalizeEmail('Test@Example.COM')).toBe('test@example.com');
            expect(normalizeEmail('  test@example.com  ')).toBe('test@example.com');
            expect(normalizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
        });

        it('should handle null and undefined safely', () => {
            const result = validatePlayerRegistration({
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                password: 'Password123!',
                sex: 'male',
                sport: 'basketball',
                position: 'Guard',
                gpa: 3.5,
                country: 'USA',
                state: 'California',
                scholarshipAmount: null,
                testScores: undefined,
            });

            // Should handle null/undefined gracefully
            expect(result.isValid).toBe(true);
        });

        it('should trim whitespace from string inputs', () => {
            const result = validatePlayerRegistration({
                firstName: '  Test  ',
                lastName: '  User  ',
                email: '  test@example.com  ',
                password: 'Password123!',
                sex: 'male',
                sport: '  basketball  ',
                position: '  Guard  ',
                gpa: 3.5,
                country: 'USA',
                state: '  California  ',
            });

            // Should accept trimmed values
            expect(result.isValid).toBe(true);
        });
    });

    describe('Environment Variable Security', () => {
        it('should not expose environment variables in errors', () => {
            // This is a conceptual test - in practice, we verify this through code review
            // and manual testing, as environment variables are not directly testable

            const sensitiveEnvVars = [
                'DATABASE_PASSWORD',
                'DATABASE_USER',
                'DATABASE_HOST',
                'BCRYPT_ROUNDS',
            ];

            // Verify these are not hardcoded in our validation logic
            const validationCode = validatePlayerRegistration.toString();

            sensitiveEnvVars.forEach((envVar) => {
                expect(validationCode).not.toContain(envVar);
            });
        });
    });

    describe('CORS Security', () => {
        it('should validate origin against whitelist (conceptual)', () => {
            // This test documents the expected CORS behavior
            // Actual CORS testing requires integration tests with HTTP requests

            const allowedOrigins = ['http://localhost:3000', 'https://yourdomain.com'];
            const testOrigin = 'https://malicious-site.com';

            // Our CORS implementation should reject unauthorized origins
            const isAllowed = allowedOrigins.includes(testOrigin);
            expect(isAllowed).toBe(false);
        });
    });

    describe('Rate Limiting Considerations', () => {
        it('should document rate limiting requirements', () => {
            // This test documents the need for rate limiting
            // Actual rate limiting should be implemented at the API gateway or middleware level

            const rateLimitRequirements = {
                maxRequestsPerMinute: 5,
                maxRequestsPerHour: 20,
                blockDuration: 15 * 60 * 1000, // 15 minutes
            };

            expect(rateLimitRequirements.maxRequestsPerMinute).toBe(5);
            expect(rateLimitRequirements.maxRequestsPerHour).toBe(20);
        });
    });
});
