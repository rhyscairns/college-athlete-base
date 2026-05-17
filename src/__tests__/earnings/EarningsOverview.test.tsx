import { render, screen } from '@testing-library/react';
import { EarningsOverview } from '@/earnings/components/EarningsOverview';
import type { EarningsData } from '@/earnings/types';

// Recharts ResizeObserver polyfill
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

const mockData: EarningsData = {
    tier1Players: [
        {
            playerId: 'p1',
            firstName: 'Alice',
            lastName: 'Smith',
            subscriptionStatus: 'active',
            subscriptionPlan: 'standard',
            monthlyContribution: 1.0,
            joinedAt: '2025-01-01T00:00:00Z',
        },
        {
            playerId: 'p2',
            firstName: 'Bob',
            lastName: 'Jones',
            subscriptionStatus: 'inactive',
            subscriptionPlan: 'promo_599',
            monthlyContribution: 0,
            joinedAt: '2025-02-01T00:00:00Z',
        },
    ],
    tier1Coaches: [],
    tier2: { playerCount: 5, activePlayerCount: 3, monthlyEarnings: 1.5 },
    tier3: { playerCount: 2, activePlayerCount: 1, monthlyEarnings: 0.25 },
    totalMonthlyEarnings: 2.75,
    monthlySeries: [],
};

describe('EarningsOverview', () => {
    it('renders without crashing', () => {
        render(<EarningsOverview data={mockData} basePath="/coach/123/earnings" />);
        expect(screen.getByTestId('earnings-overview')).toBeInTheDocument();
    });

    it('renders all four tier summary cards', () => {
        render(<EarningsOverview data={mockData} basePath="/coach/123/earnings" />);
        expect(screen.getByTestId('tier-summary-card-tier-1')).toBeInTheDocument();
        expect(screen.getByTestId('tier-summary-card-tier-2')).toBeInTheDocument();
        expect(screen.getByTestId('tier-summary-card-tier-3')).toBeInTheDocument();
        expect(screen.getByTestId('tier-summary-card-total')).toBeInTheDocument();
    });

    it('renders the breakdown link pointing to the correct path', () => {
        render(<EarningsOverview data={mockData} basePath="/coach/123/earnings" />);
        const link = screen.getByTestId('breakdown-link');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/coach/123/earnings/breakdown');
    });

    it('renders the breakdown link text', () => {
        render(<EarningsOverview data={mockData} basePath="/player/456/earnings" />);
        expect(screen.getByText('View full breakdown')).toBeInTheDocument();
    });

    it('renders charts section', () => {
        render(<EarningsOverview data={mockData} basePath="/coach/123/earnings" />);
        expect(screen.getByTestId('earnings-charts')).toBeInTheDocument();
    });

    it('shows total monthly earnings in the Total card', () => {
        render(<EarningsOverview data={mockData} basePath="/coach/123/earnings" />);
        const totalCard = screen.getByTestId('tier-summary-card-total');
        expect(totalCard).toHaveTextContent('$2.75');
    });

    it('counts only active tier-1 players for the Tier 1 card', () => {
        render(<EarningsOverview data={mockData} basePath="/coach/123/earnings" />);
        // mockData has 1 active + 1 inactive tier-1 player
        const tier1Card = screen.getByTestId('tier-summary-card-tier-1');
        expect(tier1Card).toHaveTextContent('1');
    });
});
