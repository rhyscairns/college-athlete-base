/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/register/player/route';
import { query } from '@/authentication/db/client';
import { verifyPassword } from '@/authentication/utils/password';
import {
    generatePlayerRegistration,
    generateDateOfBirth,
    generatePlayerWithAge,
} from '@/__tests__/utils/test-data-generators';

// Mock the database client
jest.mock('@/authentication/db/client');

// Mock the referral chain resolver so registration tests don't need DB for chain resolution
jest.mock('@/earnings/utils/resolveReferralChain', () => ({
    resolveReferralChain: jest.fn().mockResolvedValue(null),
}));

import { resolveReferralChain } from '@/earnings/utils/resolveReferralChain';
const mockResolveReferralChain = resolveReferralChain as jest.MockedFunction<typeof resolveReferralChain>;

describe('Player Registration - Complete Integration Flow', () => {
    const mockQuery = query as jest.MockedFunction<typeof query>;

    beforeEach(() => {
        jest.clearAllMocks();
        // Default: no referral chain
        mockResolveReferralChain.mockResolvedValue(null);
        // Set required environment variables
        process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
    });

    afterEach(() => {
        delete process.env.ALLOWED_ORIGINS;
    });

    const createMockRequest = (body: any) => {
        return new NextRequest('http://localhost:3000/api/auth/register/player', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'origin': 'http://localhost:3000',
            },
            body: JSON.stringify(body),
        });
    };

    describe('Successful Registration', () => {
        it('should successfully register player with all required fields including dateOfBirth', async () => {
            const registrationData = generatePlayerRegistration();

            // Mock email check to return false (email doesn't exist)
            mockQuery.mockResolvedValueOnce([{ exists: false }]);

            // Mock player creation to return player ID
            mockQuery.mockResolvedValueOnce([{ id: 'player-uuid-123' }]);

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            // Verify response
            expect(response.status).toBe(201);
            expect(data).toEqual({
                success: true,
                message: 'Player registered successfully',
                playerId: 'player-uuid-123',
            });

            // Verify CORS headers
            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');

            // Verify database was called twice (email check + insert)
            expect(mockQuery).toHaveBeenCalledTimes(2);

            // Verify email check query
            expect(mockQuery).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('EXISTS'),
                [registrationData.email.toLowerCase()]
            );

            // Verify insert query includes dateOfBirth
            expect(mockQuery).toHaveBeenNthCalledWith(
                2,
                expect.stringContaining('INSERT INTO players'),
                expect.arrayContaining([
                    registrationData.firstName,
                    registrationData.lastName,
                    registrationData.dateOfBirth,
                    registrationData.email.toLowerCase(),
                    expect.any(String), // password hash
                    registrationData.sex,
                    registrationData.sport,
                    registrationData.position,
                    registrationData.gpa,
                    registrationData.country,
                    registrationData.state,
                    null, // region
                    null, // scholarshipAmount
                    null, // testScores
                    null, // secondary_referral_promo_code
                    null, // tertiary_referral_promo_code
                    'standard', // subscription_plan (no promo code used)
                ])
            );

            // Requirement 1.1, 1.3: stored sport value must be title-case
            const insertArgs = mockQuery.mock.calls[1][1] as unknown[];
            const storedSport = insertArgs.find((v) => v === registrationData.sport);
            expect(storedSport).toBe('Basketball'); // title-case, not 'basketball'
        });

        it('should store sport value in title-case format (Requirement 1.1, 1.3)', async () => {
            // Explicitly use a title-case sport name — this is what SPORTS_LIST now produces
            const registrationData = generatePlayerRegistration({ sport: 'Soccer', position: 'Goalkeeper' });

            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            mockQuery.mockResolvedValueOnce([{ id: 'player-uuid-soccer' }]);

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);

            // Assert the sport stored in the DB is title-case 'Soccer', not 'soccer'
            const insertArgs = mockQuery.mock.calls[1][1] as unknown[];
            expect(insertArgs).toContain('Soccer');
            expect(insertArgs).not.toContain('soccer');
        });

        it('should successfully register player with complete field set', async () => {
            const registrationData = generatePlayerRegistration({
                scholarshipAmount: 50000,
                testScores: 'SAT: 1400, ACT: 32',
            });

            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            mockQuery.mockResolvedValueOnce([{ id: 'player-uuid-456' }]);

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.playerId).toBe('player-uuid-456');

            // Verify optional fields were included
            expect(mockQuery).toHaveBeenNthCalledWith(
                2,
                expect.stringContaining('INSERT INTO players'),
                expect.arrayContaining([
                    registrationData.scholarshipAmount,
                    registrationData.testScores,
                ])
            );
        });

        it('should successfully register player with minimal required fields', async () => {
            const registrationData = generatePlayerRegistration();
            // Remove optional fields
            delete (registrationData as any).scholarshipAmount;
            delete (registrationData as any).testScores;

            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            mockQuery.mockResolvedValueOnce([{ id: 'player-uuid-789' }]);

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.playerId).toBe('player-uuid-789');
        });

        it('should hash password before storing', async () => {
            const registrationData = generatePlayerRegistration({
                password: 'MySecurePassword123!',
            });

            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            mockQuery.mockResolvedValueOnce([{ id: 'player-uuid-hash' }]);

            const request = createMockRequest(registrationData);
            await POST(request);

            // Get the password hash that was passed to the database
            const insertCall = mockQuery.mock.calls[1];
            const passwordHash = insertCall?.[1]?.[4] as string; // 5th parameter is password_hash

            // Verify password was hashed (not stored as plain text)
            expect(passwordHash).not.toBe('MySecurePassword123!');
            expect(passwordHash).toMatch(/^\$2[aby]\$/); // bcrypt hash format

            // Verify the hash can be verified against the original password
            const isValid = await verifyPassword('MySecurePassword123!', passwordHash);
            expect(isValid).toBe(true);
        });

        it('should normalize email to lowercase', async () => {
            const registrationData = generatePlayerRegistration({
                email: 'Test.Player@EXAMPLE.COM',
            });

            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            mockQuery.mockResolvedValueOnce([{ id: 'player-uuid-email' }]);

            const request = createMockRequest(registrationData);
            await POST(request);

            // Verify email was normalized in both queries
            expect(mockQuery).toHaveBeenNthCalledWith(
                1,
                expect.any(String),
                ['test.player@example.com']
            );

            expect(mockQuery).toHaveBeenNthCalledWith(
                2,
                expect.any(String),
                expect.arrayContaining(['test.player@example.com'])
            );
        });
    });

    describe('Age Validation', () => {
        it('should accept player who is exactly 13 years old', async () => {
            // Create a date that's 13 years and 1 day ago to avoid edge case issues
            const today = new Date();
            const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate() - 1);
            const dateString = thirteenYearsAgo.toISOString().split('T')[0];

            const registrationData = generatePlayerRegistration({
                dateOfBirth: dateString,
            });

            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            mockQuery.mockResolvedValueOnce([{ id: 'player-uuid-13' }]);

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
        });

        it('should accept player who is 17 years old', async () => {
            const registrationData = generatePlayerWithAge(17);

            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            mockQuery.mockResolvedValueOnce([{ id: 'player-uuid-17' }]);

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
        });

        it('should accept player who is 22 years old', async () => {
            const registrationData = generatePlayerWithAge(22);

            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            mockQuery.mockResolvedValueOnce([{ id: 'player-uuid-22' }]);

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
        });

        it('should reject player who is under 13 years old', async () => {
            const registrationData = generatePlayerWithAge(12);

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'dateOfBirth',
                message: 'You must be at least 13 years old to register',
            });

            // Verify database was not called
            expect(mockQuery).not.toHaveBeenCalled();
        });

        it('should reject player with future date of birth', async () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            const futureDateString = futureDate.toISOString().split('T')[0];

            const registrationData = generatePlayerRegistration({
                dateOfBirth: futureDateString,
            });

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'dateOfBirth',
                message: 'Date of birth cannot be in the future',
            });

            expect(mockQuery).not.toHaveBeenCalled();
        });

        it('should reject player with missing dateOfBirth', async () => {
            const registrationData = generatePlayerRegistration();
            delete (registrationData as any).dateOfBirth;

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'dateOfBirth',
                message: 'Date of birth is required',
            });

            expect(mockQuery).not.toHaveBeenCalled();
        });

        it('should reject player with invalid date format', async () => {
            const registrationData = generatePlayerRegistration({
                dateOfBirth: 'invalid-date',
            });

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'dateOfBirth',
                message: 'Invalid date format',
            });

            expect(mockQuery).not.toHaveBeenCalled();
        });
    });

    describe('Duplicate Email Handling', () => {
        it('should reject registration with duplicate email', async () => {
            const registrationData = generatePlayerRegistration({
                email: 'existing@example.com',
            });

            // Mock email check to return true (email exists)
            mockQuery.mockResolvedValueOnce([{ exists: true }]);

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(409);
            expect(data).toEqual({
                success: false,
                message: 'Email already registered',
            });

            // Verify only email check was called, not insert
            expect(mockQuery).toHaveBeenCalledTimes(1);
        });

        it('should handle duplicate email case-insensitively', async () => {
            const registrationData = generatePlayerRegistration({
                email: 'DUPLICATE@EXAMPLE.COM',
            });

            mockQuery.mockResolvedValueOnce([{ exists: true }]);

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(409);
            expect(data.message).toBe('Email already registered');

            // Verify email was normalized before checking
            expect(mockQuery).toHaveBeenCalledWith(
                expect.any(String),
                ['duplicate@example.com']
            );
        });
    });

    describe('Concurrent Registrations', () => {
        it('should handle multiple registrations with different emails', async () => {
            const player1 = generatePlayerRegistration();
            const player2 = generatePlayerRegistration();
            const player3 = generatePlayerRegistration();

            // Test each registration sequentially to ensure predictable mock behavior
            // First registration
            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            mockQuery.mockResolvedValueOnce([{ id: 'player-uuid-1' }]);
            const response1 = await POST(createMockRequest(player1));
            const data1 = await response1.json();

            // Second registration
            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            mockQuery.mockResolvedValueOnce([{ id: 'player-uuid-2' }]);
            const response2 = await POST(createMockRequest(player2));
            const data2 = await response2.json();

            // Third registration
            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            mockQuery.mockResolvedValueOnce([{ id: 'player-uuid-3' }]);
            const response3 = await POST(createMockRequest(player3));
            const data3 = await response3.json();

            // All should succeed
            expect(response1.status).toBe(201);
            expect(response2.status).toBe(201);
            expect(response3.status).toBe(201);

            expect(data1.playerId).toBe('player-uuid-1');
            expect(data2.playerId).toBe('player-uuid-2');
            expect(data3.playerId).toBe('player-uuid-3');

            // Verify all database calls were made
            expect(mockQuery).toHaveBeenCalledTimes(6);
        });

        it('should handle multiple registrations with one duplicate email', async () => {
            const player1 = generatePlayerRegistration();
            const player2 = generatePlayerRegistration({
                email: 'duplicate@example.com',
            });
            const player3 = generatePlayerRegistration();

            // First registration succeeds
            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            mockQuery.mockResolvedValueOnce([{ id: 'player-uuid-1' }]);
            const response1 = await POST(createMockRequest(player1));
            const data1 = await response1.json();

            // Second registration fails (duplicate email)
            mockQuery.mockResolvedValueOnce([{ exists: true }]);
            const response2 = await POST(createMockRequest(player2));
            const data2 = await response2.json();

            // Third registration succeeds
            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            mockQuery.mockResolvedValueOnce([{ id: 'player-uuid-3' }]);
            const response3 = await POST(createMockRequest(player3));
            const data3 = await response3.json();

            // Player 1 and 3 should succeed
            expect(response1.status).toBe(201);
            expect(data1.success).toBe(true);
            expect(data1.playerId).toBe('player-uuid-1');

            expect(response3.status).toBe(201);
            expect(data3.success).toBe(true);
            expect(data3.playerId).toBe('player-uuid-3');

            // Player 2 should fail with duplicate email
            expect(response2.status).toBe(409);
            expect(data2.success).toBe(false);
            expect(data2.message).toBe('Email already registered');

            // Verify correct number of database calls (2 + 1 + 2 = 5)
            expect(mockQuery).toHaveBeenCalledTimes(5);
        });
    });

    describe('Validation Errors', () => {
        it('should return 400 for missing required fields', async () => {
            const invalidData = {
                email: 'test@example.com',
                password: 'Password123!',
                // Missing all other required fields
            };

            const request = createMockRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toBeDefined();
            expect(data.errors.length).toBeGreaterThan(0);

            // Verify database was not called
            expect(mockQuery).not.toHaveBeenCalled();
        });

        it('should return 400 for invalid email format', async () => {
            const registrationData = generatePlayerRegistration({
                email: 'invalid-email',
            });

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'email',
                message: 'Please enter a valid email address',
            });

            expect(mockQuery).not.toHaveBeenCalled();
        });

        it('should return 400 for weak password', async () => {
            const registrationData = generatePlayerRegistration({
                password: 'weak',
            });

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'password',
                message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
            });

            expect(mockQuery).not.toHaveBeenCalled();
        });

        it('should return 400 for invalid GPA', async () => {
            const registrationData = generatePlayerRegistration({
                gpa: 5.0, // Invalid: GPA must be 0.0-4.0
            });

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'gpa',
                message: 'GPA must be between 0.0 and 4.0',
            });

            expect(mockQuery).not.toHaveBeenCalled();
        });

        it('should return 400 for missing state when country is USA', async () => {
            const registrationData = generatePlayerRegistration({
                country: 'USA',
                state: undefined,
            });

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'state',
                message: 'State is required when country is USA',
            });

            expect(mockQuery).not.toHaveBeenCalled();
        });

        it('should return 400 for missing region when country is not USA', async () => {
            const registrationData = generatePlayerRegistration({
                country: 'Canada',
                state: undefined,
                region: undefined,
            });

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'region',
                message: 'Region is required when country is not USA',
            });

            expect(mockQuery).not.toHaveBeenCalled();
        });

        it('should return 400 for invalid JSON in request body', async () => {
            const request = new NextRequest('http://localhost:3000/api/auth/register/player', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'origin': 'http://localhost:3000',
                },
                body: 'invalid-json{',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({
                success: false,
                message: 'Invalid JSON in request body',
            });

            expect(mockQuery).not.toHaveBeenCalled();
        });
    });

    describe('Database Errors', () => {
        it('should return 500 when email check fails', async () => {
            const registrationData = generatePlayerRegistration();

            // Mock database error on email check
            mockQuery.mockRejectedValueOnce(new Error('Database connection failed'));

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({
                success: false,
                message: 'An error occurred during registration',
            });
        });

        it('should return 500 when player creation fails', async () => {
            const registrationData = generatePlayerRegistration();

            // Mock successful email check but failed insert
            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            mockQuery.mockRejectedValueOnce(new Error('Insert failed'));

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({
                success: false,
                message: 'An error occurred during registration',
            });
        });
    });

    describe('CORS Headers', () => {
        it('should include CORS headers in successful response', async () => {
            const registrationData = generatePlayerRegistration();

            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            mockQuery.mockResolvedValueOnce([{ id: 'player-uuid-cors' }]);

            const request = createMockRequest(registrationData);
            const response = await POST(request);

            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
            expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
            expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
        });

        it('should include CORS headers in error response', async () => {
            const registrationData = generatePlayerRegistration({
                email: 'invalid-email',
            });

            const request = createMockRequest(registrationData);
            const response = await POST(request);

            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
            expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
            expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
        });
    });

    describe('Referral Chain Resolution (Requirements 2.1, 2.2, 2.3, 2.6, 3.1, 3.2, 3.3)', () => {
        it('stores null referral columns and standard plan when no promo code is provided', async () => {
            const registrationData = generatePlayerRegistration();
            delete (registrationData as any).referralPromoCode;

            mockResolveReferralChain.mockResolvedValueOnce(null);
            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            mockQuery.mockResolvedValueOnce([{ id: 'player-no-promo' }]);

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);

            const insertArgs = mockQuery.mock.calls[1][1] as unknown[];
            // secondary_referral_promo_code = null
            expect(insertArgs[16]).toBeNull();
            // tertiary_referral_promo_code = null
            expect(insertArgs[17]).toBeNull();
            // subscription_plan = 'standard'
            expect(insertArgs[18]).toBe('standard');
        });

        it('stores tier-2 and tier-3 codes when a full chain is resolved', async () => {
            const registrationData = generatePlayerRegistration({ referralPromoCode: 'TIER1_CODE' });

            mockResolveReferralChain.mockResolvedValueOnce({
                tier1PromoCode: 'TIER1_CODE',
                tier2PromoCode: 'TIER2_CODE',
                tier3PromoCode: 'TIER3_CODE',
            });
            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            mockQuery.mockResolvedValueOnce([{ id: 'player-full-chain' }]);

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);

            const insertArgs = mockQuery.mock.calls[1][1] as unknown[];
            // referral_promo_code (tier 1)
            expect(insertArgs[15]).toBe('TIER1_CODE');
            // secondary_referral_promo_code (tier 2)
            expect(insertArgs[16]).toBe('TIER2_CODE');
            // tertiary_referral_promo_code (tier 3)
            expect(insertArgs[17]).toBe('TIER3_CODE');
            // subscription_plan = 'promo_699' (valid promo code used)
            expect(insertArgs[18]).toBe('promo_699');
        });

        it('stores tier-2 code and null tier-3 when chain has only two hops', async () => {
            const registrationData = generatePlayerRegistration({ referralPromoCode: 'TIER1_CODE' });

            mockResolveReferralChain.mockResolvedValueOnce({
                tier1PromoCode: 'TIER1_CODE',
                tier2PromoCode: 'TIER2_CODE',
                tier3PromoCode: null,
            });
            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            mockQuery.mockResolvedValueOnce([{ id: 'player-two-hop' }]);

            const request = createMockRequest(registrationData);
            const response = await POST(request);

            expect(response.status).toBe(201);

            const insertArgs = mockQuery.mock.calls[1][1] as unknown[];
            expect(insertArgs[16]).toBe('TIER2_CODE');
            expect(insertArgs[17]).toBeNull();
            expect(insertArgs[18]).toBe('promo_699');
        });

        it('stores null tier-2 and tier-3 when promo code owner has no referrer', async () => {
            const registrationData = generatePlayerRegistration({ referralPromoCode: 'ORPHAN_CODE' });

            mockResolveReferralChain.mockResolvedValueOnce({
                tier1PromoCode: 'ORPHAN_CODE',
                tier2PromoCode: null,
                tier3PromoCode: null,
            });
            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            mockQuery.mockResolvedValueOnce([{ id: 'player-orphan' }]);

            const request = createMockRequest(registrationData);
            const response = await POST(request);

            expect(response.status).toBe(201);

            const insertArgs = mockQuery.mock.calls[1][1] as unknown[];
            expect(insertArgs[15]).toBe('ORPHAN_CODE');
            expect(insertArgs[16]).toBeNull();
            expect(insertArgs[17]).toBeNull();
            expect(insertArgs[18]).toBe('promo_699');
        });

        it('still registers successfully when chain resolver returns null (non-blocking)', async () => {
            const registrationData = generatePlayerRegistration({ referralPromoCode: 'SOME_CODE' });

            // Resolver returns null (e.g. lookup failed silently)
            mockResolveReferralChain.mockResolvedValueOnce(null);
            mockQuery.mockResolvedValueOnce([{ exists: false }]);
            mockQuery.mockResolvedValueOnce([{ id: 'player-fallback' }]);

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);

            const insertArgs = mockQuery.mock.calls[1][1] as unknown[];
            expect(insertArgs[16]).toBeNull();
            expect(insertArgs[17]).toBeNull();
            expect(insertArgs[18]).toBe('standard');
        });
    });
});
