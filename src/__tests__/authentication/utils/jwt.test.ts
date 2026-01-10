import { generateToken, verifyToken, getTokenExpiration } from '@/authentication/utils/jwt';
import { TokenPayload } from '@/authentication/types';
import jwt from 'jsonwebtoken';

describe('JWT Utilities', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
        process.env.JWT_SECRET = 'test-secret-key-for-testing';
        process.env.JWT_EXPIRATION = '7d';
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('getTokenExpiration', () => {
        it('should return default expiration of 7 days (604800 seconds)', () => {
            delete process.env.JWT_EXPIRATION;
            expect(getTokenExpiration()).toBe(604800);
        });

        it('should parse seconds format correctly', () => {
            process.env.JWT_EXPIRATION = '3600s';
            expect(getTokenExpiration()).toBe(3600);
        });

        it('should parse minutes format correctly', () => {
            process.env.JWT_EXPIRATION = '60m';
            expect(getTokenExpiration()).toBe(3600);
        });

        it('should parse hours format correctly', () => {
            process.env.JWT_EXPIRATION = '24h';
            expect(getTokenExpiration()).toBe(86400);
        });

        it('should parse days format correctly', () => {
            process.env.JWT_EXPIRATION = '7d';
            expect(getTokenExpiration()).toBe(604800);
        });

        it('should return default for invalid format', () => {
            process.env.JWT_EXPIRATION = 'invalid';
            expect(getTokenExpiration()).toBe(604800);
        });
    });

    describe('generateToken', () => {
        it('should generate a valid JWT token for a player', async () => {
            const token = await generateToken('player-123', 'player@example.com', 'player');

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
        });

        it('should generate a valid JWT token for a coach', async () => {
            const token = await generateToken('coach-456', 'coach@university.edu', 'coach');

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
        });

        it('should default to player type when type is not specified', async () => {
            const token = await generateToken('user-789', 'user@example.com');
            const decoded = jwt.decode(token) as TokenPayload;

            expect(decoded.type).toBe('player');
        });

        it('should include correct payload data', async () => {
            const userId = 'player-123';
            const email = 'player@example.com';
            const type = 'player';

            const token = await generateToken(userId, email, type);
            const decoded = jwt.decode(token) as TokenPayload;

            expect(decoded.playerId).toBe(userId);
            expect(decoded.email).toBe(email);
            expect(decoded.type).toBe(type);
            expect(decoded.iat).toBeDefined();
            expect(decoded.exp).toBeDefined();
        });

        it('should set correct expiration time', async () => {
            process.env.JWT_EXPIRATION = '1h';
            const token = await generateToken('player-123', 'player@example.com', 'player');
            const decoded = jwt.decode(token) as TokenPayload;

            const expectedExp = decoded.iat + 3600; // 1 hour in seconds
            expect(decoded.exp).toBe(expectedExp);
        });

        it('should throw error when JWT_SECRET is not set', async () => {
            delete process.env.JWT_SECRET;

            await expect(
                generateToken('player-123', 'player@example.com', 'player')
            ).rejects.toThrow('JWT_SECRET environment variable is not set');
        });

        it('should use HS256 algorithm', async () => {
            const token = await generateToken('player-123', 'player@example.com', 'player');
            const decoded = jwt.decode(token, { complete: true });

            expect(decoded?.header.alg).toBe('HS256');
        });
    });

    describe('verifyToken', () => {
        it('should verify and decode a valid token', async () => {
            const userId = 'player-123';
            const email = 'player@example.com';
            const type = 'player';

            const token = await generateToken(userId, email, type);
            const payload = await verifyToken(token);

            expect(payload).not.toBeNull();
            expect(payload?.playerId).toBe(userId);
            expect(payload?.email).toBe(email);
            expect(payload?.type).toBe(type);
        });

        it('should return null for invalid token', async () => {
            const payload = await verifyToken('invalid.token.here');

            expect(payload).toBeNull();
        });

        it('should return null for expired token', async () => {
            // Create a token that expires immediately
            const secret = process.env.JWT_SECRET!;
            const expiredToken = jwt.sign(
                { playerId: 'player-123', email: 'player@example.com', type: 'player' },
                secret,
                { expiresIn: '0s' }
            );

            // Wait a moment to ensure expiration
            await new Promise(resolve => setTimeout(resolve, 100));

            const payload = await verifyToken(expiredToken);
            expect(payload).toBeNull();
        });

        it('should return null for token with wrong signature', async () => {
            const token = await generateToken('player-123', 'player@example.com', 'player');

            // Change the secret to simulate wrong signature
            process.env.JWT_SECRET = 'different-secret';

            const payload = await verifyToken(token);
            expect(payload).toBeNull();
        });

        it('should return null when JWT_SECRET is not set', async () => {
            const token = await generateToken('player-123', 'player@example.com', 'player');
            delete process.env.JWT_SECRET;

            const payload = await verifyToken(token);
            expect(payload).toBeNull();
        });

        it('should verify token with correct algorithm', async () => {
            const token = await generateToken('player-123', 'player@example.com', 'player');
            const payload = await verifyToken(token);

            expect(payload).not.toBeNull();
        });

        it('should handle malformed tokens gracefully', async () => {
            const payload = await verifyToken('not-a-jwt-token');
            expect(payload).toBeNull();
        });

        it('should handle empty token string', async () => {
            const payload = await verifyToken('');
            expect(payload).toBeNull();
        });
    });

    describe('Token lifecycle', () => {
        it('should generate and verify token successfully', async () => {
            const userId = 'player-123';
            const email = 'player@example.com';
            const type = 'player';

            // Generate token
            const token = await generateToken(userId, email, type);
            expect(token).toBeDefined();

            // Verify token
            const payload = await verifyToken(token);
            expect(payload).not.toBeNull();
            expect(payload?.playerId).toBe(userId);
            expect(payload?.email).toBe(email);
            expect(payload?.type).toBe(type);
        });

        it('should handle multiple tokens for different users', async () => {
            const token1 = await generateToken('player-1', 'player1@example.com', 'player');
            const token2 = await generateToken('coach-1', 'coach1@university.edu', 'coach');

            const payload1 = await verifyToken(token1);
            const payload2 = await verifyToken(token2);

            expect(payload1?.playerId).toBe('player-1');
            expect(payload1?.type).toBe('player');
            expect(payload2?.playerId).toBe('coach-1');
            expect(payload2?.type).toBe('coach');
        });
    });
});
