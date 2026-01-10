import { NextRequest } from 'next/server';
import { validateSession, getTokenFromCookie } from '@/authentication/middleware/session';
import { verifyToken } from '@/authentication/utils/jwt';
import { TokenPayload } from '@/authentication/types';

// Mock the JWT utilities
jest.mock('@/authentication/utils/jwt');

const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;

describe('Session Middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getTokenFromCookie', () => {
        it('should extract token from session cookie', () => {
            const mockRequest = {
                cookies: {
                    get: jest.fn().mockReturnValue({ value: 'test-token-123' })
                }
            } as unknown as NextRequest;

            const token = getTokenFromCookie(mockRequest);

            expect(token).toBe('test-token-123');
            expect(mockRequest.cookies.get).toHaveBeenCalledWith('session');
        });

        it('should return null when session cookie is not present', () => {
            const mockRequest = {
                cookies: {
                    get: jest.fn().mockReturnValue(undefined)
                }
            } as unknown as NextRequest;

            const token = getTokenFromCookie(mockRequest);

            expect(token).toBeNull();
        });

        it('should return null when session cookie has no value', () => {
            const mockRequest = {
                cookies: {
                    get: jest.fn().mockReturnValue({ value: '' })
                }
            } as unknown as NextRequest;

            const token = getTokenFromCookie(mockRequest);

            expect(token).toBeNull();
        });

        it('should return null and log error when cookie extraction fails', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            const mockRequest = {
                cookies: {
                    get: jest.fn().mockImplementation(() => {
                        throw new Error('Cookie error');
                    })
                }
            } as unknown as NextRequest;

            const token = getTokenFromCookie(mockRequest);

            expect(token).toBeNull();
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error extracting token from cookie:',
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
        });
    });

    describe('validateSession', () => {
        it('should return valid session for valid token', async () => {
            const mockPayload: TokenPayload = {
                playerId: 'player-123',
                email: 'player@example.com',
                type: 'player',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600
            };

            const mockRequest = {
                cookies: {
                    get: jest.fn().mockReturnValue({ value: 'valid-token' })
                }
            } as unknown as NextRequest;

            mockVerifyToken.mockResolvedValue(mockPayload);

            const result = await validateSession(mockRequest);

            expect(result).toEqual({
                isValid: true,
                playerId: 'player-123',
                email: 'player@example.com',
                type: 'player'
            });
            expect(mockVerifyToken).toHaveBeenCalledWith('valid-token');
        });

        it('should return invalid session when no token is present', async () => {
            const mockRequest = {
                cookies: {
                    get: jest.fn().mockReturnValue(undefined)
                }
            } as unknown as NextRequest;

            const result = await validateSession(mockRequest);

            expect(result).toEqual({
                isValid: false,
                error: 'No session token found'
            });
            expect(mockVerifyToken).not.toHaveBeenCalled();
        });

        it('should return invalid session for expired token', async () => {
            const mockRequest = {
                cookies: {
                    get: jest.fn().mockReturnValue({ value: 'expired-token' })
                }
            } as unknown as NextRequest;

            mockVerifyToken.mockResolvedValue(null);

            const result = await validateSession(mockRequest);

            expect(result).toEqual({
                isValid: false,
                error: 'Invalid or expired token'
            });
            expect(mockVerifyToken).toHaveBeenCalledWith('expired-token');
        });

        it('should return invalid session for invalid token', async () => {
            const mockRequest = {
                cookies: {
                    get: jest.fn().mockReturnValue({ value: 'invalid-token' })
                }
            } as unknown as NextRequest;

            mockVerifyToken.mockResolvedValue(null);

            const result = await validateSession(mockRequest);

            expect(result).toEqual({
                isValid: false,
                error: 'Invalid or expired token'
            });
        });

        it('should handle coach type tokens', async () => {
            const mockPayload: TokenPayload = {
                playerId: 'coach-456',
                email: 'coach@university.edu',
                type: 'coach',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 3600
            };

            const mockRequest = {
                cookies: {
                    get: jest.fn().mockReturnValue({ value: 'coach-token' })
                }
            } as unknown as NextRequest;

            mockVerifyToken.mockResolvedValue(mockPayload);

            const result = await validateSession(mockRequest);

            expect(result).toEqual({
                isValid: true,
                playerId: 'coach-456',
                email: 'coach@university.edu',
                type: 'coach'
            });
        });

        it('should handle verification errors gracefully', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            const mockRequest = {
                cookies: {
                    get: jest.fn().mockReturnValue({ value: 'error-token' })
                }
            } as unknown as NextRequest;

            mockVerifyToken.mockRejectedValue(new Error('Verification failed'));

            const result = await validateSession(mockRequest);

            expect(result).toEqual({
                isValid: false,
                error: 'Session validation failed'
            });
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Session validation error:',
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
        });

        it('should handle empty token value', async () => {
            const mockRequest = {
                cookies: {
                    get: jest.fn().mockReturnValue({ value: '' })
                }
            } as unknown as NextRequest;

            const result = await validateSession(mockRequest);

            expect(result).toEqual({
                isValid: false,
                error: 'No session token found'
            });
            expect(mockVerifyToken).not.toHaveBeenCalled();
        });

        it('should not expose sensitive error details to client', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            const mockRequest = {
                cookies: {
                    get: jest.fn().mockReturnValue({ value: 'token' })
                }
            } as unknown as NextRequest;

            mockVerifyToken.mockRejectedValue(new Error('Database connection failed'));

            const result = await validateSession(mockRequest);

            expect(result.error).toBe('Session validation failed');
            expect(result.error).not.toContain('Database');

            consoleErrorSpy.mockRestore();
        });
    });

    describe('Integration scenarios', () => {
        it('should validate complete session flow', async () => {
            const mockPayload: TokenPayload = {
                playerId: 'player-789',
                email: 'test@example.com',
                type: 'player',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600 // 7 days
            };

            const mockRequest = {
                cookies: {
                    get: jest.fn().mockReturnValue({ value: 'session-token-xyz' })
                }
            } as unknown as NextRequest;

            mockVerifyToken.mockResolvedValue(mockPayload);

            // First, extract token
            const token = getTokenFromCookie(mockRequest);
            expect(token).toBe('session-token-xyz');

            // Then validate session
            const result = await validateSession(mockRequest);
            expect(result.isValid).toBe(true);
            expect(result.playerId).toBe('player-789');
            expect(result.email).toBe('test@example.com');
            expect(result.type).toBe('player');
        });

        it('should handle missing session gracefully', async () => {
            const mockRequest = {
                cookies: {
                    get: jest.fn().mockReturnValue(undefined)
                }
            } as unknown as NextRequest;

            const token = getTokenFromCookie(mockRequest);
            expect(token).toBeNull();

            const result = await validateSession(mockRequest);
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('No session token found');
        });
    });
});
