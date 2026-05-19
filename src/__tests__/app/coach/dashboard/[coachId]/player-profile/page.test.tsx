import CoachViewPlayerProfilePage from '@/app/coach/[coachId]/dashboard/player-profile/[playerId]/page';
import { logger } from '@/lib/logger';

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

// Page now calls getCoachProfileById directly — mock the DB layer
jest.mock('@/profile/player/lib/db/queries', () => ({
    getPlayerProfileById: jest.fn(),
    getPlayerCABStatus: jest.fn(),
}));

// Mock next/navigation notFound
jest.mock('next/navigation', () => ({
    notFound: jest.fn(() => { throw new Error('NEXT_NOT_FOUND'); }),
}));

// Mock the view counter — fire-and-forget, non-critical
jest.mock('@/lib/db/queries/prospects', () => ({
    incrementPlayerProfileViews: jest.fn().mockResolvedValue(undefined),
}));

import { getPlayerProfileById, getPlayerCABStatus } from '@/profile/player/lib/db/queries';
const mockGetPlayerProfileById = getPlayerProfileById as jest.MockedFunction<typeof getPlayerProfileById>;
const mockGetPlayerCABStatus = getPlayerCABStatus as jest.MockedFunction<typeof getPlayerCABStatus>;

describe('CoachViewPlayerProfilePage', () => {
    const mockParams = { coachId: 'coach-123', playerId: 'player-456' };

    const mockPlayerData = {
        id: 'player-456',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        sport: 'Basketball',
        position: 'Point Guard',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetPlayerCABStatus.mockResolvedValue(true);
        mockGetPlayerProfileById.mockResolvedValue(mockPlayerData as any);
    });

    describe('CAB member gating', () => {
        it('should call notFound when player is not a CAB member', async () => {
            mockGetPlayerCABStatus.mockResolvedValue(false);

            await expect(
                CoachViewPlayerProfilePage({ params: Promise.resolve(mockParams) })
            ).rejects.toThrow('NEXT_NOT_FOUND');

            expect(logger.warn).toHaveBeenCalledWith(
                'Coach attempted to view non-member player profile',
                { coachId: 'coach-123', playerId: 'player-456' }
            );
        });

        it('should not fetch profile data when player is not a CAB member', async () => {
            mockGetPlayerCABStatus.mockResolvedValue(false);

            await expect(
                CoachViewPlayerProfilePage({ params: Promise.resolve(mockParams) })
            ).rejects.toThrow('NEXT_NOT_FOUND');

            expect(mockGetPlayerProfileById).not.toHaveBeenCalled();
        });

        it('should render profile when player is a CAB member', async () => {
            mockGetPlayerCABStatus.mockResolvedValue(true);

            const result = await CoachViewPlayerProfilePage({ params: Promise.resolve(mockParams) });

            expect(result).toBeDefined();
            expect(mockGetPlayerProfileById).toHaveBeenCalledWith('player-456');
        });
    });

    describe('Data Fetching', () => {
        it('should fetch player profile from DB successfully', async () => {
            await CoachViewPlayerProfilePage({ params: Promise.resolve(mockParams) });

            expect(mockGetPlayerProfileById).toHaveBeenCalledWith('player-456');
            expect(logger.info).toHaveBeenCalledWith(
                'Coach viewing player profile',
                { coachId: 'coach-123', playerId: 'player-456' }
            );
        });

        it('should return error UI if DB returns null', async () => {
            mockGetPlayerProfileById.mockResolvedValueOnce(null);

            const result = await CoachViewPlayerProfilePage({ params: Promise.resolve(mockParams) });

            expect(logger.error).toHaveBeenCalledWith(
                'Failed to load player profile',
                { playerId: 'player-456' }
            );
            expect(result).toBeDefined();
            expect(result.type).toBe('main');
        });

        it('should return error UI if DB throws', async () => {
            mockGetPlayerProfileById.mockRejectedValueOnce(new Error('DB error'));

            const result = await CoachViewPlayerProfilePage({ params: Promise.resolve(mockParams) });

            expect(logger.error).toHaveBeenCalledWith(
                'Failed to load player profile',
                { playerId: 'player-456' }
            );
            expect(result).toBeDefined();
        });
    });

    describe('Rendering', () => {
        it('should render PlayerProfileView with correct props when data loads', async () => {
            const result = await CoachViewPlayerProfilePage({ params: Promise.resolve(mockParams) });
            expect(result).toBeDefined();
            expect(result.type).toBeDefined();
        });

        it('should pass correct playerId to DB query', async () => {
            await CoachViewPlayerProfilePage({ params: Promise.resolve(mockParams) });
            expect(mockGetPlayerProfileById).toHaveBeenCalledWith('player-456');
        });

        it('should render error UI when player data is null', async () => {
            mockGetPlayerProfileById.mockResolvedValueOnce(null);

            const result = await CoachViewPlayerProfilePage({ params: Promise.resolve(mockParams) });
            expect(result).toBeDefined();
            expect(result.type).toBe('main');
        });
    });

    describe('Edge Cases', () => {
        it('should log coach and player IDs when viewing profile', async () => {
            await CoachViewPlayerProfilePage({ params: Promise.resolve(mockParams) });

            expect(logger.info).toHaveBeenCalledWith(
                'Coach viewing player profile',
                { coachId: 'coach-123', playerId: 'player-456' }
            );
        });

        it('should return error UI when DB returns null data', async () => {
            mockGetPlayerProfileById.mockResolvedValueOnce(null);

            const result = await CoachViewPlayerProfilePage({ params: Promise.resolve(mockParams) });

            expect(logger.error).toHaveBeenCalledWith(
                'Failed to load player profile',
                { playerId: 'player-456' }
            );
            expect(result).toBeDefined();
            expect(result.type).toBe('main');
        });
    });
});
