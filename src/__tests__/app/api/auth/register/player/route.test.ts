/**
 * @jest-environment node
 */
import { POST, OPTIONS } from '@/app/api/auth/register/player/route';
import { NextRequest } from 'next/server';
import * as playersDb from '@/authentication/db/players';
import * as passwordUtils from '@/authentication/utils/password';

// Mock the database operations
jest.mock('@/authentication/db/players');
jest.mock('@/authentication/utils/password');

describe('/api/auth/register/player', () => {
    const mockCheckEmailExists = playersDb.checkEmailExists as jest.MockedFunction<typeof playersDb.checkEmailExists>;
    const mockCreatePlayer = playersDb.createPlayer as jest.MockedFunction<typeof playersDb.createPlayer>;
    const mockHashPassword = passwordUtils.hashPassword as jest.MockedFunction<typeof passwordUtils.hashPassword>;

    beforeEach(() => {
        jest.clearAllMocks();
        // Set default environment variable for CORS
        process.env.ALLOWED_ORIGINS = 'http://localhost:3000,https://dev.example.com';
    });

    afterEach(() => {
        delete process.env.ALLOWED_ORIGINS;
    });

    const createRequest = (body: unknown, origin?: string) => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (origin) {
            headers['origin'] = origin;
        }

        return new NextRequest('http://localhost:3000/api/auth/register/player', {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
    };

    const validPlayerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        sex: 'male',
        sport: 'basketball',
        position: 'Guard',
        gpa: 3.5,
        country: 'USA',
        state: 'California',
    };

    describe('POST - Successful Registration', () => {
        it('registers a player successfully with all required fields', async () => {
            mockCheckEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password_123');
            mockCreatePlayer.mockResolvedValue('player-uuid-123');

            const request = createRequest(validPlayerData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toEqual({
                success: true,
                message: 'Player registered successfully',
                playerId: 'player-uuid-123',
            });

            expect(mockCheckEmailExists).toHaveBeenCalledWith('john.doe@example.com');
            expect(mockHashPassword).toHaveBeenCalledWith('Password123!');
            expect(mockCreatePlayer).toHaveBeenCalledWith({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                passwordHash: 'hashed_password_123',
                sex: 'male',
                sport: 'basketball',
                position: 'Guard',
                gpa: 3.5,
                country: 'USA',
                state: 'California',
                region: undefined,
                scholarshipAmount: undefined,
                testScores: undefined,
            });
        });

        it('registers a player with optional fields', async () => {
            mockCheckEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password_123');
            mockCreatePlayer.mockResolvedValue('player-uuid-456');

            const playerWithOptionalFields = {
                ...validPlayerData,
                scholarshipAmount: 50000,
                testScores: 'SAT: 1400, ACT: 32',
            };

            const request = createRequest(playerWithOptionalFields);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.playerId).toBe('player-uuid-456');

            expect(mockCreatePlayer).toHaveBeenCalledWith(
                expect.objectContaining({
                    scholarshipAmount: 50000,
                    testScores: 'SAT: 1400, ACT: 32',
                })
            );
        });

        it('registers a player from non-USA country with region', async () => {
            mockCheckEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password_123');
            mockCreatePlayer.mockResolvedValue('player-uuid-789');

            const internationalPlayer = {
                ...validPlayerData,
                country: 'Canada',
                state: undefined,
                region: 'Ontario',
            };

            const request = createRequest(internationalPlayer);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(mockCreatePlayer).toHaveBeenCalledWith(
                expect.objectContaining({
                    country: 'Canada',
                    state: undefined,
                    region: 'Ontario',
                })
            );
        });
    });

    describe('POST - Validation Errors', () => {
        it('returns 400 for missing firstName', async () => {
            const invalidData = { ...validPlayerData, firstName: '' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'firstName',
                message: 'First name is required',
            });
        });

        it('returns 400 for firstName too short', async () => {
            const invalidData = { ...validPlayerData, firstName: 'J' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'firstName',
                message: 'First name must be between 2 and 50 characters',
            });
        });

        it('returns 400 for missing lastName', async () => {
            const invalidData = { ...validPlayerData, lastName: '' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'lastName',
                message: 'Last name is required',
            });
        });

        it('returns 400 for missing email', async () => {
            const invalidData = { ...validPlayerData, email: '' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'email',
                message: 'Email is required',
            });
        });

        it('returns 400 for invalid email format', async () => {
            const invalidData = { ...validPlayerData, email: 'invalid-email' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'email',
                message: 'Please enter a valid email address',
            });
        });

        it('returns 400 for missing password', async () => {
            const invalidData = { ...validPlayerData, password: '' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'password',
                message: 'Password is required',
            });
        });

        it('returns 400 for weak password', async () => {
            const invalidData = { ...validPlayerData, password: 'weak' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'password',
                message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
            });
        });

        it('returns 400 for missing sex', async () => {
            const invalidData = { ...validPlayerData, sex: '' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'sex',
                message: 'Sex is required',
            });
        });

        it('returns 400 for invalid sex value', async () => {
            const invalidData = { ...validPlayerData, sex: 'other' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'sex',
                message: 'Sex must be either "male" or "female"',
            });
        });

        it('returns 400 for missing sport', async () => {
            const invalidData = { ...validPlayerData, sport: '' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'sport',
                message: 'Sport is required',
            });
        });

        it('returns 400 for missing position', async () => {
            const invalidData = { ...validPlayerData, position: '' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'position',
                message: 'Position is required',
            });
        });

        it('returns 400 for position too short', async () => {
            const invalidData = { ...validPlayerData, position: 'G' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'position',
                message: 'Position must be at least 2 characters',
            });
        });

        it('returns 400 for missing GPA', async () => {
            const invalidData = { ...validPlayerData };
            delete (invalidData as any).gpa;
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'gpa',
                message: 'GPA is required',
            });
        });

        it('returns 400 for GPA below 0.0', async () => {
            const invalidData = { ...validPlayerData, gpa: -0.5 };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'gpa',
                message: 'GPA must be between 0.0 and 4.0',
            });
        });

        it('returns 400 for GPA above 4.0', async () => {
            const invalidData = { ...validPlayerData, gpa: 4.5 };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'gpa',
                message: 'GPA must be between 0.0 and 4.0',
            });
        });

        it('returns 400 for missing country', async () => {
            const invalidData = { ...validPlayerData, country: '' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'country',
                message: 'Country is required',
            });
        });

        it('returns 400 for missing state when country is USA', async () => {
            const invalidData = { ...validPlayerData, state: '' };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'state',
                message: 'State is required when country is USA',
            });
        });

        it('returns 400 for missing region when country is not USA', async () => {
            const invalidData = {
                ...validPlayerData,
                country: 'Canada',
                state: undefined,
                region: '',
            };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'region',
                message: 'Region is required when country is not USA',
            });
        });

        it('returns 400 for invalid scholarship amount', async () => {
            const invalidData = { ...validPlayerData, scholarshipAmount: -1000 };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'scholarshipAmount',
                message: 'Scholarship amount must be a positive number',
            });
        });

        it('returns 400 for multiple validation errors', async () => {
            const invalidData = {
                firstName: '',
                lastName: 'D',
                email: 'invalid',
                password: '123',
                sex: '',
                sport: '',
                position: '',
                gpa: 5.0,
                country: '',
            };
            const request = createRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors.length).toBeGreaterThan(5);
        });

        it('returns 400 for invalid JSON in request body', async () => {
            const request = new NextRequest('http://localhost:3000/api/auth/register/player', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: 'invalid json',
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.message).toBe('Invalid JSON in request body');
        });
    });

    describe('POST - Duplicate Email Handling', () => {
        it('returns 409 when email already exists', async () => {
            mockCheckEmailExists.mockResolvedValue(true);

            const request = createRequest(validPlayerData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(409);
            expect(data).toEqual({
                success: false,
                message: 'Email already registered',
            });

            expect(mockCheckEmailExists).toHaveBeenCalledWith('john.doe@example.com');
            expect(mockHashPassword).not.toHaveBeenCalled();
            expect(mockCreatePlayer).not.toHaveBeenCalled();
        });

        it('checks email existence case-insensitively', async () => {
            mockCheckEmailExists.mockResolvedValue(true);

            const dataWithUppercaseEmail = {
                ...validPlayerData,
                email: 'JOHN.DOE@EXAMPLE.COM',
            };

            const request = createRequest(dataWithUppercaseEmail);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(409);
            expect(data.message).toBe('Email already registered');
            expect(mockCheckEmailExists).toHaveBeenCalledWith('JOHN.DOE@EXAMPLE.COM');
        });
    });

    describe('POST - Database Connection Errors', () => {
        it('returns 500 when checkEmailExists fails', async () => {
            mockCheckEmailExists.mockRejectedValue(new Error('Database connection failed'));

            const request = createRequest(validPlayerData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({
                success: false,
                message: 'An error occurred during registration',
            });

            expect(mockHashPassword).not.toHaveBeenCalled();
            expect(mockCreatePlayer).not.toHaveBeenCalled();
        });

        it('returns 500 when createPlayer fails', async () => {
            mockCheckEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password_123');
            mockCreatePlayer.mockRejectedValue(new Error('Database insert failed'));

            const request = createRequest(validPlayerData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({
                success: false,
                message: 'An error occurred during registration',
            });

            expect(mockCheckEmailExists).toHaveBeenCalled();
            expect(mockHashPassword).toHaveBeenCalled();
            expect(mockCreatePlayer).toHaveBeenCalled();
        });

        it('returns 500 when password hashing fails', async () => {
            mockCheckEmailExists.mockResolvedValue(false);
            mockHashPassword.mockRejectedValue(new Error('Hashing failed'));

            const request = createRequest(validPlayerData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({
                success: false,
                message: 'An error occurred during registration',
            });

            expect(mockCheckEmailExists).toHaveBeenCalled();
            expect(mockHashPassword).toHaveBeenCalled();
            expect(mockCreatePlayer).not.toHaveBeenCalled();
        });

        it('handles unexpected errors gracefully', async () => {
            mockCheckEmailExists.mockImplementation(() => {
                throw new Error('Unexpected error');
            });

            const request = createRequest(validPlayerData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({
                success: false,
                message: 'An error occurred during registration',
            });
        });
    });

    describe('POST - CORS Headers', () => {
        it('includes CORS headers in successful response', async () => {
            mockCheckEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password_123');
            mockCreatePlayer.mockResolvedValue('player-uuid-123');

            const request = createRequest(validPlayerData, 'http://localhost:3000');
            const response = await POST(request);

            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
            expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
            expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
        });

        it('includes CORS headers in error response', async () => {
            const invalidData = { ...validPlayerData, email: '' };
            const request = createRequest(invalidData, 'http://localhost:3000');
            const response = await POST(request);

            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
            expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
            expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
        });

        it('returns allowed origin when origin matches', async () => {
            mockCheckEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password_123');
            mockCreatePlayer.mockResolvedValue('player-uuid-123');

            const request = createRequest(validPlayerData, 'https://dev.example.com');
            const response = await POST(request);

            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://dev.example.com');
        });

        it('returns first allowed origin when origin does not match', async () => {
            mockCheckEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password_123');
            mockCreatePlayer.mockResolvedValue('player-uuid-123');

            const request = createRequest(validPlayerData, 'https://malicious.com');
            const response = await POST(request);

            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
        });

        it('returns wildcard when no allowed origins configured', async () => {
            delete process.env.ALLOWED_ORIGINS;

            mockCheckEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password_123');
            mockCreatePlayer.mockResolvedValue('player-uuid-123');

            const request = createRequest(validPlayerData);
            const response = await POST(request);

            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
        });
    });

    describe('OPTIONS - CORS Preflight', () => {
        it('handles OPTIONS request for CORS preflight', async () => {
            const request = new NextRequest('http://localhost:3000/api/auth/register/player', {
                method: 'OPTIONS',
                headers: {
                    'origin': 'http://localhost:3000',
                },
            });

            const response = await OPTIONS(request);

            expect(response.status).toBe(200);
            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
            expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
            expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
        });

        it('returns empty body for OPTIONS request', async () => {
            const request = new NextRequest('http://localhost:3000/api/auth/register/player', {
                method: 'OPTIONS',
                headers: {
                    'origin': 'http://localhost:3000',
                },
            });

            const response = await OPTIONS(request);
            const text = await response.text();

            expect(text).toBe('');
        });

        it('handles OPTIONS with allowed origin', async () => {
            const request = new NextRequest('http://localhost:3000/api/auth/register/player', {
                method: 'OPTIONS',
                headers: {
                    'origin': 'https://dev.example.com',
                },
            });

            const response = await OPTIONS(request);

            expect(response.status).toBe(200);
            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://dev.example.com');
        });

        it('handles OPTIONS with disallowed origin', async () => {
            const request = new NextRequest('http://localhost:3000/api/auth/register/player', {
                method: 'OPTIONS',
                headers: {
                    'origin': 'https://malicious.com',
                },
            });

            const response = await OPTIONS(request);

            expect(response.status).toBe(200);
            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
        });
    });
});
