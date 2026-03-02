/**
 * Tests for coach profile database query utilities
 */

import { getCoachProfileById, updateCoachProfile } from '../index';
import { query } from '@/authentication/db/client';
import { logger } from '@/lib/logger';

// Mock dependencies
jest.mock('@/authentication/db/client');
jest.mock('@/lib/logger');

const mockQuery = query as jest.MockedFunction<typeof query>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('getCoachProfileById', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch and transform coach profile data successfully', async () => {
        const mockCoachId = 'test-coach-id';
        const mockCoachRow = {
            id: mockCoachId,
            first_name: 'John',
            last_name: 'Smith',
            email: 'john.smith@university.edu',
            phone: '+1-555-0123',
            current_organization: 'State University',
            position_title: 'Head Coach',
            sport: 'Basketball',
            profile_image_url: 'https://example.com/profile.jpg',
            team_website_url: 'https://university.edu/basketball',
            created_at: new Date('2024-01-01'),
            updated_at: new Date('2024-01-15'),
        };

        mockQuery.mockResolvedValueOnce([mockCoachRow]);

        const result = await getCoachProfileById(mockCoachId);

        expect(result).not.toBeNull();
        expect(result?.id).toBe(mockCoachId);
        expect(result?.firstName).toBe('John');
        expect(result?.lastName).toBe('Smith');
        expect(result?.initials).toBe('JS');
        expect(result?.email).toBe('john.smith@university.edu');
        expect(result?.phone).toBe('+1-555-0123');
        expect(result?.university).toBe('State University');
        expect(result?.position).toBe('Head Coach');
        expect(result?.sport).toBe('Basketball');
        expect(result?.profileImage).toBe('https://example.com/profile.jpg');
        expect(result?.teamWebsiteUrl).toBe('https://university.edu/basketball');
        expect(result?.createdAt).toEqual(new Date('2024-01-01'));
        expect(result?.updatedAt).toEqual(new Date('2024-01-15'));

        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('SELECT'),
            [mockCoachId]
        );
    });

    it('should return null when coach is not found', async () => {
        const mockCoachId = 'non-existent-coach';
        mockQuery.mockResolvedValueOnce([]);

        const result = await getCoachProfileById(mockCoachId);

        expect(result).toBeNull();
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('SELECT'),
            [mockCoachId]
        );
        expect(mockLogger.debug).toHaveBeenCalledWith('Coach not found', { coachId: mockCoachId });
    });

    it('should handle null optional fields appropriately', async () => {
        const mockCoachId = 'test-coach-id';
        const mockCoachRow = {
            id: mockCoachId,
            first_name: 'Jane',
            last_name: 'Doe',
            email: 'jane.doe@university.edu',
            phone: null,
            current_organization: null,
            position_title: null,
            sport: null,
            profile_image_url: null,
            team_website_url: null,
            created_at: new Date('2024-01-01'),
            updated_at: new Date('2024-01-15'),
        };

        mockQuery.mockResolvedValueOnce([mockCoachRow]);

        const result = await getCoachProfileById(mockCoachId);

        expect(result).not.toBeNull();
        expect(result?.phone).toBeUndefined();
        expect(result?.university).toBeUndefined();
        expect(result?.position).toBeUndefined();
        expect(result?.sport).toBeUndefined();
        expect(result?.profileImage).toBeUndefined();
        expect(result?.teamWebsiteUrl).toBeUndefined();
    });

    it('should generate correct initials from first and last name', async () => {
        const mockCoachId = 'test-coach-id';
        const mockCoachRow = {
            id: mockCoachId,
            first_name: 'alexander',
            last_name: 'rodriguez',
            email: 'alex.rodriguez@university.edu',
            phone: null,
            current_organization: null,
            position_title: null,
            sport: null,
            profile_image_url: null,
            team_website_url: null,
            created_at: new Date('2024-01-01'),
            updated_at: new Date('2024-01-15'),
        };

        mockQuery.mockResolvedValueOnce([mockCoachRow]);

        const result = await getCoachProfileById(mockCoachId);

        expect(result).not.toBeNull();
        expect(result?.initials).toBe('AR');
    });

    it('should throw error when database query fails', async () => {
        const mockCoachId = 'test-coach-id';
        const mockError = new Error('Database connection failed');
        mockQuery.mockRejectedValueOnce(mockError);

        await expect(getCoachProfileById(mockCoachId)).rejects.toThrow('Failed to fetch coach profile');

        expect(mockLogger.error).toHaveBeenCalledWith(
            'Failed to fetch coach profile',
            { coachId: mockCoachId },
            mockError
        );
    });
});

describe('updateCoachProfile', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should update coach profile successfully with all fields', async () => {
        const mockCoachId = 'test-coach-id';
        const updates = {
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@university.edu',
            phone: '+1-555-0123',
            university: 'State University',
            position: 'Head Coach',
            sport: 'Basketball',
            profileImage: 'https://example.com/profile.jpg',
            teamWebsiteUrl: 'https://university.edu/basketball',
        };

        const mockUpdatedRow = {
            id: mockCoachId,
            first_name: 'John',
            last_name: 'Smith',
            email: 'john.smith@university.edu',
            phone: '+1-555-0123',
            current_organization: 'State University',
            position_title: 'Head Coach',
            sport: 'Basketball',
            profile_image_url: 'https://example.com/profile.jpg',
            team_website_url: 'https://university.edu/basketball',
            created_at: new Date('2024-01-01'),
            updated_at: new Date('2024-01-15'),
        };

        mockQuery.mockResolvedValueOnce([mockUpdatedRow]);

        const result = await updateCoachProfile(mockCoachId, updates);

        expect(result).not.toBeNull();
        expect(result.id).toBe(mockCoachId);
        expect(result.firstName).toBe('John');
        expect(result.lastName).toBe('Smith');
        expect(result.email).toBe('john.smith@university.edu');
        expect(result.phone).toBe('+1-555-0123');
        expect(result.university).toBe('State University');
        expect(result.position).toBe('Head Coach');
        expect(result.sport).toBe('Basketball');
        expect(result.profileImage).toBe('https://example.com/profile.jpg');
        expect(result.teamWebsiteUrl).toBe('https://university.edu/basketball');

        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE coaches'),
            expect.arrayContaining([...Object.values(updates), mockCoachId])
        );
    });

    it('should update coach profile with partial data', async () => {
        const mockCoachId = 'test-coach-id';
        const updates = {
            phone: '+1-555-9999',
            position: 'Assistant Coach',
        };

        const mockUpdatedRow = {
            id: mockCoachId,
            first_name: 'Jane',
            last_name: 'Doe',
            email: 'jane.doe@university.edu',
            phone: '+1-555-9999',
            current_organization: 'State University',
            position_title: 'Assistant Coach',
            sport: 'Basketball',
            profile_image_url: null,
            team_website_url: null,
            created_at: new Date('2024-01-01'),
            updated_at: new Date('2024-01-15'),
        };

        mockQuery.mockResolvedValueOnce([mockUpdatedRow]);

        const result = await updateCoachProfile(mockCoachId, updates);

        expect(result).not.toBeNull();
        expect(result.phone).toBe('+1-555-9999');
        expect(result.position).toBe('Assistant Coach');

        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE coaches'),
            expect.arrayContaining(['+1-555-9999', 'Assistant Coach', mockCoachId])
        );
    });

    it('should handle undefined values by setting them to null in database', async () => {
        const mockCoachId = 'test-coach-id';
        const updates = {
            phone: undefined,
            teamWebsiteUrl: undefined,
        };

        const mockUpdatedRow = {
            id: mockCoachId,
            first_name: 'John',
            last_name: 'Smith',
            email: 'john.smith@university.edu',
            phone: null,
            current_organization: 'State University',
            position_title: 'Head Coach',
            sport: 'Basketball',
            profile_image_url: 'https://example.com/profile.jpg',
            team_website_url: null,
            created_at: new Date('2024-01-01'),
            updated_at: new Date('2024-01-15'),
        };

        mockQuery.mockResolvedValueOnce([mockUpdatedRow]);

        const result = await updateCoachProfile(mockCoachId, updates);

        expect(result).not.toBeNull();
        expect(result.phone).toBeUndefined();
        expect(result.teamWebsiteUrl).toBeUndefined();

        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('UPDATE coaches'),
            expect.arrayContaining([null, null, mockCoachId])
        );
    });

    it('should return current profile when no fields to update', async () => {
        const mockCoachId = 'test-coach-id';
        const updates = {};

        const mockCoachRow = {
            id: mockCoachId,
            first_name: 'John',
            last_name: 'Smith',
            email: 'john.smith@university.edu',
            phone: '+1-555-0123',
            current_organization: 'State University',
            position_title: 'Head Coach',
            sport: 'Basketball',
            profile_image_url: 'https://example.com/profile.jpg',
            team_website_url: 'https://university.edu/basketball',
            created_at: new Date('2024-01-01'),
            updated_at: new Date('2024-01-15'),
        };

        mockQuery.mockResolvedValueOnce([mockCoachRow]);

        const result = await updateCoachProfile(mockCoachId, updates);

        expect(result).not.toBeNull();
        expect(result.id).toBe(mockCoachId);

        // Should call SELECT query, not UPDATE
        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('SELECT'),
            [mockCoachId]
        );
    });

    it('should throw error when coach not found', async () => {
        const mockCoachId = 'non-existent-coach';
        const updates = {
            phone: '+1-555-0123',
        };

        mockQuery.mockResolvedValueOnce([]);

        await expect(updateCoachProfile(mockCoachId, updates)).rejects.toThrow('Coach not found');

        expect(mockLogger.error).toHaveBeenCalledWith(
            'Coach not found for update',
            { coachId: mockCoachId }
        );
    });

    it('should throw error when database update fails', async () => {
        const mockCoachId = 'test-coach-id';
        const updates = {
            email: 'new.email@university.edu',
        };
        const mockError = new Error('Database connection failed');

        mockQuery.mockRejectedValueOnce(mockError);

        await expect(updateCoachProfile(mockCoachId, updates)).rejects.toThrow('Failed to update coach profile');

        expect(mockLogger.error).toHaveBeenCalledWith(
            'Failed to update coach profile',
            { coachId: mockCoachId },
            mockError
        );
    });

    it('should include updated_at in UPDATE query', async () => {
        const mockCoachId = 'test-coach-id';
        const updates = {
            firstName: 'UpdatedName',
        };

        const mockUpdatedRow = {
            id: mockCoachId,
            first_name: 'UpdatedName',
            last_name: 'Smith',
            email: 'john.smith@university.edu',
            phone: null,
            current_organization: null,
            position_title: null,
            sport: null,
            profile_image_url: null,
            team_website_url: null,
            created_at: new Date('2024-01-01'),
            updated_at: new Date('2024-01-15'),
        };

        mockQuery.mockResolvedValueOnce([mockUpdatedRow]);

        await updateCoachProfile(mockCoachId, updates);

        expect(mockQuery).toHaveBeenCalledWith(
            expect.stringContaining('updated_at = NOW()'),
            expect.any(Array)
        );
    });
});
