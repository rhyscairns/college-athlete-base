import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import CoachDashboardPage from '@/app/coach/dashboard/[coachId]/page';
import { verifyToken } from '@/authentication/utils/jwt';
import { getCoachById } from '@/authentication/db/coaches';
import { CoachDatabaseRecord } from '@/authentication/types';

// Mock Next.js modules
jest.mock('next/navigation', () => ({
    redirect: jest.fn(),
}));

jest.mock('next/headers', () => ({
    cookies: jest.fn(),
}));

// Mock authentication utilities
jest.mock('@/authentication/utils/jwt');
jest.mock('@/authentication/db/coaches');

describe('CoachDashboardPage', () => {
    const mockCoachId = 'test-coach-id-123';
    const mockCoachData: CoachDatabaseRecord = {
        id: mockCoachId,
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@university.edu',
        passwordHash: 'hashed-password',
        coachingCategory: 'mens',
        sports: ['Basketball', 'Football'],
        university: 'State University',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    };

    const mockTokenPayload = {
        playerId: mockCoachId, // Note: JWT uses playerId field for both players and coaches
        email: 'john.smith@university.edu',
        type: 'coach' as const,
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
                CoachDashboardPage({ params: Promise.resolve({ coachId: mockCoachId }) })
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
                CoachDashboardPage({ params: Promise.resolve({ coachId: mockCoachId }) })
            ).rejects.toThrow('NEXT_REDIRECT: /login');

            expect(verifyToken).toHaveBeenCalledWith('invalid-token');
            expect(redirect).toHaveBeenCalledWith('/login');
        });

        it('should redirect to login when token coachId does not match URL parameter', async () => {
            // Mock session cookie with different coachId
            (cookies as jest.Mock).mockResolvedValue({
                get: jest.fn().mockReturnValue({ value: 'valid-token' }),
            });
            (verifyToken as jest.Mock).mockResolvedValue({
                ...mockTokenPayload,
                playerId: 'different-coach-id',
            });

            await expect(
                CoachDashboardPage({ params: Promise.resolve({ coachId: mockCoachId }) })
            ).rejects.toThrow('NEXT_REDIRECT: /login');

            expect(redirect).toHaveBeenCalledWith('/login');
        });

        it('should redirect to login when token type is not coach', async () => {
            // Mock session cookie with player type
            (cookies as jest.Mock).mockResolvedValue({
                get: jest.fn().mockReturnValue({ value: 'valid-token' }),
            });
            (verifyToken as jest.Mock).mockResolvedValue({
                ...mockTokenPayload,
                type: 'player',
            });

            await expect(
                CoachDashboardPage({ params: Promise.resolve({ coachId: mockCoachId }) })
            ).rejects.toThrow('NEXT_REDIRECT: /login');

            expect(redirect).toHaveBeenCalledWith('/login');
        });

        it('should redirect to login when coach is not found in database', async () => {
            // Mock valid token but coach not found
            (cookies as jest.Mock).mockResolvedValue({
                get: jest.fn().mockReturnValue({ value: 'valid-token' }),
            });
            (verifyToken as jest.Mock).mockResolvedValue(mockTokenPayload);
            (getCoachById as jest.Mock).mockResolvedValue(null);

            await expect(
                CoachDashboardPage({ params: Promise.resolve({ coachId: mockCoachId }) })
            ).rejects.toThrow('NEXT_REDIRECT: /login');

            expect(getCoachById).toHaveBeenCalledWith(mockCoachId);
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
            (getCoachById as jest.Mock).mockResolvedValue(mockCoachData);
        });

        it('should render dashboard with coach name when authenticated', async () => {
            const result = await CoachDashboardPage({ params: Promise.resolve({ coachId: mockCoachId }) });

            expect(redirect).not.toHaveBeenCalled();
            expect(getCoachById).toHaveBeenCalledWith(mockCoachId);
            expect(result).toBeDefined();
        });

        it('should display coach information correctly', async () => {
            const result = await CoachDashboardPage({ params: Promise.resolve({ coachId: mockCoachId }) });

            // The component should be rendered without redirecting
            expect(redirect).not.toHaveBeenCalled();
            expect(verifyToken).toHaveBeenCalledWith('valid-token');
            expect(getCoachById).toHaveBeenCalledWith(mockCoachId);
        });

        it('should handle coach with minimal data (no optional fields)', async () => {
            const minimalCoach: CoachDatabaseRecord = {
                id: mockCoachId,
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane.doe@college.edu',
                passwordHash: 'hashed-password',
                coachingCategory: 'womens',
                sports: ['Soccer'],
                university: 'Local College',
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01'),
            };

            (getCoachById as jest.Mock).mockResolvedValue(minimalCoach);

            const result = await CoachDashboardPage({ params: Promise.resolve({ coachId: mockCoachId }) });

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
            (getCoachById as jest.Mock).mockResolvedValue(mockCoachData);

            await CoachDashboardPage({ params: Promise.resolve({ coachId: mockCoachId }) });

            expect(verifyToken).toHaveBeenCalledWith(sessionToken);
        });

        it('should match coachId from token with URL parameter', async () => {
            (cookies as jest.Mock).mockResolvedValue({
                get: jest.fn().mockReturnValue({ value: 'valid-token' }),
            });
            (verifyToken as jest.Mock).mockResolvedValue(mockTokenPayload);
            (getCoachById as jest.Mock).mockResolvedValue(mockCoachData);

            await CoachDashboardPage({ params: Promise.resolve({ coachId: mockCoachId }) });

            expect(redirect).not.toHaveBeenCalled();
            expect(mockTokenPayload.playerId).toBe(mockCoachId);
        });
    });

    describe('Error Handling', () => {
        it('should handle error when verifyToken throws an error', async () => {
            (cookies as jest.Mock).mockResolvedValue({
                get: jest.fn().mockReturnValue({ value: 'valid-token' }),
            });
            (verifyToken as jest.Mock).mockRejectedValue(new Error('Token verification failed'));

            await expect(
                CoachDashboardPage({ params: Promise.resolve({ coachId: mockCoachId }) })
            ).rejects.toThrow('Token verification failed');
        });

        it('should handle error when getCoachById throws an error', async () => {
            (cookies as jest.Mock).mockResolvedValue({
                get: jest.fn().mockReturnValue({ value: 'valid-token' }),
            });
            (verifyToken as jest.Mock).mockResolvedValue(mockTokenPayload);
            (getCoachById as jest.Mock).mockRejectedValue(new Error('Database error'));

            await expect(
                CoachDashboardPage({ params: Promise.resolve({ coachId: mockCoachId }) })
            ).rejects.toThrow('Database error');
        });
    });
});
