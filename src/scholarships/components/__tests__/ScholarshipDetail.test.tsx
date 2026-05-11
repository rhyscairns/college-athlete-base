import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScholarshipDetail } from '../ScholarshipDetail';
import type { Scholarship } from '../../types';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const baseScholarship: Scholarship = {
    id: 'sch-1',
    coachId: 'coach-1',
    playerId: 'player-1',
    status: 'pending',
    schoolName: 'State University',
    sport: 'Football',
    scholarshipAmount: 25000,
    requiredGpa: 3.0,
    division: 'NCAA D1',
    startYear: 2025,
    durationYears: 4,
    notes: 'Some notes',
    counterAmount: null,
    counterGpa: null,
    counterNotes: null,
    playerFirstName: 'Alex',
    playerLastName: 'Johnson',
    playerEmail: 'alex@example.com',
    coachFirstName: 'Coach',
    coachLastName: 'Smith',
    coachUniversity: 'State University',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe('ScholarshipDetail — pending status', () => {
    it('renders offer details', () => {
        render(
            <ScholarshipDetail
                scholarship={baseScholarship}
                playerId="player-1"
                coachId="coach-1"
                onStatusChange={jest.fn()}
            />
        );
        expect(screen.getByText('State University')).toBeInTheDocument();
        expect(screen.getByText('Football')).toBeInTheDocument();
        expect(screen.getByText('$25,000 / year')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('shows Accept, Reject, and Counter Offer buttons when pending', () => {
        render(
            <ScholarshipDetail
                scholarship={baseScholarship}
                playerId="player-1"
                coachId="coach-1"
                onStatusChange={jest.fn()}
            />
        );
        expect(screen.getByRole('button', { name: /accept scholarship offer/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /reject scholarship offer/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /counter scholarship offer/i })).toBeInTheDocument();
    });

    it('does not show status banner when pending', () => {
        render(
            <ScholarshipDetail
                scholarship={baseScholarship}
                playerId="player-1"
                coachId="coach-1"
                onStatusChange={jest.fn()}
            />
        );
        expect(screen.queryByTestId('status-banner-pending')).not.toBeInTheDocument();
    });

    it('calls accept API and updates UI on Accept click', async () => {
        const onStatusChange = jest.fn();
        const accepted = { ...baseScholarship, status: 'accepted' as const };
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: accepted }) });

        render(
            <ScholarshipDetail
                scholarship={baseScholarship}
                playerId="player-1"
                coachId="coach-1"
                onStatusChange={onStatusChange}
            />
        );

        await userEvent.click(screen.getByRole('button', { name: /accept scholarship offer/i }));

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/player/player-1/scholarships/coach-1',
                expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ status: 'accepted' }) })
            );
            expect(onStatusChange).toHaveBeenCalledWith(accepted);
        });
    });

    it('calls reject API and updates UI on Reject click', async () => {
        const onStatusChange = jest.fn();
        const rejected = { ...baseScholarship, status: 'rejected' as const };
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: rejected }) });

        render(
            <ScholarshipDetail
                scholarship={baseScholarship}
                playerId="player-1"
                coachId="coach-1"
                onStatusChange={onStatusChange}
            />
        );

        await userEvent.click(screen.getByRole('button', { name: /reject scholarship offer/i }));

        await waitFor(() => {
            expect(onStatusChange).toHaveBeenCalledWith(rejected);
        });
    });

    it('expands counter form on Counter Offer click', async () => {
        render(
            <ScholarshipDetail
                scholarship={baseScholarship}
                playerId="player-1"
                coachId="coach-1"
                onStatusChange={jest.fn()}
            />
        );

        await userEvent.click(screen.getByRole('button', { name: /counter scholarship offer/i }));
        expect(screen.getByTestId('counter-form')).toBeInTheDocument();
        expect(screen.queryByTestId('action-buttons')).not.toBeInTheDocument();
    });

    it('hides counter form on Cancel click', async () => {
        render(
            <ScholarshipDetail
                scholarship={baseScholarship}
                playerId="player-1"
                coachId="coach-1"
                onStatusChange={jest.fn()}
            />
        );

        await userEvent.click(screen.getByRole('button', { name: /counter scholarship offer/i }));
        await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
        expect(screen.queryByTestId('counter-form')).not.toBeInTheDocument();
        expect(screen.getByTestId('action-buttons')).toBeInTheDocument();
    });

    it('submits counter offer and calls onStatusChange', async () => {
        const onStatusChange = jest.fn();
        const countered = { ...baseScholarship, status: 'countered' as const, counterNotes: 'Need more' };
        mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: countered }) });

        render(
            <ScholarshipDetail
                scholarship={baseScholarship}
                playerId="player-1"
                coachId="coach-1"
                onStatusChange={onStatusChange}
            />
        );

        await userEvent.click(screen.getByRole('button', { name: /counter scholarship offer/i }));
        await userEvent.type(screen.getByLabelText(/counter notes/i), 'Need more');
        await userEvent.click(screen.getByRole('button', { name: /send counter/i }));

        await waitFor(() => {
            expect(onStatusChange).toHaveBeenCalledWith(countered);
        });
    });
});

describe('ScholarshipDetail — accepted status', () => {
    it('shows accepted status banner', () => {
        render(
            <ScholarshipDetail
                scholarship={{ ...baseScholarship, status: 'accepted' }}
                playerId="player-1"
                coachId="coach-1"
                onStatusChange={jest.fn()}
            />
        );
        expect(screen.getByTestId('status-banner-accepted')).toBeInTheDocument();
        expect(screen.getByText(/scholarship accepted/i)).toBeInTheDocument();
    });

    it('hides action buttons when accepted', () => {
        render(
            <ScholarshipDetail
                scholarship={{ ...baseScholarship, status: 'accepted' }}
                playerId="player-1"
                coachId="coach-1"
                onStatusChange={jest.fn()}
            />
        );
        expect(screen.queryByTestId('action-buttons')).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /accept/i })).not.toBeInTheDocument();
    });
});

describe('ScholarshipDetail — rejected status', () => {
    it('shows rejected status banner', () => {
        render(
            <ScholarshipDetail
                scholarship={{ ...baseScholarship, status: 'rejected' }}
                playerId="player-1"
                coachId="coach-1"
                onStatusChange={jest.fn()}
            />
        );
        expect(screen.getByTestId('status-banner-rejected')).toBeInTheDocument();
        expect(screen.getByText(/scholarship rejected/i)).toBeInTheDocument();
    });

    it('hides action buttons when rejected', () => {
        render(
            <ScholarshipDetail
                scholarship={{ ...baseScholarship, status: 'rejected' }}
                playerId="player-1"
                coachId="coach-1"
                onStatusChange={jest.fn()}
            />
        );
        expect(screen.queryByTestId('action-buttons')).not.toBeInTheDocument();
    });
});

describe('ScholarshipDetail — countered status', () => {
    it('shows countered status banner', () => {
        render(
            <ScholarshipDetail
                scholarship={{ ...baseScholarship, status: 'countered' }}
                playerId="player-1"
                coachId="coach-1"
                onStatusChange={jest.fn()}
            />
        );
        expect(screen.getByTestId('status-banner-countered')).toBeInTheDocument();
        expect(screen.getByText(/awaiting coach response/i)).toBeInTheDocument();
    });

    it('hides action buttons when countered', () => {
        render(
            <ScholarshipDetail
                scholarship={{ ...baseScholarship, status: 'countered' }}
                playerId="player-1"
                coachId="coach-1"
                onStatusChange={jest.fn()}
            />
        );
        expect(screen.queryByTestId('action-buttons')).not.toBeInTheDocument();
    });

    it('displays counter notes when present', () => {
        render(
            <ScholarshipDetail
                scholarship={{ ...baseScholarship, status: 'countered', counterNotes: 'I need more funding' }}
                playerId="player-1"
                coachId="coach-1"
                onStatusChange={jest.fn()}
            />
        );
        expect(screen.getByText('I need more funding')).toBeInTheDocument();
    });
});
