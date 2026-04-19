import { extractPlayerId } from '../extractPlayerId';

describe('extractPlayerId', () => {
    describe('Valid Patterns', () => {
        it('should extract playerId from /player/[playerId]/dashboard', () => {
            expect(extractPlayerId('/player/player-123/dashboard')).toBe('player-123');
        });

        it('should extract playerId from /player/[playerId]/profile', () => {
            expect(extractPlayerId('/player/player-456/profile')).toBe('player-456');
        });

        it('should handle paths with trailing slashes', () => {
            expect(extractPlayerId('/player/player-123/dashboard/')).toBe('player-123');
        });

        it('should handle complex player IDs with hyphens and underscores', () => {
            expect(extractPlayerId('/player/player-123-abc_def/dashboard')).toBe('player-123-abc_def');
        });
    });

    describe('Invalid Patterns', () => {
        it('should return empty string for paths not starting with /player', () => {
            expect(extractPlayerId('/other/path')).toBe('');
        });

        it('should return empty string for empty pathname', () => {
            expect(extractPlayerId('')).toBe('');
        });

        it('should return empty string for root path', () => {
            expect(extractPlayerId('/')).toBe('');
        });

        it('should return empty string for pathname with only slashes', () => {
            expect(extractPlayerId('///')).toBe('');
        });

        it('should return empty string for /player only', () => {
            expect(extractPlayerId('/player')).toBe('');
        });
    });

    describe('Edge Cases', () => {
        it('should handle paths with query parameters', () => {
            expect(extractPlayerId('/player/player-123/dashboard?tab=stats')).toBe('player-123');
        });

        it('should handle paths with hash fragments', () => {
            expect(extractPlayerId('/player/player-123/dashboard#section')).toBe('player-123');
        });

        it('should handle numeric player IDs', () => {
            expect(extractPlayerId('/player/12345/dashboard')).toBe('12345');
        });

        it('should handle UUID-style player IDs', () => {
            const uuid = '550e8400-e29b-41d4-a716-446655440000';
            expect(extractPlayerId(`/player/${uuid}/dashboard`)).toBe(uuid);
        });
    });
});
