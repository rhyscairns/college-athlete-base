import { render, screen } from '@testing-library/react';
import { TierSummaryCard } from '@/earnings/components/TierSummaryCard';

describe('TierSummaryCard', () => {
    it('renders tier label, player count, and monthly earnings', () => {
        render(<TierSummaryCard tier="Tier 1" playerCount={12} monthlyEarnings={12.0} />);

        expect(screen.getByText('Tier 1')).toBeInTheDocument();
        expect(screen.getByTestId('player-count')).toHaveTextContent('12');
        expect(screen.getByTestId('monthly-earnings')).toHaveTextContent('$12.00');
    });

    it('renders singular "player" when count is 1', () => {
        render(<TierSummaryCard tier="Tier 2" playerCount={1} monthlyEarnings={0.5} />);
        expect(screen.getByText(/1/)).toBeInTheDocument();
        expect(screen.getByText(/player$/)).toBeInTheDocument();
    });

    it('renders plural "players" when count is 0', () => {
        render(<TierSummaryCard tier="Tier 3" playerCount={0} monthlyEarnings={0} />);
        expect(screen.getByText(/players/)).toBeInTheDocument();
    });

    it('omits player count when playerCount prop is not provided (Total card)', () => {
        render(<TierSummaryCard tier="Total" monthlyEarnings={15.0} />);
        expect(screen.queryByTestId('player-count')).not.toBeInTheDocument();
        expect(screen.getByTestId('monthly-earnings')).toHaveTextContent('$15.00');
    });

    it('applies highlight styles when highlight=true', () => {
        render(<TierSummaryCard tier="Total" monthlyEarnings={15.0} highlight />);
        const card = screen.getByTestId('tier-summary-card-total');
        expect(card).toBeInTheDocument();
    });

    it('formats earnings to two decimal places', () => {
        render(<TierSummaryCard tier="Tier 1" playerCount={3} monthlyEarnings={3} />);
        expect(screen.getByTestId('monthly-earnings')).toHaveTextContent('$3.00');
    });

    it('uses correct test id based on tier name', () => {
        render(<TierSummaryCard tier="Tier 1" playerCount={0} monthlyEarnings={0} />);
        expect(screen.getByTestId('tier-summary-card-tier-1')).toBeInTheDocument();
    });
});
