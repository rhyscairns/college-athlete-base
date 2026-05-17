/**
 * Player Registration API Route Tests
 * Tests the POST /api/auth/register/player endpoint
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST, OPTIONS } from '@/app/api/auth/register/player/route';
import * as registerValidation from '@/authentication/utils/registerValidation';
import * as players from '@/authentication/db/players';
import * as password from '@/authentication/utils/password';
import {
    generatePlayerRegistration,
    generatePlayerWithAge,
} from '@/__tests__/utils/test-data-generators';

// Mock all dependencies
jest.mock('@/authentication/utils/registerValidation');
jest.mock('@/authentication/db/players');
jest.mock('@/authentication/utils/password');

const mockValidatePlayerRegistration = registerValidation.validatePlayerRegistration as jest.MockedFunction<
    typeof registerValidation.validatePlayerRegistration
>;
const mockCheckEmailExists = players.checkEmailExists as jest.MockedFunction<typeof players.checkEmailExists>;
const mockCreatePlayer = players.createPlayer as jest.MockedFunction<typeof players.createPlayer>;
const mockHashPassword = password.hashPassword as jest.MockedFunction<typeof password.hashPassword>;

describe('Player Registration API Route', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
    });

    afterEach(() => {
        delete process.env.ALLOWED_ORIGINS;
    });

    /**
     * Helper function to create a mock NextRequest
     */
    const createMockRequest = (body: any, origin = 'http://localhost:3000') => {
        return new NextRequest('http://localhost:3000/api/auth/register/player', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'origin': origin,
            },
            body: JSON.stringify(body),
        });
    };

    describe('Successful Registration', () => {
        it('should return 201 with player ID on successful registration', async () => {
            const registrationData = generatePlayerRegistration();

            mockValidatePlayerRegistration.mockReturnValue({ isValid: true, errors: [] });
            mockCheckEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password_123');
            mockCreatePlayer.mockResolvedValue('player-uuid-123');

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toEqual({
                success: true,
                message: 'Player registered successfully',
                playerId: 'player-uuid-123',
            });
        });

        it('should include dateOfBirth in all test payloads', async () => {
            const registrationData = generatePlayerRegistration();

            // Verify dateOfBirth is present in generated data
            expect(registrationData.dateOfBirth).toBeDefined();
            expect(typeof registrationData.dateOfBirth).toBe('string');
            expect(registrationData.dateOfBirth).toMatch(/^\d{4}-\d{2}-\d{2}$/);

            mockValidatePlayerRegistration.mockReturnValue({ isValid: true, errors: [] });
            mockCheckEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password');
            mockCreatePlayer.mockResolvedValue('player-uuid');

            const request = createMockRequest(registrationData);
            await POST(request);

            // Verify validation was called with dateOfBirth
            expect(mockValidatePlayerRegistration).toHaveBeenCalledWith(
                expect.objectContaining({
                    dateOfBirth: registrationData.dateOfBirth,
                })
            );
        });

        it('should call createPlayer with all required fields including dateOfBirth', async () => {
            const registrationData = generatePlayerRegistration({
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '2006-05-15',
                email: 'john.doe@example.com',
                password: 'SecurePass123!',
                gender: 'male',
                sport: 'basketball',
                position: 'Guard',
                gpa: 3.5,
                country: 'USA',
                state: 'California',
            });

            mockValidatePlayerRegistration.mockReturnValue({ isValid: true, errors: [] });
            mockCheckEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password');
            mockCreatePlayer.mockResolvedValue('player-uuid');

            const request = createMockRequest(registrationData);
            await POST(request);

            expect(mockCreatePlayer).toHaveBeenCalledWith({
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '2006-05-15',
                email: 'john.doe@example.com',
                passwordHash: 'hashed_password',
                sex: 'male',
                sport: 'basketball',
                position: 'Guard',
                gpa: 3.5,
                country: 'USA',
                state: 'California',
                region: undefined,
                scholarshipAmount: undefined,
                testScores: undefined,
                referralPromoCode: undefined,
                secondaryReferralPromoCode: null,
                tertiaryReferralPromoCode: null,
                subscriptionPlan: 'standard',
            });
        });

        it('should hash password before creating player', async () => {
            const registrationData = generatePlayerRegistration({
                password: 'MySecurePassword123!',
            });

            mockValidatePlayerRegistration.mockReturnValue({ isValid: true, errors: [] });
            mockCheckEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_MySecurePassword123!');
            mockCreatePlayer.mockResolvedValue('player-uuid');

            const request = createMockRequest(registrationData);
            await POST(request);

            expect(mockHashPassword).toHaveBeenCalledWith('MySecurePassword123!');
            expect(mockCreatePlayer).toHaveBeenCalledWith(
                expect.objectContaining({
                    passwordHash: 'hashed_MySecurePassword123!',
                })
            );
        });

        it('should normalize email to lowercase', async () => {
            const registrationData = generatePlayerRegistration({
                email: 'Test.Player@EXAMPLE.COM',
            });

            mockValidatePlayerRegistration.mockReturnValue({ isValid: true, errors: [] });
            mockCheckEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password');
            mockCreatePlayer.mockResolvedValue('player-uuid');

            const request = createMockRequest(registrationData);
            await POST(request);

            expect(mockCheckEmailExists).toHaveBeenCalledWith('Test.Player@EXAMPLE.COM');
            expect(mockCreatePlayer).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: 'Test.Player@EXAMPLE.COM',
                })
            );
        });

        it('should include CORS headers in successful response', async () => {
            const registrationData = generatePlayerRegistration();

            mockValidatePlayerRegistration.mockReturnValue({ isValid: true, errors: [] });
            mockCheckEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password');
            mockCreatePlayer.mockResolvedValue('player-uuid');

            const request = createMockRequest(registrationData);
            const response = await POST(request);

            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
            expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
            expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
        });
    });

    describe('Validation Errors', () => {
        it('should return 400 for validation errors', async () => {
            const invalidData = generatePlayerRegistration({
                email: 'invalid-email',
            });

            mockValidatePlayerRegistration.mockReturnValue({
                isValid: false,
                errors: [
                    { field: 'email', message: 'Please enter a valid email address' },
                ],
            });

            const request = createMockRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({
                success: false,
                errors: [
                    { field: 'email', message: 'Please enter a valid email address' },
                ],
            });
        });

        it('should return 400 for missing required fields', async () => {
            const invalidData = {
                email: 'test@example.com',
                password: 'Password123!',
            };

            mockValidatePlayerRegistration.mockReturnValue({
                isValid: false,
                errors: [
                    { field: 'firstName', message: 'First name is required' },
                    { field: 'lastName', message: 'Last name is required' },
                    { field: 'dateOfBirth', message: 'Date of birth is required' },
                    { field: 'sex', message: 'Sex is required' },
                    { field: 'sport', message: 'Sport is required' },
                    { field: 'position', message: 'Position is required' },
                    { field: 'gpa', message: 'GPA is required' },
                    { field: 'country', message: 'Country is required' },
                ],
            });

            const request = createMockRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toHaveLength(8);
            expect(data.errors).toContainEqual({
                field: 'dateOfBirth',
                message: 'Date of birth is required',
            });
        });

        it('should return 400 for missing dateOfBirth', async () => {
            const invalidData = generatePlayerRegistration();
            delete (invalidData as any).dateOfBirth;

            mockValidatePlayerRegistration.mockReturnValue({
                isValid: false,
                errors: [
                    { field: 'dateOfBirth', message: 'Date of birth is required' },
                ],
            });

            const request = createMockRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'dateOfBirth',
                message: 'Date of birth is required',
            });
        });

        it('should return 400 for invalid dateOfBirth format', async () => {
            const invalidData = generatePlayerRegistration({
                dateOfBirth: 'invalid-date',
            });

            mockValidatePlayerRegistration.mockReturnValue({
                isValid: false,
                errors: [
                    { field: 'dateOfBirth', message: 'Invalid date format' },
                ],
            });

            const request = createMockRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'dateOfBirth',
                message: 'Invalid date format',
            });
        });

        it('should return 400 for player under 13 years old', async () => {
            const invalidData = generatePlayerWithAge(12);

            mockValidatePlayerRegistration.mockReturnValue({
                isValid: false,
                errors: [
                    { field: 'dateOfBirth', message: 'You must be at least 13 years old to register' },
                ],
            });

            const request = createMockRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'dateOfBirth',
                message: 'You must be at least 13 years old to register',
            });
        });

        it('should return 400 for future dateOfBirth', async () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            const futureDateString = futureDate.toISOString().split('T')[0];

            const invalidData = generatePlayerRegistration({
                dateOfBirth: futureDateString,
            });

            mockValidatePlayerRegistration.mockReturnValue({
                isValid: false,
                errors: [
                    { field: 'dateOfBirth', message: 'Date of birth cannot be in the future' },
                ],
            });

            const request = createMockRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'dateOfBirth',
                message: 'Date of birth cannot be in the future',
            });
        });

        it('should return 400 for invalid email format', async () => {
            const invalidData = generatePlayerRegistration({
                email: 'not-an-email',
            });

            mockValidatePlayerRegistration.mockReturnValue({
                isValid: false,
                errors: [
                    { field: 'email', message: 'Please enter a valid email address' },
                ],
            });

            const request = createMockRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'email',
                message: 'Please enter a valid email address',
            });
        });

        it('should return 400 for weak password', async () => {
            const invalidData = generatePlayerRegistration({
                password: 'weak',
            });

            mockValidatePlayerRegistration.mockReturnValue({
                isValid: false,
                errors: [
                    { field: 'password', message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character' },
                ],
            });

            const request = createMockRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'password',
                message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
            });
        });

        it('should return 400 for invalid GPA', async () => {
            const invalidData = generatePlayerRegistration({
                gpa: 5.0,
            });

            mockValidatePlayerRegistration.mockReturnValue({
                isValid: false,
                errors: [
                    { field: 'gpa', message: 'GPA must be between 0.0 and 4.0' },
                ],
            });

            const request = createMockRequest(invalidData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.errors).toContainEqual({
                field: 'gpa',
                message: 'GPA must be between 0.0 and 4.0',
            });
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
        });

        it('should not call database when validation fails', async () => {
            const invalidData = generatePlayerRegistration({
                email: 'invalid-email',
            });

            mockValidatePlayerRegistration.mockReturnValue({
                isValid: false,
                errors: [
                    { field: 'email', message: 'Please enter a valid email address' },
                ],
            });

            const request = createMockRequest(invalidData);
            await POST(request);

            expect(mockCheckEmailExists).not.toHaveBeenCalled();
            expect(mockHashPassword).not.toHaveBeenCalled();
            expect(mockCreatePlayer).not.toHaveBeenCalled();
        });
    });

    describe('Duplicate Email Handling', () => {
        it('should return 400 for duplicate email', async () => {
            const registrationData = generatePlayerRegistration({
                email: 'existing@example.com',
            });

            mockValidatePlayerRegistration.mockReturnValue({ isValid: true, errors: [] });
            mockCheckEmailExists.mockResolvedValue(true);

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(409);
            expect(data).toEqual({
                success: false,
                message: 'Email already registered',
            });
        });

        it('should check email existence before creating player', async () => {
            const registrationData = generatePlayerRegistration();

            mockValidatePlayerRegistration.mockReturnValue({ isValid: true, errors: [] });
            mockCheckEmailExists.mockResolvedValue(true);

            const request = createMockRequest(registrationData);
            await POST(request);

            expect(mockCheckEmailExists).toHaveBeenCalledWith(registrationData.email);
            expect(mockHashPassword).not.toHaveBeenCalled();
            expect(mockCreatePlayer).not.toHaveBeenCalled();
        });

        it('should handle duplicate email case-insensitively', async () => {
            const registrationData = generatePlayerRegistration({
                email: 'DUPLICATE@EXAMPLE.COM',
            });

            mockValidatePlayerRegistration.mockReturnValue({ isValid: true, errors: [] });
            mockCheckEmailExists.mockResolvedValue(true);

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(409);
            expect(data.message).toBe('Email already registered');
            expect(mockCheckEmailExists).toHaveBeenCalledWith('DUPLICATE@EXAMPLE.COM');
        });
    });

    describe('Database Errors', () => {
        it('should return 500 when email check fails', async () => {
            const registrationData = generatePlayerRegistration();

            mockValidatePlayerRegistration.mockReturnValue({ isValid: true, errors: [] });
            mockCheckEmailExists.mockRejectedValue(new Error('Database connection failed'));

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({
                success: false,
                message: 'An error occurred during registration',
            });
        });

        it('should return 500 when password hashing fails', async () => {
            const registrationData = generatePlayerRegistration();

            mockValidatePlayerRegistration.mockReturnValue({ isValid: true, errors: [] });
            mockCheckEmailExists.mockResolvedValue(false);
            mockHashPassword.mockRejectedValue(new Error('Hashing failed'));

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

            mockValidatePlayerRegistration.mockReturnValue({ isValid: true, errors: [] });
            mockCheckEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password');
            mockCreatePlayer.mockRejectedValue(new Error('Insert failed'));

            const request = createMockRequest(registrationData);
            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({
                success: false,
                message: 'An error occurred during registration',
            });
        });

        it('should include CORS headers in error responses', async () => {
            const registrationData = generatePlayerRegistration();

            mockValidatePlayerRegistration.mockReturnValue({ isValid: true, errors: [] });
            mockCheckEmailExists.mockRejectedValue(new Error('Database error'));

            const request = createMockRequest(registrationData);
            const response = await POST(request);

            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
            expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
            expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
        });
    });

    describe('CORS Handling', () => {
        it('should handle OPTIONS request for CORS preflight', async () => {
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

        it('should include CORS headers for allowed origin', async () => {
            const registrationData = generatePlayerRegistration();

            mockValidatePlayerRegistration.mockReturnValue({ isValid: true, errors: [] });
            mockCheckEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password');
            mockCreatePlayer.mockResolvedValue('player-uuid');

            const request = createMockRequest(registrationData, 'http://localhost:3000');
            const response = await POST(request);

            expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
        });

        it('should handle requests without origin header', async () => {
            const registrationData = generatePlayerRegistration();

            mockValidatePlayerRegistration.mockReturnValue({ isValid: true, errors: [] });
            mockCheckEmailExists.mockResolvedValue(false);
            mockHashPassword.mockResolvedValue('hashed_password');
            mockCreatePlayer.mockResolvedValue('player-uuid');

            const request = new NextRequest('http://localhost:3000/api/auth/register/player', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationData),
            });

            const response = await POST(request);

            expect(response.status).toBe(201);
            expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy();
        });
    });

    describe('Complete Registration Flow', () => {
        it('should execute complete registration flow in correct order', async () => {
            const registrationData = generatePlayerRegistration();
            const callOrder: string[] = [];

            mockValidatePlayerRegistration.mockImplementation((data) => {
                callOrder.push('validate');
                return { isValid: true, errors: [] };
            });

            mockCheckEmailExists.mockImplementation(async (email) => {
                callOrder.push('checkEmail');
                return false;
            });

            mockHashPassword.mockImplementation(async (password) => {
                callOrder.push('hashPassword');
                return 'hashed_password';
            });

            mockCreatePlayer.mockImplementation(async (data) => {
                callOrder.push('createPlayer');
                return 'player-uuid';
            });

            const request = createMockRequest(registrationData);
            const response = await POST(request);

            expect(response.status).toBe(201);
            expect(callOrder).toEqual(['validate', 'checkEmail', 'hashPassword', 'createPlayer']);
        });

        it('should stop execution after validation failure', async () => {
            const invalidData = generatePlayerRegistration({
                email: 'invalid-email',
            });

            mockValidatePlayerRegistration.mockReturnValue({
                isValid: false,
                errors: [{ field: 'email', message: 'Invalid email' }],
            });

            const request = createMockRequest(invalidData);
            await POST(request);

            expect(mockValidatePlayerRegistration).toHaveBeenCalled();
            expect(mockCheckEmailExists).not.toHaveBeenCalled();
            expect(mockHashPassword).not.toHaveBeenCalled();
            expect(mockCreatePlayer).not.toHaveBeenCalled();
        });

        it('should stop execution after duplicate email check', async () => {
            const registrationData = generatePlayerRegistration();

            mockValidatePlayerRegistration.mockReturnValue({ isValid: true, errors: [] });
            mockCheckEmailExists.mockResolvedValue(true);

            const request = createMockRequest(registrationData);
            await POST(request);

            expect(mockValidatePlayerRegistration).toHaveBeenCalled();
            expect(mockCheckEmailExists).toHaveBeenCalled();
            expect(mockHashPassword).not.toHaveBeenCalled();
            expect(mockCreatePlayer).not.toHaveBeenCalled();
        });
    });
});
