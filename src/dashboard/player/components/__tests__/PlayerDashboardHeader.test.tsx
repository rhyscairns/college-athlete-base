import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerDashboardHeader } from '../PlayerDashboardHeader';

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
        profileViews: 42,
        coachesFavorited: 8,
        playersReferred: 5,
        coachesReferred: 3,
        promoCode: 'PLAYER123',
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

describe('PlayerDashboardHeader', () => {
    it('renders the header landmark', () => {
        mockFetch(mockStats);
        render(<PlayerDashboardHeader playerId="player-1" />);
        expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('shows loading skeletons initially', () => {
        global.fetch = jest.fn().mockReturnValue(new Promise(() => { }));
        render(<PlayerDashboardHeader playerId="player-1" />);
        const busyTiles = document.querySelectorAll('[aria-busy="true"]');
        expect(busyTiles.length).toBeGreaterThan(0);
    });

    it('renders all four stat tiles after fetch', async () => {
        mockFetch(mockStats);
        render(<PlayerDashboardHeader playerId="player-1" />);
        await waitFor(() => {
            expect(screen.getByText('Profile Views')).toBeInTheDocument();
            expect(screen.getByText('Coaches Interested')).toBeInTheDocument();
            expect(screen.getByText('Players Referred')).toBeInTheDocument();
            expect(screen.getByText('Coaches Referred')).toBeInTheDocument();
        });
    });

    it('fetches stats for the correct playerId', async () => {
        mockFetch(mockStats);
        render(<PlayerDashboardHeader playerId="player-abc" />);
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/player/player-abc/stats');
        });
    });

    it('renders gracefully when fetch fails', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
        render(<PlayerDashboardHeader playerId="player-1" />);
        await waitFor(() => {
            expect(screen.getByText('Profile Views')).toBeInTheDocument();
        });
    });

    it('renders gracefully when API returns success: false', async () => {
        mockFetch({ success: false, error: 'Unauthorized' }, false);
        render(<PlayerDashboardHeader playerId="player-1" />);
        await waitFor(() => {
            expect(screen.getByText('Profile Views')).toBeInTheDocument();
        });
    });
});

// ── Invite modal ─────────────────────────────────────────────────────────────

describe('InviteModal integration', () => {
    it('opens the invite modal when the banner button is clicked', async () => {
        mockFetch(mockStats);
        const user = userEvent.setup();
        render(<PlayerDashboardHeader playerId="player-1" />);

        await user.click(screen.getByRole('button', { name: /open invite link modal/i }));
        expect(screen.getByTestId('invite-modal')).toBeInTheDocument();
    });

    it('closes the invite modal when onClose is called', async () => {
        mockFetch(mockStats);
        const user = userEvent.setup();
        render(<PlayerDashboardHeader playerId="player-1" />);

        await user.click(screen.getByRole('button', { name: /open invite link modal/i }));
        await user.click(screen.getByRole('button', { name: /close/i }));
        expect(screen.queryByTestId('invite-modal')).not.toBeInTheDocument();
    });

    it('passes the promoCode from stats to InviteModal', async () => {
        mockFetch(mockStats);
        const user = userEvent.setup();
        render(<PlayerDashboardHeader playerId="player-1" />);

        await waitFor(() => expect(global.fetch).toHaveBeenCalled());
        await user.click(screen.getByRole('button', { name: /open invite link modal/i }));

        await waitFor(() => {
            expect(screen.getByTestId('promo-code').textContent).toBe('PLAYER123');
        });
    });

    it('passes null promoCode when stats have not loaded', async () => {
        global.fetch = jest.fn().mockReturnValue(new Promise(() => { }));
        const user = userEvent.setup();
        render(<PlayerDashboardHeader playerId="player-1" />);

        await user.click(screen.getByRole('button', { name: /open invite link modal/i }));
        expect(screen.getByTestId('promo-code').textContent).toBe('');
    });
});

// ── Accessibility ─────────────────────────────────────────────────────────────

describe('accessibility', () => {
    it('stat region has an accessible label', () => {
        mockFetch(mockStats);
        render(<PlayerDashboardHeader playerId="player-1" />);
        expect(screen.getByRole('region', { name: /profile statistics/i })).toBeInTheDocument();
    });

    it('invite button has a descriptive aria-label', () => {
        mockFetch(mockStats);
        render(<PlayerDashboardHeader playerId="player-1" />);
        expect(
            screen.getByRole('button', { name: /open invite link modal/i })
        ).toBeInTheDocument();
    });

    it('stat count spans have aria-live="polite"', async () => {
        mockFetch(mockStats);
        render(<PlayerDashboardHeader playerId="player-1" />);
        await waitFor(() => {
            const liveSpans = document.querySelectorAll('[aria-live="polite"]');
            expect(liveSpans.length).toBe(4);
        });
    });

    it('has data-testid for integration targeting', () => {
        mockFetch(mockStats);
        render(<PlayerDashboardHeader playerId="player-1" />);
        expect(screen.getByTestId('player-dashboard-header')).toBeInTheDocument();
    });
});
