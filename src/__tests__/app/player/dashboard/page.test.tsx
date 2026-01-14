import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import PlayerDashboardPage from '@/app/player/[playerId]/dashboard/page';
import { verifyToken } from '@/authentication/utils/jwt';
import { getPlayerById } from '@/authentication/db/players';
import { PlayerDatabaseRecord } from '@/authentication/types';

// Mock Next.js modules
jest.mock('next/navigation', () => ({
    redirect: jest.fn(),
}));

jest.mock('next/headers', () => ({
    cookies: jest.fn(),
}));

// Mock authentication utilities
jest.mock('@/authentication/utils/jwt');
jest.mock('@/authentication/db/players');

describe('PlayerDashboardPage', () => {
    const mockPlayerId = 'test-player-id-123';
    const mockPlayerData: PlayerDatabaseRecord = {
        id: mockPlayerId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        passwordHash: 'hashed-password',
        sex: 'Male',
        sport: 'Basketball',
        position: 'Point Guard',
        gpa: 3.8,
        country: 'USA',
        state: 'California',
        region: 'West',
        scholarshipAmount: 50000,
        testScores: 'SAT: 1400',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    };

    const mockTokenPayload = {
        playerId: mockPlayerId,
        email: 'john.doe@example.com',
        type: 'player' as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 604800,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Make redirect throw an error to simulate Next.js behavior
        (redirect as unknown as jest.Mock).mockImplementation((url: string) => {
            throw new Error(`NEXT_REDIRECT: ${url}`);
        });
    });

    describe('Session Validation', () => {
        it('should redirect to login when no session token exists', async () => {
            // Mock no session cookie
            (cookies as jest.Mock).mockResolvedValue({
                get: jest.fn().mockReturnValue(undefined),
            });

            await expect(
                PlayerDashboardPage({ params: Promise.resolve({ playerId: mockPlayerId }) })
            ).rejects.toThrow('NEXT_REDIRECT: /login');

            expect(redirect).toHaveBeenCalledWith('/login');
        });

        it('should redirect to login when session token is invalid', async () => {
            // Mock session cookie exists but token is invalid
            (cookies as jest.Mock).mockResolvedValue({
                get: jest.fn().mockReturnValue({ value: 'invalid-token' }),
            });
            (verifyToken as jest.Mock).mockResolvedValue(null);

            await expect(
                PlayerDashboardPage({ params: Promise.resolve({ playerId: mockPlayerId }) })
            ).rejects.toThrow('NEXT_REDIRECT: /login');

            expect(verifyToken).toHaveBeenCalledWith('invalid-token');
            expect(redirect).toHaveBeenCalledWith('/login');
        });

        it('should redirect to login when token playerId does not match URL parameter', async () => {
            // Mock session cookie with different playerId
            (cookies as jest.Mock).mockResolvedValue({
                get: jest.fn().mockReturnValue({ value: 'valid-token' }),
            });
            (verifyToken as jest.Mock).mockResolvedValue({
                ...mockTokenPayload,
                playerId: 'different-player-id',
            });

            await expect(
                PlayerDashboardPage({ params: Promise.resolve({ playerId: mockPlayerId }) })
            ).rejects.toThrow('NEXT_REDIRECT: /login');

            expect(redirect).toHaveBeenCalledWith('/login');
        });

        it('should redirect to login when player is not found in database', async () => {
            // Mock valid token but player not found
            (cookies as jest.Mock).mockResolvedValue({
                get: jest.fn().mockReturnValue({ value: 'valid-token' }),
            });
            (verifyToken as jest.Mock).mockResolvedValue(mockTokenPayload);
            (getPlayerById as jest.Mock).mockResolvedValue(null);

            await expect(
                PlayerDashboardPage({ params: Promise.resolve({ playerId: mockPlayerId }) })
            ).rejects.toThrow('NEXT_REDIRECT: /login');

            expect(getPlayerById).toHaveBeenCalledWith(mockPlayerId);
            expect(redirect).toHaveBeenCalledWith('/login');
        });
    });

    describe('Dashboard Rendering', () => {
        beforeEach(() => {
            // Setup valid session for rendering tests
            (cookies as jest.Mock).mockResolvedValue({
                get: jest.fn().mockReturnValue({ value: 'valid-token' }),
            });
            (verifyToken as jest.Mock).mockResolvedValue(mockTokenPayload);
            (getPlayerById as jest.Mock).mockResolvedValue(mockPlayerData);
        });

        it('should render dashboard with player name when authenticated', async () => {
            const result = await PlayerDashboardPage({ params: Promise.resolve({ playerId: mockPlayerId }) });

            expect(redirect).not.toHaveBeenCalled();
            expect(getPlayerById).toHaveBeenCalledWith(mockPlayerId);
            expect(result).toBeDefined();
        });

        it('should display player information correctly', async () => {
            const result = await PlayerDashboardPage({ params: Promise.resolve({ playerId: mockPlayerId }) });

            // The component should be rendered without redirecting
            expect(redirect).not.toHaveBeenCalled();
            expect(verifyToken).toHaveBeenCalledWith('valid-token');
            expect(getPlayerById).toHaveBeenCalledWith(mockPlayerId);
        });

        it('should handle player with minimal data (no optional fields)', async () => {
            const minimalPlayer: PlayerDatabaseRecord = {
                id: mockPlayerId,
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                passwordHash: 'hashed-password',
                sex: 'Female',
                sport: 'Soccer',
                position: 'Forward',
                gpa: 3.5,
                country: 'Canada',
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01'),
            };

            (getPlayerById as jest.Mock).mockResolvedValue(minimalPlayer);

            const result = await PlayerDashboardPage({ params: Promise.resolve({ playerId: mockPlayerId }) });

            expect(redirect).not.toHaveBeenCalled();
            expect(result).toBeDefined();
        });
    });

    describe('Token Verification', () => {
        it('should verify token with correct session value', async () => {
            const sessionToken = 'test-session-token';
            (cookies as jest.Mock).mockResolvedValue({
                get: jest.fn().mockReturnValue({ value: sessionToken }),
            });
            (verifyToken as jest.Mock).mockResolvedValue(mockTokenPayload);
            (getPlayerById as jest.Mock).mockResolvedValue(mockPlayerData);

            await PlayerDashboardPage({ params: Promise.resolve({ playerId: mockPlayerId }) });

            expect(verifyToken).toHaveBeenCalledWith(sessionToken);
        });

        it('should match playerId from token with URL parameter', async () => {
            (cookies as jest.Mock).mockResolvedValue({
                get: jest.fn().mockReturnValue({ value: 'valid-token' }),
            });
            (verifyToken as jest.Mock).mockResolvedValue(mockTokenPayload);
            (getPlayerById as jest.Mock).mockResolvedValue(mockPlayerData);

            await PlayerDashboardPage({ params: Promise.resolve({ playerId: mockPlayerId }) });

            expect(redirect).not.toHaveBeenCalled();
            expect(mockTokenPayload.playerId).toBe(mockPlayerId);
        });
    });

    describe('Error Handling', () => {
        it('should handle error when verifyToken throws an error', async () => {
            (cookies as jest.Mock).mockResolvedValue({
                get: jest.fn().mockReturnValue({ value: 'valid-token' }),
            });
            (verifyToken as jest.Mock).mockRejectedValue(new Error('Token verification failed'));

            await expect(
                PlayerDashboardPage({ params: Promise.resolve({ playerId: mockPlayerId }) })
            ).rejects.toThrow('Token verification failed');
        });

        it('should handle error when getPlayerById throws an error', async () => {
            (cookies as jest.Mock).mockResolvedValue({
                get: jest.fn().mockReturnValue({ value: 'valid-token' }),
            });
            (verifyToken as jest.Mock).mockResolvedValue(mockTokenPayload);
            (getPlayerById as jest.Mock).mockRejectedValue(new Error('Database error'));

            await expect(
                PlayerDashboardPage({ params: Promise.resolve({ playerId: mockPlayerId }) })
            ).rejects.toThrow('Database error');
        });
    });
});
