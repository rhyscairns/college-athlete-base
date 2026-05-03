/**
 * Shared test helpers for player profile integration tests
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
 * Helper to select a sport from the typeahead.
 * Clicks the input first to ensure focus is correct before typing.
 */
export async function selectSport(sportName: string, searchText: string) {
    const user = userEvent.setup();
    const sportInput = screen.getByLabelText(/sport/i);

    // Click first to ensure focus lands on the correct input
    await user.click(sportInput);
    await user.clear(sportInput);
    await user.type(sportInput, searchText);

    await waitFor(async () => {
        if (!screen.queryByRole('listbox')) {
            await user.click(sportInput);
        }
        expect(screen.getByRole('listbox')).toBeInTheDocument();
    }, { timeout: 3000 });

    const option = screen.getByRole('option', { name: new RegExp(sportName, 'i') });
    await user.click(option);

    return sportInput;
}

/**
 * Helper to select a position from the typeahead.
 * Clicks the input first to ensure focus is correct before typing.
 */
export async function selectPosition(positionName: string, searchText: string) {
    const user = userEvent.setup();

    // Wait for position input to become enabled after sport selection
    await waitFor(() => {
        const input = screen.getByLabelText(/position/i);
        expect(input).not.toBeDisabled();
    });

    const positionInput = screen.getByLabelText(/position/i);

    await user.click(positionInput);
    await user.clear(positionInput);
    await user.type(positionInput, searchText);

    await waitFor(() => {
        const listboxes = screen.getAllByRole('listbox');
        expect(listboxes.length).toBeGreaterThan(0);
    });

    const option = screen.getByRole('option', { name: new RegExp(`^${positionName}`, 'i') });
    await user.click(option);

    return positionInput;
}

/**
 * Helper to select an event from the typeahead.
 * Clicks the input first to ensure focus is correct before typing.
 */
export async function selectEvent(eventName: string, searchText: string) {
    const user = userEvent.setup();

    await waitFor(() => {
        expect(screen.getByLabelText(/event/i)).toBeInTheDocument();
    });

    const eventInput = screen.getByLabelText(/event/i);

    await user.click(eventInput);
    await user.clear(eventInput);
    await user.type(eventInput, searchText);

    await waitFor(() => {
        const listboxes = screen.getAllByRole('listbox');
        expect(listboxes.length).toBeGreaterThan(0);
    });

    const option = screen.getByRole('option', { name: new RegExp(`^${eventName}`, 'i') });
    await user.click(option);

    return eventInput;
}

/**
 * Helper to click the save button
 */
export async function clickSave() {
    const user = userEvent.setup();
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
}

/**
 * Helper to click the cancel button
 */
export async function clickCancel() {
    const user = userEvent.setup();
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
}
