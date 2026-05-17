/**
 * Shared test helpers for player profile integration tests
 */

import { screen, waitFor, fireEvent } from '@testing-library/react';
import type { PlayerProfile } from '@/profile/player/types';

/**
 * Creates a mock player profile for testing
 */
export function createMockPlayerProfile(overrides?: Partial<PlayerProfile>): PlayerProfile {
    return {
        id: '123e4567-e89b-12d3-a456-426614174000',
        firstName: 'John',
        lastName: 'Doe',
        initials: 'JD',
        classYear: '2025',
        position: 'Point Guard',
        sport: 'Basketball',
        school: 'Test High School',
        location: 'California, USA',
        height: '6\'2"',
        weight: '185 lbs',
        age: 18,
        profileImage: '',
        performanceMetrics: [],
        academic: {
            ncaaEligibilityCenter: 'Certified',
            ncaaQualifier: true,
            gpa: 3.8,
            gpaScale: '4.0 Scale',
            satScore: 1200,
            satMath: 600,
            satReading: 600,
            classRank: '10/250',
            classRankDetail: 'Top 4%',
            coursework: [],
        },
        videos: [],
        coachTestimonials: [],
        achievements: [],
        contact: {
            email: 'john.doe@example.com',
            phone: '',
            parentGuardianName: '',
            parentGuardianPhone: '',
            parentGuardianEmail: '',
            socialMedia: {
                twitter: '',
                instagram: '',
                youtube: '',
                tiktok: '',
            },
            preferredContactMethod: '',
            headCoach: {
                name: '',
                email: '',
                phone: '',
            },
        },
        stats: {},
        recruitmentStatus: 'open',
        commitmentStatus: null,
        ...overrides,
    };
}

/**
 * Helper to select a sport from the typeahead using fireEvent (timer-safe).
 */
export async function selectSport(sportName: string, searchText: string) {
    const sportInput = screen.getByLabelText(/sport/i);

    fireEvent.focus(sportInput);
    fireEvent.change(sportInput, { target: { value: searchText } });

    await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
    }, { timeout: 3000 });

    const option = screen.getByRole('option', { name: new RegExp(sportName, 'i') });
    fireEvent.click(option);

    return sportInput;
}

/**
 * Helper to click the save button
 */
export async function clickSave() {
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
}

/**
 * Helper to click the cancel button
 */
export async function clickCancel() {
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
}
