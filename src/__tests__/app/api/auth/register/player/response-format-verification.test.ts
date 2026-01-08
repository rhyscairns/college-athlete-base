/**
 * Verification test for Task 9: API Response Formatting
 * This test verifies all response format requirements (8.1-8.6)
 * @jest-environment node
 */

import { POST, OPTIONS } from '@/app/api/auth/register/player/route';
import { NextRequest } from 'next/server';
import * as registerValidation from '@/authentication/utils/registerValidation';
import * as players from '@/authentication/db/players';
import * as password from '@/authentication/utils/password';

jest.mock('@/authentication/utils/registerValidation');
jest.mock('@/authentication/db/players');
jest.mock('@/authentication/utils/password');

const mockValidatePlayerRegistration = registerValidation.validatePlayerRegistration as jest.MockedFunction<
    typeof registerValidation.validatePlayerRegistration
>;
const mockCheckEmailExists = players.checkEmailExists as jest.MockedFunction<typeof players.checkEmailExists>;
const mockCreatePlayer = players.createPlayer as jest.MockedFunction<typeof players.createPlayer>;
const mockHashPassword = password.hashPassword as jest.MockedFunction<typeof password.hashPassword>;

describe('Task 9: API Response Formatting Verification', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
    });

    describe('Requirement 8.1: Success Response Format', () => {
        it('should return success response with player ID and status 201', async () => {
            const validData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: 'Password123!',
                sex: 'male',
                sport: 'basketball',
                position: 'Guard',
                gpa: 3.5,
                country: 'USA',
                state: 'California',
            };

            mockValidatePlayerRegistration.mockReturnValue({ isValid: true, errors: [] });
            mockCheckEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password');
            mockCreatePlayer.mockResolvedValue('test-uuid-123');

            const request = new NextRequest('http://localhost:3000/api/auth/register/player', {
                method: 'POST',
                body: JSON.stringify(validData),
                headers: { 'Content-Type': 'application/json', origin: 'http://localhost:3000' },
            });

            const response = await POST(request);
            const data = await response.json();

            // Verify response format matches requirement 8.1
            expect(response.status).toBe(201);
            expect(data).toEqual({
                success: true,
                message: 'Player registered successfully',
                playerId: 'test-uuid-123',
            });
        });
    });

    describe('Requirement 8.2: Validation Error Response Format', () => {
        it('should return validation errors with field details and status 400', async () => {
            const invalidData = {
                firstName: 'J',
                email: 'invalid-email',
            };

            mockValidatePlayerRegistration.mockReturnValue({
                isValid: false,
                errors: [
                    { field: 'firstName', message: 'First name must be at least 2 characters' },
                    { field: 'email', message: 'Invalid email format' },
                    { field: 'lastName', message: 'Last name is required' },
                ],
            });

            const request = new NextRequest('http://localhost:3000/api/auth/register/player', {
                method: 'POST',
                body: JSON.stringify(invalidData),
                headers: { 'Content-Type': 'application/json', origin: 'http://localhost:3000' },
            });

            const response = await POST(request);
            const data = await response.json();

            // Verify response format matches requirement 8.2
            expect(response.status).toBe(400);
            expect(data).toEqual({
                success: false,
                errors: [
                    { field: 'firstName', message: 'First name must be at least 2 characters' },
                    { field: 'email', message: 'Invalid email format' },
                    { field: 'lastName', message: 'Last name is required' },
                ],
            });
        });
    });

    describe('Requirement 8.3: General Error Response Format', () => {
        it('should return general error message with status 500', async () => {
            const validData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: 'Password123!',
                sex: 'male',
                sport: 'basketball',
                position: 'Guard',
                gpa: 3.5,
                country: 'USA',
                state: 'California',
            };

            mockValidatePlayerRegistration.mockReturnValue({ isValid: true, errors: [] });
            mockCheckEmailExists.mockRejectedValue(new Error('Database connection failed'));

            const request = new NextRequest('http://localhost:3000/api/auth/register/player', {
                method: 'POST',
                body: JSON.stringify(validData),
                headers: { 'Content-Type': 'application/json', origin: 'http://localhost:3000' },
            });

            const response = await POST(request);
            const data = await response.json();

            // Verify response format matches requirement 8.3
            expect(response.status).toBe(500);
            expect(data).toEqual({
                success: false,
                message: 'An error occurred during registration',
            });
        });
    });

    describe('Requirement 8.4: Content-Type Header', () => {
        it('should include application/json Content-Type header', async () => {
            mockValidatePlayerRegistration.mockReturnValue({ isValid: true, errors: [] });
            mockCheckEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password');
            mockCreatePlayer.mockResolvedValue('test-uuid-123');

            const request = new NextRequest('http://localhost:3000/api/auth/register/player', {
                method: 'POST',
                body: JSON.stringify({ firstName: 'John', lastName: 'Doe', email: 'john@example.com' }),
                headers: { 'Content-Type': 'application/json', origin: 'http://localhost:3000' },
            });

            const response = await POST(request);

            // Verify Content-Type header matches requirement 8.4
            expect(response.headers.get('Content-Type')).toContain('application/json');
        });
    });

    describe('Requirement 8.5: CORS Headers', () => {
        it('should include CORS headers in all responses', async () => {
            mockValidatePlayerRegistration.mockReturnValue({ isValid: true, errors: [] });
            mockCheckEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password');
            mockCreatePlayer.mockResolvedValue('test-uuid-123');

            const request = new NextRequest('http://localhost:3000/api/auth/register/player', {
                method: 'POST',
                body: JSON.stringify({ firstName: 'John', lastName: 'Doe', email: 'john@example.com' }),
                headers: { 'Content-Type': 'application/json', origin: 'http://localhost:3000' },
            });

            const response = await POST(request);

            // Verify CORS headers match requirement 8.5
            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
            expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
            expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
        });

        it('should include CORS headers in OPTIONS response', async () => {
            const request = new NextRequest('http://localhost:3000/api/auth/register/player', {
                method: 'OPTIONS',
                headers: { origin: 'http://localhost:3000' },
            });

            const response = await OPTIONS(request);

            // Verify CORS headers in OPTIONS response
            expect(response.status).toBe(200);
            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
            expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
            expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
        });
    });

    describe('Requirement 8.6: Duplicate Email Response Format', () => {
        it('should return specific message for duplicate email with status 409', async () => {
            const validData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'existing@example.com',
                password: 'Password123!',
                sex: 'male',
                sport: 'basketball',
                position: 'Guard',
                gpa: 3.5,
                country: 'USA',
                state: 'California',
            };

            mockValidatePlayerRegistration.mockReturnValue({ isValid: true, errors: [] });
            mockCheckEmailExists.mockResolvedValue(true);

            const request = new NextRequest('http://localhost:3000/api/auth/register/player', {
                method: 'POST',
                body: JSON.stringify(validData),
                headers: { 'Content-Type': 'application/json', origin: 'http://localhost:3000' },
            });

            const response = await POST(request);
            const data = await response.json();

            // Verify response format matches requirement 8.6
            expect(response.status).toBe(409);
            expect(data).toEqual({
                success: false,
                message: 'Email already registered',
            });
        });
    });

    describe('Additional Response Format Verification', () => {
        it('should return 400 for invalid JSON with consistent format', async () => {
            const request = new NextRequest('http://localhost:3000/api/auth/register/player', {
                method: 'POST',
                body: 'invalid json{',
                headers: { 'Content-Type': 'application/json', origin: 'http://localhost:3000' },
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({
                success: false,
                message: 'Invalid JSON in request body',
            });
        });

        it('should include CORS headers even in error responses', async () => {
            mockValidatePlayerRegistration.mockReturnValue({
                isValid: false,
                errors: [{ field: 'email', message: 'Email is required' }],
            });

            const request = new NextRequest('http://localhost:3000/api/auth/register/player', {
                method: 'POST',
                body: JSON.stringify({}),
                headers: { 'Content-Type': 'application/json', origin: 'http://localhost:3000' },
            });

            const response = await POST(request);

            // Verify CORS headers are present even in error responses
            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
            expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
            expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
        });
    });
});
