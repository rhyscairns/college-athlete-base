import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CoachDashboardHeader } from '../CoachDashboardHeader';

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@/dashboard/common/components/InviteModal', () => ({
    InviteModal: ({ isOpen, onClose, promoCode }: { isOpen: boolean; onClose: () => void; promoCode: string | null }) =>
        isOpen ? (
            <div role="dialog" aria-modal="true" data-testid="invite-modal">
                <span data-testid="promo-code">{promoCode}</span>
                <button onClick={onClose}>Close</button>
            </div>
        ) : null,
}));

const mockStats = {
    success: true,
    data: {
        prospectsCount: 12,
        newPlayersToday: 5,
        scholarshipsAgreed: 3,
        playersReferred: 7,
        coachesReferred: 2,
        promoCode: 'COACH123',
    },
};

function mockFetch(data: object, ok = true): void {
    global.fetch = jest.fn().mockResolvedValue({
        ok,
        json: jest.fn().mockResolvedValue(data),
    } as unknown as Response);
}

afterEach(() => jest.restoreAllMocks());

// ── Rendering ────────────────────────────────────────────────────────────────

describe('CoachDashboardHeader', () => {
    it('renders the header landmark', () => {
        mockFetch(mockStats);
        render(<CoachDashboardHeader coachId="coach-1" />);
        expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('shows loading skeletons initially', () => {
        // Never resolves during this test
        global.fetch = jest.fn().mockReturnValue(new Promise(() => { }));
        render(<CoachDashboardHeader coachId="coach-1" />);
        // aria-busy tiles present
        const tiles = screen.getAllByRole('generic', { hidden: true });
        const busyTiles = tiles.filter(el => el.getAttribute('aria-busy') === 'true');
        expect(busyTiles.length).toBeGreaterThan(0);
    });

    it('renders all five stat tiles after fetch', async () => {
        mockFetch(mockStats);
        render(<CoachDashboardHeader coachId="coach-1" />);
        await waitFor(() => {
            expect(screen.getByText('Prospects')).toBeInTheDocument();
            expect(screen.getByText('New Players Today')).toBeInTheDocument();
            expect(screen.getByText('Scholarships Agreed')).toBeInTheDocument();
            expect(screen.getByText('Players Referred')).toBeInTheDocument();
            expect(screen.getByText('Coaches Referred')).toBeInTheDocument();
        });
    });

    it('fetches stats for the correct coachId', async () => {
        mockFetch(mockStats);
        render(<CoachDashboardHeader coachId="coach-abc" />);
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/coach/coach-abc/stats');
        });
    });

    it('renders gracefully when fetch fails', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
        render(<CoachDashboardHeader coachId="coach-1" />);
        // Should not throw; tiles render with 0 values
        await waitFor(() => {
            expect(screen.getByText('Prospects')).toBeInTheDocument();
        });
    });

    it('renders gracefully when API returns success: false', async () => {
        mockFetch({ success: false, error: 'Unauthorized' }, false);
        render(<CoachDashboardHeader coachId="coach-1" />);
        await waitFor(() => {
            expect(screen.getByText('Prospects')).toBeInTheDocument();
        });
    });
});

// ── prospectsCountOverride ───────────────────────────────────────────────────

describe('prospectsCountOverride', () => {
    it('uses override value instead of fetched prospectsCount', async () => {
        mockFetch(mockStats);
        render(<CoachDashboardHeader coachId="coach-1" prospectsCountOverride={99} />);
        // The count-up animation targets 99; after settling the aria-live span should show it
        await waitFor(() => {
            const liveRegions = screen.getAllByRole('generic', { hidden: true })
                .filter(el => el.getAttribute('aria-live') === 'polite');
            // At least one live region should eventually display 99
            expect(liveRegions.some(el => el.textContent === '99')).toBe(true);
        }, { timeout: 1500 });
    });
});

// ── Invite modal ─────────────────────────────────────────────────────────────

describe('InviteModal integration', () => {
    it('opens the invite modal when the banner button is clicked', async () => {
        mockFetch(mockStats);
        const user = userEvent.setup();
        render(<CoachDashboardHeader coachId="coach-1" />);

        await user.click(screen.getByRole('button', { name: /open invite link modal/i }));
        expect(screen.getByTestId('invite-modal')).toBeInTheDocument();
    });

    it('closes the invite modal when onClose is called', async () => {
        mockFetch(mockStats);
        const user = userEvent.setup();
        render(<CoachDashboardHeader coachId="coach-1" />);

        await user.click(screen.getByRole('button', { name: /open invite link modal/i }));
        await user.click(screen.getByRole('button', { name: /close/i }));
        expect(screen.queryByTestId('invite-modal')).not.toBeInTheDocument();
    });

    it('passes the promoCode from stats to InviteModal', async () => {
        mockFetch(mockStats);
        const user = userEvent.setup();
        render(<CoachDashboardHeader coachId="coach-1" />);

        // Wait for stats to load
        await waitFor(() => expect(global.fetch).toHaveBeenCalled());
        await user.click(screen.getByRole('button', { name: /open invite link modal/i }));

        await waitFor(() => {
            expect(screen.getByTestId('promo-code').textContent).toBe('COACH123');
        });
    });

    it('passes null promoCode when stats have not loaded', async () => {
        global.fetch = jest.fn().mockReturnValue(new Promise(() => { }));
        const user = userEvent.setup();
        render(<CoachDashboardHeader coachId="coach-1" />);

        await user.click(screen.getByRole('button', { name: /open invite link modal/i }));
        expect(screen.getByTestId('promo-code').textContent).toBe('');
    });
});

// ── Accessibility ────────────────────────────────────────────────────────────

describe('accessibility', () => {
    it('stat region has an accessible label', () => {
        mockFetch(mockStats);
        render(<CoachDashboardHeader coachId="coach-1" />);
        expect(screen.getByRole('region', { name: /recruitment statistics/i })).toBeInTheDocument();
    });

    it('invite button has a descriptive aria-label', () => {
        mockFetch(mockStats);
        render(<CoachDashboardHeader coachId="coach-1" />);
        expect(
            screen.getByRole('button', { name: /open invite link modal/i })
        ).toBeInTheDocument();
    });

    it('stat count spans have aria-live="polite"', async () => {
        mockFetch(mockStats);
        render(<CoachDashboardHeader coachId="coach-1" />);
        await waitFor(() => {
            const liveSpans = document.querySelectorAll('[aria-live="polite"]');
            expect(liveSpans.length).toBe(5);
        });
    });
});
