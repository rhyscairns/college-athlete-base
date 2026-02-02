/**
 * Tests for player profile database query utilities
 */

import { getPlayerProfileById } from '../index';
import { query } from '@/authentication/db/client';
import { logger } from '@/lib/logger';

// Mock dependencies
jest.mock('@/authentication/db/client');
jest.mock('@/lib/logger');

const mockQuery = query as jest.MockedFunction<typeof query>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('getPlayerProfileById', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch and transform player profile data successfully', async () => {
        const mockPlayerId = 'test-player-id';
        const mockPlayerRow = {
            id: mockPlayerId,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            sex: 'Male',
            sport: 'Football',
            position: 'Quarterback',
            gpa: '3.5',
            country: 'USA',
            state: 'California',
            region: null,
            scholarship_amount: '50000.00',
            test_scores: JSON.stringify({
                satScore: 1400,
                satMath: 700,
                satReading: 700,
                actScore: 32,
            }),
            created_at: new Date('2024-01-01'),
            updated_at: new Date('2024-01-15'),
        };

        mockQuery.mockResolvedValueOnce([mockPlayerRow]);

        const result = await getPlayerProfileById(mockPlayerId);

        expect(result).not.toBeNull();
        expect(result?.id).toBe(mockPlayerId);
        expect(result?.firstName).toBe('John');
        expect(result?.lastName).toBe('Doe');
        expect(result?.initials).toBe('JD');
        expect(result?.position).toBe('Quarterback');
        expect(result?.location).toBe('California, USA');
        expect(result?.academic.gpa).toBe(3.5);
        expect(result?.academic.satScore).toBe(1400);
        expect(result?.academic.satMath).toBe(700);
        expect(result?.academic.satReading).toBe(700);
        expect(result?.academic.actScore).toBe(32);
        expect(result?.contact.email).toBe('john.doe@example.com');
        expect(result?.videos).toEqual([]);
        expect(result?.achievements).toEqual([]);
        expect(result?.coachTestimonials).toEqual([]);

        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('SELECT'),
            [mockPlayerId]
        );
    });

    it('should return null when player is not found', async () => {
        const mockPlayerId = 'non-existent-player';
        mockQuery.mockResolvedValueOnce([]);

        const result = await getPlayerProfileById(mockPlayerId);

        expect(result).toBeNull();
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('SELECT'),
            [mockPlayerId]
        );
    });

    it('should handle player with region instead of state', async () => {
        const mockPlayerId = 'test-player-id';
        const mockPlayerRow = {
            id: mockPlayerId,
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@example.com',
            sex: 'Female',
            sport: 'Basketball',
            position: 'Point Guard',
            gpa: '3.8',
            country: 'Canada',
            state: null,
            region: 'Ontario',
            scholarship_amount: null,
            test_scores: null,
            created_at: new Date('2024-01-01'),
            updated_at: new Date('2024-01-15'),
        };

        mockQuery.mockResolvedValueOnce([mockPlayerRow]);

        const result = await getPlayerProfileById(mockPlayerId);

        expect(result).not.toBeNull();
        expect(result?.location).toBe('Ontario, Canada');
        expect(result?.academic.satScore).toBe(0);
        expect(result?.academic.actScore).toBeUndefined();
    });

    it('should handle player with no state or region', async () => {
        const mockPlayerId = 'test-player-id';
        const mockPlayerRow = {
            id: mockPlayerId,
            first_name: 'Bob',
            last_name: 'Johnson',
            email: 'bob.johnson@example.com',
            sex: 'Male',
            sport: 'Soccer',
            position: 'Forward',
            gpa: '3.2',
            country: 'Mexico',
            state: null,
            region: null,
            scholarship_amount: null,
            test_scores: null,
            created_at: new Date('2024-01-01'),
            updated_at: new Date('2024-01-15'),
        };

        mockQuery.mockResolvedValueOnce([mockPlayerRow]);

        const result = await getPlayerProfileById(mockPlayerId);

        expect(result).not.toBeNull();
        expect(result?.location).toBe('Mexico');
    });

    it('should handle invalid test scores JSON gracefully', async () => {
        const mockPlayerId = 'test-player-id';
        const mockPlayerRow = {
            id: mockPlayerId,
            first_name: 'Alice',
            last_name: 'Williams',
            email: 'alice.williams@example.com',
            sex: 'Female',
            sport: 'Volleyball',
            position: 'Setter',
            gpa: '3.9',
            country: 'USA',
            state: 'Texas',
            region: null,
            scholarship_amount: null,
            test_scores: 'invalid-json',
            created_at: new Date('2024-01-01'),
            updated_at: new Date('2024-01-15'),
        };

        mockQuery.mockResolvedValueOnce([mockPlayerRow]);

        const result = await getPlayerProfileById(mockPlayerId);

        expect(result).not.toBeNull();
        expect(result?.academic.satScore).toBe(0);
        expect(result?.academic.actScore).toBeUndefined();
        expect(mockLogger.warn).toHaveBeenCalledWith(
            'Failed to parse test scores',
            { playerId: mockPlayerId },
            expect.any(Error)
        );
    });

    it('should throw error when database query fails', async () => {
        const mockPlayerId = 'test-player-id';
        const mockError = new Error('Database connection failed');
        mockQuery.mockRejectedValueOnce(mockError);

        await expect(getPlayerProfileById(mockPlayerId)).rejects.toThrow('Failed to fetch player profile');

        expect(mockLogger.error).toHaveBeenCalledWith(
            'Failed to fetch player profile',
            { playerId: mockPlayerId },
            mockError
        );
    });

    it('should generate correct initials from first and last name', async () => {
        const mockPlayerId = 'test-player-id';
        const mockPlayerRow = {
            id: mockPlayerId,
            first_name: 'alexander',
            last_name: 'rodriguez',
            email: 'alex.rodriguez@example.com',
            sex: 'Male',
            sport: 'Baseball',
            position: 'Third Base',
            gpa: '3.4',
            country: 'USA',
            state: 'New York',
            region: null,
            scholarship_amount: null,
            test_scores: null,
            created_at: new Date('2024-01-01'),
            updated_at: new Date('2024-01-15'),
        };

        mockQuery.mockResolvedValueOnce([mockPlayerRow]);

        const result = await getPlayerProfileById(mockPlayerId);

        expect(result).not.toBeNull();
        expect(result?.initials).toBe('AR');
    });

    it('should set default values for missing optional fields', async () => {
        const mockPlayerId = 'test-player-id';
        const mockPlayerRow = {
            id: mockPlayerId,
            first_name: 'Test',
            last_name: 'Player',
            email: 'test@example.com',
            sex: 'Male',
            sport: 'Football',
            position: 'Running Back',
            gpa: '3.0',
            country: 'USA',
            state: 'Florida',
            region: null,
            scholarship_amount: null,
            test_scores: null,
            created_at: new Date('2024-01-01'),
            updated_at: new Date('2024-01-15'),
        };

        mockQuery.mockResolvedValueOnce([mockPlayerRow]);

        const result = await getPlayerProfileById(mockPlayerId);

        expect(result).not.toBeNull();
        expect(result?.classYear).toBe('');
        expect(result?.school).toBe('');
        expect(result?.height).toBe('');
        expect(result?.weight).toBe('');
        expect(result?.age).toBe(0);
        expect(result?.profileImage).toBe('');
        expect(result?.performanceMetrics).toEqual([]);
        expect(result?.academic.coursework).toEqual([]);
        expect(result?.contact.phone).toBe('');
        expect(result?.contact.socialMedia).toEqual({
            twitter: '',
            instagram: '',
            youtube: '',
            tiktok: '',
        });
        expect(result?.recruitmentStatus).toBe('open');
        expect(result?.commitmentStatus).toBeNull();
    });
});
