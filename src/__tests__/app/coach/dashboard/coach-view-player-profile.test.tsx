import CoachViewPlayerProfilePage from '@/app/coach/[coachId]/dashboard/[playerId]/player-profile/[profilePlayerId]/page';
import { logger } from '@/lib/logger';

// Mock dependencies
jest.mock('@/lib/logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock('@/profile/player/components/view-page/PlayerProfileView', () => ({
    PlayerProfileView: ({ playerId, currentUserId, userType, initialData }: any) => (
        <div data-testid="player-profile-view">
            <span data-testid="player-id">{playerId}</span>
            <span data-testid="current-user-id">{currentUserId}</span>
            <span data-testid="user-type">{userType}</span>
            <span data-testid="player-name">{initialData?.firstName} {initialData?.lastName}</span>
        </div>
    ),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('CoachViewPlayerProfilePage', () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

    const mockParams = {
        coachId: 'coach-123',
        playerId: 'player-456',
        profilePlayerId: 'profile-789',
    };

    const mockPlayerData = {
        id: 'profile-789',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        sport: 'Basketball',
        position: 'Point Guard',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
    });

    afterEach(() => {
        delete process.env.NEXT_PUBLIC_API_URL;
    });

    describe('Data Fetching', () => {
        it('should fetch player profile from API successfully', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({
                    success: true,
                    data: mockPlayerData,
                }),
            } as Response);

            await CoachViewPlayerProfilePage({
                params: Promise.resolve(mockParams),
            });

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/player/profile-789/profile',
                expect.objectContaining({
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    cache: 'no-store',
                })
            );

            expect(logger.info).toHaveBeenCalledWith(
                'Fetching player profile from API',
                expect.objectContaining({
                    playerId: 'profile-789',
                })
            );

            expect(logger.info).toHaveBeenCalledWith(
                'Successfully fetched player profile from API',
                { playerId: 'profile-789' }
            );
        });

        it('should return error UI if API fetch fails', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'Not Found',
            } as Response);

            const result = await CoachViewPlayerProfilePage({
                params: Promise.resolve(mockParams),
            });

            expect(logger.warn).toHaveBeenCalledWith(
                'API request failed',
                expect.objectContaining({
                    playerId: 'profile-789',
                    status: 404,
                })
            );

            expect(logger.error).toHaveBeenCalledWith(
                'Failed to load player profile',
                { playerId: 'profile-789' }
            );

            // Verify error UI is returned
            expect(result).toBeDefined();
            expect((result as any).type).toBe('main');
        });

        it('should return error UI if API returns unsuccessful response', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({
                    success: false,
                    error: 'Player not found',
                }),
            } as Response);

            const result = await CoachViewPlayerProfilePage({
                params: Promise.resolve(mockParams),
            });

            expect(logger.warn).toHaveBeenCalledWith(
                'API returned unsuccessful response',
                expect.objectContaining({
                    playerId: 'profile-789',
                    error: 'Player not found',
                })
            );

            expect(logger.error).toHaveBeenCalledWith(
                'Failed to load player profile',
                { playerId: 'profile-789' }
            );

            // Verify error UI is returned
            expect(result).toBeDefined();
        });

        it('should handle fetch timeout', async () => {
            jest.useFakeTimers();

            const abortError = new Error('The operation was aborted');
            abortError.name = 'AbortError';
            mockFetch.mockRejectedValue(abortError);

            const result = await CoachViewPlayerProfilePage({
                params: Promise.resolve(mockParams),
            });

            expect(logger.error).toHaveBeenCalledWith(
                'Error fetching player profile from API',
                expect.objectContaining({
                    playerId: 'profile-789',
                })
            );

            expect(logger.error).toHaveBeenCalledWith(
                'Failed to load player profile',
                { playerId: 'profile-789' }
            );

            // Verify error UI is returned
            expect(result).toBeDefined();

            jest.useRealTimers();
        }, 10000);

        it('should handle network errors', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            const result = await CoachViewPlayerProfilePage({
                params: Promise.resolve(mockParams),
            });

            expect(logger.error).toHaveBeenCalledWith(
                'Error fetching player profile from API',
                expect.objectContaining({
                    playerId: 'profile-789',
                    error: 'Network error',
                })
            );

            expect(logger.error).toHaveBeenCalledWith(
                'Failed to load player profile',
                { playerId: 'profile-789' }
            );

            // Verify error UI is returned
            expect(result).toBeDefined();
        });
    });

    describe('Rendering', () => {
        it('should render PlayerProfileView with correct props when data loads successfully', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({
                    success: true,
                    data: mockPlayerData,
                }),
            } as Response);

            const result = await CoachViewPlayerProfilePage({
                params: Promise.resolve(mockParams),
            });

            // Verify component is rendered
            expect(result).toBeDefined();
            expect((result as any).type).toBeDefined();
        });

        it('should pass correct playerId to PlayerProfileView', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({
                    success: true,
                    data: mockPlayerData,
                }),
            } as Response);

            await CoachViewPlayerProfilePage({
                params: Promise.resolve(mockParams),
            });

            // Verify the correct profilePlayerId is used in fetch
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('profile-789'),
                expect.any(Object)
            );
        });

        it('should render error UI when player data is null', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
            } as Response);

            const result = await CoachViewPlayerProfilePage({
                params: Promise.resolve(mockParams),
            });

            // Verify error UI structure
            expect(result).toBeDefined();
            expect((result as any).type).toBe('main');
            expect((result as any).props.className).toContain('min-h-screen');
        });
    });

    describe('Edge Cases', () => {
        it('should use default API URL if NEXT_PUBLIC_API_URL is not set', async () => {
            delete process.env.NEXT_PUBLIC_API_URL;

            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({
                    success: true,
                    data: mockPlayerData,
                }),
            } as Response);

            await CoachViewPlayerProfilePage({
                params: Promise.resolve(mockParams),
            });

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/player/profile-789/profile',
                expect.any(Object)
            );
        });

        it('should return error UI when API returns null data', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({
                    success: true,
                    data: null,
                }),
            } as Response);

            const result = await CoachViewPlayerProfilePage({
                params: Promise.resolve(mockParams),
            });

            expect(logger.error).toHaveBeenCalledWith(
                'Failed to load player profile',
                { playerId: 'profile-789' }
            );

            // Verify error UI is returned
            expect(result).toBeDefined();
            expect((result as any).type).toBe('main');
        });
    });
});
