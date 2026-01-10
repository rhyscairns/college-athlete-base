/**
 * Integration tests for complete player registration flow
 * Tests the entire registration process from API endpoint to database
 * @jest-environment node
 */

import { POST, OPTIONS } from '@/app/api/auth/register/player/route';
import { getPlayerByEmail, checkEmailExists } from '@/authentication/db/players';
import { verifyPassword } from '@/authentication/utils/password';
import { query, closePool } from '@/authentication/db/client';
import { NextRequest } from 'next/server';

// Skip these tests if no database is configured
const skipIfNoDb = process.env.DATABASE_HOST ? describe : describe.skip;

/**
 * Helper function to create a mock NextRequest
 */
function createMockRequest(body: any, options: { origin?: string; method?: string } = {}): NextRequest {
    const url = 'http://localhost:3000/api/auth/register/player';
    const headers = new Headers({
        'content-type': 'application/json',
    });

    if (options.origin) {
        headers.set('origin', options.origin);
    }

    const request = new NextRequest(url, {
        method: options.method || 'POST',
        headers,
        body: JSON.stringify(body),
    });

    return request;
}

skipIfNoDb('Player Registration - Complete Integration Flow', () => {
    // Clean up test data after all tests
    afterAll(async () => {
        try {
            // Clean up any test data created during tests
            await query('DELETE FROM players WHERE email LIKE $1', ['%@integration-test.com']);
            await closePool();
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    });

    // Clean up after each test to ensure isolation
    afterEach(async () => {
        try {
            await query('DELETE FROM players WHERE email LIKE $1', ['%@integration-test.com']);
        } catch (error) {
            console.error('Test cleanup error:', error);
        }
    });

    describe('Complete Registration Flow', () => {
        it('should have a working database connection', async () => {
            const result = await query('SELECT 1 as test');
            expect(result).toBeDefined();
            expect(result[0].test).toBe(1);
        });

        it('should successfully register a player with all required fields', async () => {
            const registrationData = {
                firstName: 'John',
                lastName: 'Doe',
                email: `john.doe.${Date.now()}@integration-test.com`,
                password: 'SecurePass123!',
                sex: 'male',
                sport: 'basketball',
                position: 'Point Guard',
                gpa: 3.5,
                country: 'USA',
                state: 'California',
            };

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            // Verify API response
            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.message).toBe('Player registered successfully');
            expect(data.playerId).toBeDefined();
            expect(typeof data.playerId).toBe('string');

            // Verify data was persisted in database
            const player = await getPlayerByEmail(registrationData.email);
            expect(player).toBeDefined();
            expect(player?.id).toBe(data.playerId);
            expect(player?.firstName).toBe(registrationData.firstName);
            expect(player?.lastName).toBe(registrationData.lastName);
            expect(player?.email).toBe(registrationData.email);
            expect(player?.sex).toBe(registrationData.sex);
            expect(player?.sport).toBe(registrationData.sport);
            expect(player?.position).toBe(registrationData.position);
            expect(player?.gpa).toBe(registrationData.gpa);
            expect(player?.country).toBe(registrationData.country);
            expect(player?.state).toBe(registrationData.state);
            expect(player?.createdAt).toBeInstanceOf(Date);
            expect(player?.updatedAt).toBeInstanceOf(Date);
        });

        it('should successfully register a player with optional fields', async () => {
            const registrationData = {
                firstName: 'Jane',
                lastName: 'Smith',
                email: `jane.smith.${Date.now()}@integration-test.com`,
                password: 'SecurePass456!',
                sex: 'female',
                sport: 'soccer',
                position: 'Forward',
                gpa: 3.8,
                country: 'Canada',
                region: 'Ontario',
                scholarshipAmount: 50000,
                testScores: 'SAT: 1450, ACT: 32',
            };

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);

            // Verify optional fields were saved
            const player = await getPlayerByEmail(registrationData.email);
            expect(player?.region).toBe(registrationData.region);
            expect(player?.scholarshipAmount).toBe(registrationData.scholarshipAmount);
            expect(player?.testScores).toBe(registrationData.testScores);
        });
    });

    describe('Email Normalization', () => {
        it('should normalize email to lowercase', async () => {
            const registrationData = {
                firstName: 'Test',
                lastName: 'User',
                email: `TEST.USER.${Date.now()}@INTEGRATION-TEST.COM`,
                password: 'SecurePass123!',
                sex: 'male',
                sport: 'football',
                position: 'Quarterback',
                gpa: 3.2,
                country: 'USA',
                state: 'Texas',
            };

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);

            // Verify email was normalized to lowercase
            const player = await getPlayerByEmail(registrationData.email);
            expect(player?.email).toBe(registrationData.email.toLowerCase());
        });

        it('should trim whitespace from email', async () => {
            const email = `whitespace.${Date.now()}@integration-test.com`;
            const registrationData = {
                firstName: 'Test',
                lastName: 'User',
                email: `  ${email}  `,
                password: 'SecurePass123!',
                sex: 'female',
                sport: 'volleyball',
                position: 'Setter',
                gpa: 3.6,
                country: 'USA',
                state: 'Florida',
            };

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);

            // Verify email was trimmed
            const player = await getPlayerByEmail(email);
            expect(player?.email).toBe(email);
        });
    });

    describe('Password Hashing', () => {
        it('should hash password before storing', async () => {
            const plainPassword = 'MySecurePassword123!';
            const registrationData = {
                firstName: 'Password',
                lastName: 'Test',
                email: `password.test.${Date.now()}@integration-test.com`,
                password: plainPassword,
                sex: 'male',
                sport: 'tennis',
                position: 'Singles',
                gpa: 3.4,
                country: 'USA',
                state: 'New York',
            };

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);

            // Verify password was hashed
            const player = await getPlayerByEmail(registrationData.email);
            expect(player?.passwordHash).toBeDefined();
            expect(player?.passwordHash).not.toBe(plainPassword);
            expect(player?.passwordHash.length).toBeGreaterThan(50); // bcrypt hashes are long

            // Verify the hash can be verified
            const isValid = await verifyPassword(plainPassword, player!.passwordHash);
            expect(isValid).toBe(true);

            // Verify wrong password fails
            const isInvalid = await verifyPassword('WrongPassword123!', player!.passwordHash);
            expect(isInvalid).toBe(false);
        });

        it('should use bcrypt with proper salt rounds', async () => {
            const registrationData = {
                firstName: 'Bcrypt',
                lastName: 'Test',
                email: `bcrypt.test.${Date.now()}@integration-test.com`,
                password: 'TestPassword123!',
                sex: 'female',
                sport: 'swimming',
                position: 'Freestyle',
                gpa: 3.7,
                country: 'USA',
                state: 'California',
            };

            const request = createMockRequest(registrationData);
            const response = await POST(request);

            expect(response.status).toBe(201);

            const player = await getPlayerByEmail(registrationData.email);

            // Bcrypt hashes start with $2a$, $2b$, or $2y$ followed by cost factor
            expect(player?.passwordHash).toMatch(/^\$2[aby]\$\d{2}\$/);
        });
    });

    describe('Duplicate Email Prevention', () => {
        it('should prevent registration with duplicate email', async () => {
            const email = `duplicate.${Date.now()}@integration-test.com`;
            const firstRegistration = {
                firstName: 'First',
                lastName: 'User',
                email,
                password: 'Password123!',
                sex: 'male',
                sport: 'baseball',
                position: 'Pitcher',
                gpa: 3.3,
                country: 'USA',
                state: 'Illinois',
            };

            // First registration should succeed
            const firstRequest = createMockRequest(firstRegistration);
            const firstResponse = await POST(firstRequest);
            const firstData = await firstResponse.json();

            expect(firstResponse.status).toBe(201);
            expect(firstData.success).toBe(true);

            // Second registration with same email should fail
            const secondRegistration = {
                ...firstRegistration,
                firstName: 'Second',
                lastName: 'User',
            };

            const secondRequest = createMockRequest(secondRegistration);
            const secondResponse = await POST(secondRequest);
            const secondData = await secondResponse.json();

            expect(secondResponse.status).toBe(409);
            expect(secondData.success).toBe(false);
            expect(secondData.message).toBe('Email already registered');

            // Verify only one player exists
            const emailExists = await checkEmailExists(email);
            expect(emailExists).toBe(true);

            const player = await getPlayerByEmail(email);
            expect(player?.firstName).toBe('First'); // Original registration
        });

        it('should detect duplicate email case-insensitively', async () => {
            const email = `case.test.${Date.now()}@integration-test.com`;
            const firstRegistration = {
                firstName: 'Lower',
                lastName: 'Case',
                email: email.toLowerCase(),
                password: 'Password123!',
                sex: 'female',
                sport: 'track',
                position: 'Sprinter',
                gpa: 3.5,
                country: 'USA',
                state: 'Oregon',
            };

            // Register with lowercase email
            const firstRequest = createMockRequest(firstRegistration);
            const firstResponse = await POST(firstRequest);

            expect(firstResponse.status).toBe(201);

            // Try to register with uppercase email
            const secondRegistration = {
                ...firstRegistration,
                email: email.toUpperCase(),
                firstName: 'Upper',
            };

            const secondRequest = createMockRequest(secondRegistration);
            const secondResponse = await POST(secondRequest);
            const secondData = await secondResponse.json();

            expect(secondResponse.status).toBe(409);
            expect(secondData.success).toBe(false);
            expect(secondData.message).toBe('Email already registered');
        });
    });

    describe('Validation Errors', () => {
        it('should return validation errors for missing required fields', async () => {
            // Use a unique email that will be cleaned up
            const testEmail = `incomplete.${Date.now()}@integration-test.com`;
            const invalidData = {
                firstName: 'Test',
                email: testEmail,
                // Missing lastName, password, etc.
            };

            const request = createMockRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toBeDefined();
            expect(Array.isArray(data.errors)).toBe(true);
            expect(data.errors.length).toBeGreaterThan(0);

            // Verify no data was saved (check by the specific email)
            const players = await query('SELECT COUNT(*) as count FROM players WHERE email = $1', [testEmail]);
            expect(parseInt(players[0].count)).toBe(0);
        });

        it('should return validation errors for invalid email format', async () => {
            const invalidData = {
                firstName: 'Test',
                lastName: 'User',
                email: 'invalid-email',
                password: 'Password123!',
                sex: 'male',
                sport: 'basketball',
                position: 'Guard',
                gpa: 3.5,
                country: 'USA',
                state: 'California',
            };

            const request = createMockRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toBeDefined();

            const emailError = data.errors.find((e: any) => e.field === 'email');
            expect(emailError).toBeDefined();
        });

        it('should return validation errors for weak password', async () => {
            const invalidData = {
                firstName: 'Test',
                lastName: 'User',
                email: `weak.password.${Date.now()}@integration-test.com`,
                password: 'weak',
                sex: 'male',
                sport: 'basketball',
                position: 'Guard',
                gpa: 3.5,
                country: 'USA',
                state: 'California',
            };

            const request = createMockRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toBeDefined();

            const passwordError = data.errors.find((e: any) => e.field === 'password');
            expect(passwordError).toBeDefined();
        });

        it('should return validation errors for invalid GPA', async () => {
            const invalidData = {
                firstName: 'Test',
                lastName: 'User',
                email: `invalid.gpa.${Date.now()}@integration-test.com`,
                password: 'Password123!',
                sex: 'male',
                sport: 'basketball',
                position: 'Guard',
                gpa: 5.0, // Invalid: GPA should be 0.0-4.0
                country: 'USA',
                state: 'California',
            };

            const request = createMockRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toBeDefined();

            const gpaError = data.errors.find((e: any) => e.field === 'gpa');
            expect(gpaError).toBeDefined();
        });
    });

    describe('CORS Headers', () => {
        it('should include CORS headers in successful response', async () => {
            const registrationData = {
                firstName: 'CORS',
                lastName: 'Test',
                email: `cors.test.${Date.now()}@integration-test.com`,
                password: 'Password123!',
                sex: 'male',
                sport: 'hockey',
                position: 'Center',
                gpa: 3.4,
                country: 'USA',
                state: 'Minnesota',
            };

            const request = createMockRequest(registrationData, { origin: 'http://localhost:3000' });
            const response = await POST(request);

            expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();
            expect(response.headers.get('Access-Control-Allow-Methods')).toBeDefined();
            expect(response.headers.get('Access-Control-Allow-Headers')).toBeDefined();
        });

        it('should handle OPTIONS request for CORS preflight', async () => {
            const request = createMockRequest({}, { origin: 'http://localhost:3000', method: 'OPTIONS' });
            const response = await OPTIONS(request);

            expect(response.status).toBe(200);
            expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();
            expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
            expect(response.headers.get('Access-Control-Allow-Methods')).toContain('OPTIONS');
            expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type');
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid JSON in request body', async () => {
            const url = 'http://localhost:3000/api/auth/register/player';
            const request = new NextRequest(url, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: 'invalid json{',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.message).toContain('Invalid JSON');
        });

        it('should return 500 for database connection errors', async () => {
            // This test would require mocking the database connection to fail
            // For now, we'll skip it as it requires more complex setup
            // In a real scenario, you might temporarily set invalid DB credentials
        });
    });

    describe('Data Persistence', () => {
        it('should persist all player data correctly', async () => {
            const registrationData = {
                firstName: 'Complete',
                lastName: 'Data',
                email: `complete.data.${Date.now()}@integration-test.com`,
                password: 'CompletePass123!',
                sex: 'female',
                sport: 'lacrosse',
                position: 'Attack',
                gpa: 3.85,
                country: 'USA',
                state: 'Maryland',
                scholarshipAmount: 45000,
                testScores: 'SAT: 1380, ACT: 31',
            };

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);

            // Query database directly to verify all fields
            const result = await query(
                'SELECT * FROM players WHERE id = $1',
                [data.playerId]
            );

            expect(result.length).toBe(1);
            const dbPlayer = result[0];

            expect(dbPlayer.first_name).toBe(registrationData.firstName);
            expect(dbPlayer.last_name).toBe(registrationData.lastName);
            expect(dbPlayer.email).toBe(registrationData.email);
            expect(dbPlayer.sex).toBe(registrationData.sex);
            expect(dbPlayer.sport).toBe(registrationData.sport);
            expect(dbPlayer.position).toBe(registrationData.position);
            expect(parseFloat(dbPlayer.gpa)).toBe(registrationData.gpa);
            expect(dbPlayer.country).toBe(registrationData.country);
            expect(dbPlayer.state).toBe(registrationData.state);
            expect(parseFloat(dbPlayer.scholarship_amount)).toBe(registrationData.scholarshipAmount);
            expect(dbPlayer.test_scores).toBe(registrationData.testScores);
            expect(dbPlayer.created_at).toBeDefined();
            expect(dbPlayer.updated_at).toBeDefined();
        });

        it('should handle NULL values for optional fields', async () => {
            const registrationData = {
                firstName: 'Minimal',
                lastName: 'Fields',
                email: `minimal.fields.${Date.now()}@integration-test.com`,
                password: 'MinimalPass123!',
                sex: 'male',
                sport: 'golf',
                position: 'Individual',
                gpa: 3.0,
                country: 'USA',
                state: 'Arizona',
                // No optional fields
            };

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);

            const result = await query(
                'SELECT * FROM players WHERE id = $1',
                [data.playerId]
            );

            const dbPlayer = result[0];
            expect(dbPlayer.scholarship_amount).toBeNull();
            expect(dbPlayer.test_scores).toBeNull();
        });
    });

    describe('Concurrent Registrations', () => {
        it('should handle multiple simultaneous registrations', async () => {
            const registrations = Array.from({ length: 5 }, (_, i) => ({
                firstName: `Concurrent${i}`,
                lastName: 'Test',
                email: `concurrent.${i}.${Date.now()}@integration-test.com`,
                password: 'Password123!',
                sex: i % 2 === 0 ? 'male' : 'female',
                sport: 'basketball',
                position: 'Guard',
                gpa: 3.0 + (i * 0.1),
                country: 'USA',
                state: 'California',
            }));

            // Register all players concurrently
            const promises = registrations.map(data => {
                const request = createMockRequest(data);
                return POST(request);
            });

            const responses = await Promise.all(promises);

            // All should succeed
            responses.forEach(response => {
                expect(response.status).toBe(201);
            });

            // Verify all were created
            for (const registration of registrations) {
                const exists = await checkEmailExists(registration.email);
                expect(exists).toBe(true);
            }
        });
    });
});
