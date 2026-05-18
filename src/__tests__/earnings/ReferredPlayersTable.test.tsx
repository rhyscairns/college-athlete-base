import { render, screen } from '@testing-library/react';
import { ReferredPlayersTable } from '@/earnings/components/ReferredPlayersTable';
import type { ReferredPlayer } from '@/earnings/types';

const activePlayer: ReferredPlayer = {
    playerId: 'p1',
    firstName: 'Alice',
    lastName: 'Smith',
    subscriptionStatus: 'active',
    subscriptionPlan: 'standard',
    monthlyContribution: 1.0,
    joinedAt: '2025-01-15T00:00:00Z',
};

const inactivePlayer: ReferredPlayer = {
    playerId: 'p2',
    firstName: 'Bob',
    lastName: 'Jones',
    subscriptionStatus: 'inactive',
    subscriptionPlan: 'promo_599',
    monthlyContribution: 0,
    joinedAt: '2025-02-20T00:00:00Z',
};

describe('ReferredPlayersTable', () => {
    it('renders empty state when no players', () => {
        render(<ReferredPlayersTable players={[]} />);
        expect(screen.getByTestId('referred-players-empty')).toBeInTheDocument();
        expect(screen.getByText(/No referred players yet/)).toBeInTheDocument();
    });

    it('renders active player row with correct data', () => {
        render(<ReferredPlayersTable players={[activePlayer]} />);

        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
        expect(screen.getByTestId('status-badge-p1')).toHaveTextContent('Active');
        expect(screen.getByText('Standard ($9.99)')).toBeInTheDocument();
        expect(screen.getByTestId('contribution-p1')).toHaveTextContent('$1.00');
    });

    it('active player name is displayed as plain text', () => {
        render(<ReferredPlayersTable players={[activePlayer]} />);
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /View profile for Alice Smith/ })).not.toBeInTheDocument();
    });

    it('renders inactive player row with $0.00 contribution', () => {
        render(<ReferredPlayersTable players={[inactivePlayer]} />);

        expect(screen.getByText('Bob Jones')).toBeInTheDocument();
        expect(screen.getByTestId('status-badge-p2')).toHaveTextContent('Inactive');
        expect(screen.getByTestId('contribution-p2')).toHaveTextContent('$0.00');
    });

    it('inactive row is visually dimmed (opacity 0.45)', () => {
        render(<ReferredPlayersTable players={[inactivePlayer]} />);
        const row = screen.getByTestId('player-row-p2');
        expect(row).toHaveStyle({ opacity: 0.45 });
    });

    it('active row has full opacity', () => {
        render(<ReferredPlayersTable players={[activePlayer]} />);
        const row = screen.getByTestId('player-row-p1');
        expect(row).toHaveStyle({ opacity: 1 });
    });

    it('renders multiple players', () => {
        render(<ReferredPlayersTable players={[activePlayer, inactivePlayer]} />);
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    });

    it('renders promo plan labels correctly', () => {
        render(<ReferredPlayersTable players={[inactivePlayer]} />);
        expect(screen.getByText('Promo ($5.99)')).toBeInTheDocument();
    });
});
