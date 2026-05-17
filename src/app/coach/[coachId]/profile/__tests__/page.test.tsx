import React from 'react';
import { render, screen } from '@testing-library/react';
import CoachProfilePage, { generateMetadata } from '../page';
import { cookies } from 'next/headers';
import { verifyToken } from '@/authentication/utils/jwt';
import { notFound } from 'next/navigation';

// Mock Next.js modules
jest.mock('next/headers', () => ({
    cookies: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    notFound: jest.fn(),
}));

jest.mock('@/authentication/utils/jwt', () => ({
    verifyToken: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

// Mock the DB query layer — page now calls getCoachProfileById directly
jest.mock('@/profile/coach/lib/db/queries', () => ({
    getCoachProfileById: jest.fn(),
}));

import { getCoachProfileById } from '@/profile/coach/lib/db/queries';
const mockGetCoachProfileById = getCoachProfileById as jest.MockedFunction<typeof getCoachProfileById>;

// Mock the CoachProfileView component
jest.mock('@/profile/coach/components/view/CoachProfileView', () => ({
    CoachProfileView: ({ coachId, currentUserId, initialData }: any) => (
        <div data-testid="coach-profile-view">
            <div data-testid="coach-id">{coachId}</div>
            <div data-testid="current-user-id">{currentUserId || 'none'}</div>
            <div data-testid="coach-name">{initialData.firstName} {initialData.lastName}</div>
            <div data-testid="coach-email">{initialData.email}</div>
        </div>
    ),
}));

const mockCoachData = {
    id: 'coach-123',
    firstName: 'John',
    lastName: 'Smith',
    initials: 'JS',
    email: 'john.smith@university.edu',
    phone: '+1-555-0123',
    university: 'State University',
    position: 'Head Coach',
    sport: 'Basketball',
    profileImage: undefined,
    teamWebsiteUrl: 'https://university.edu/basketball',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
};

describe('CoachProfilePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetCoachProfileById.mockResolvedValue(mockCoachData as any);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders the coach profile with authenticated coach owner', async () => {
        // Mock authenticated session
        const mockCookies = {
            get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        };
        (cookies as jest.Mock).mockResolvedValue(mockCookies);
        (verifyToken as jest.Mock).mockResolvedValue({
            playerId: 'coach-123',
            email: 'john.smith@university.edu',
            type: 'coach',
            iat: 1234567890,
            exp: 9999999999,
        });

        const params = Promise.resolve({ coachId: 'coach-123' });
        const page = await CoachProfilePage({ params });

        render(page);

        expect(screen.getByTestId('coach-profile-view')).toBeInTheDocument();
        expect(screen.getByTestId('coach-id')).toHaveTextContent('coach-123');
        expect(screen.getByTestId('current-user-id')).toHaveTextContent('coach-123');
        expect(screen.getByTestId('coach-name')).toHaveTextContent('John Smith');
    });

    it('renders the coach profile for unauthenticated user', async () => {
        // Mock no session
        const mockCookies = {
            get: jest.fn().mockReturnValue(undefined),
        };
        (cookies as jest.Mock).mockResolvedValue(mockCookies);

        const params = Promise.resolve({ coachId: 'coach-123' });
        const page = await CoachProfilePage({ params });

        render(page);

        expect(screen.getByTestId('coach-profile-view')).toBeInTheDocument();
        expect(screen.getByTestId('current-user-id')).toHaveTextContent('none');
    });

    it('renders the coach profile for authenticated non-owner', async () => {
        // Mock authenticated session with different user
        const mockCookies = {
            get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        };
        (cookies as jest.Mock).mockResolvedValue(mockCookies);
        (verifyToken as jest.Mock).mockResolvedValue({
            playerId: 'different-coach',
            email: 'other@university.edu',
            type: 'coach',
            iat: 1234567890,
            exp: 9999999999,
        });

        const params = Promise.resolve({ coachId: 'coach-123' });
        const page = await CoachProfilePage({ params });

        render(page);

        expect(screen.getByTestId('coach-profile-view')).toBeInTheDocument();
        expect(screen.getByTestId('current-user-id')).toHaveTextContent('different-coach');
    });

    it('calls notFound when coach profile is not found', async () => {
        mockGetCoachProfileById.mockResolvedValueOnce(null);

        const mockCookies = {
            get: jest.fn().mockReturnValue(undefined),
        };
        (cookies as jest.Mock).mockResolvedValue(mockCookies);

        const params = Promise.resolve({ coachId: 'non-existent' });

        await CoachProfilePage({ params });

        expect(notFound).toHaveBeenCalled();
    });

    it('ignores player tokens and treats as unauthenticated', async () => {
        // Mock authenticated session with player token
        const mockCookies = {
            get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        };
        (cookies as jest.Mock).mockResolvedValue(mockCookies);
        (verifyToken as jest.Mock).mockResolvedValue({
            playerId: 'player-123',
            email: 'player@university.edu',
            type: 'player',
            iat: 1234567890,
            exp: 9999999999,
        });

        const params = Promise.resolve({ coachId: 'coach-123' });
        const page = await CoachProfilePage({ params });

        render(page);

        expect(screen.getByTestId('coach-profile-view')).toBeInTheDocument();
        expect(screen.getByTestId('current-user-id')).toHaveTextContent('none');
    });
});

describe('generateMetadata', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetCoachProfileById.mockResolvedValue(mockCoachData as any);
    });

    it('generates metadata for existing coach', async () => {
        const params = Promise.resolve({ coachId: 'coach-123' });
        const metadata = await generateMetadata({ params });

        expect(metadata.title).toBe('John Smith - Coach Profile');
        expect(metadata.description).toContain('John Smith');
        expect(metadata.description).toContain('Head Coach');
        expect(metadata.description).toContain('State University');
    });

    it('generates not found metadata when coach does not exist', async () => {
        mockGetCoachProfileById.mockResolvedValueOnce(null);

        const params = Promise.resolve({ coachId: 'non-existent' });
        const metadata = await generateMetadata({ params });

        expect(metadata.title).toBe('Coach Profile Not Found');
        expect(metadata.description).toContain('could not be found');
    });
});
