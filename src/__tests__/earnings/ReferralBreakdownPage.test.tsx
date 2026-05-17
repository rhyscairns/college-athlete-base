import { render, screen } from '@testing-library/react';
import { ReferralBreakdownPage } from '@/earnings/components/ReferralBreakdownPage';
import type { EarningsData } from '@/earnings/types';

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
    ],
    tier1Coaches: [
        {
            coachId: 'c1',
            firstName: 'Jane',
            lastName: 'Doe',
            joinedAt: '2025-02-01T00:00:00Z',
            directPlayerReferrals: 4,
            directCoachReferrals: 1,
        },
    ],
    tier2: { playerCount: 5, activePlayerCount: 3, monthlyEarnings: 1.5 },
    tier3: { playerCount: 2, activePlayerCount: 1, monthlyEarnings: 0.25 },
    totalMonthlyEarnings: 2.75,
    monthlySeries: [],
};

const emptyData: EarningsData = {
    tier1Players: [],
    tier1Coaches: [],
    tier2: { playerCount: 0, activePlayerCount: 0, monthlyEarnings: 0 },
    tier3: { playerCount: 0, activePlayerCount: 0, monthlyEarnings: 0 },
    totalMonthlyEarnings: 0,
    monthlySeries: [],
};

describe('ReferralBreakdownPage', () => {
    it('renders without crashing', () => {
        render(<ReferralBreakdownPage data={mockData} />);
        expect(screen.getByTestId('referral-breakdown-page')).toBeInTheDocument();
    });

    it('renders the tier-1 players section heading', () => {
        render(<ReferralBreakdownPage data={mockData} />);
        expect(screen.getByText('Direct referrals — Players')).toBeInTheDocument();
    });

    it('renders the tier-1 coaches section heading', () => {
        render(<ReferralBreakdownPage data={mockData} />);
        expect(screen.getByText('Direct referrals — Coaches')).toBeInTheDocument();
    });

    it('renders the indirect referrals section heading', () => {
        render(<ReferralBreakdownPage data={mockData} />);
        expect(screen.getByText('Indirect referrals')).toBeInTheDocument();
    });

    it('renders tier-1 player data', () => {
        render(<ReferralBreakdownPage data={mockData} />);
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    });

    it('renders tier-1 coach data', () => {
        render(<ReferralBreakdownPage data={mockData} />);
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('renders tier-2 and tier-3 summary cards', () => {
        render(<ReferralBreakdownPage data={mockData} />);
        expect(screen.getByTestId('tier-summary-card-tier-2')).toBeInTheDocument();
        expect(screen.getByTestId('tier-summary-card-tier-3')).toBeInTheDocument();
    });

    it('shows empty states when no referrals', () => {
        render(<ReferralBreakdownPage data={emptyData} />);
        expect(screen.getByTestId('referred-players-empty')).toBeInTheDocument();
        expect(screen.getByTestId('referred-coaches-empty')).toBeInTheDocument();
    });

    it('shows correct tier-2 earnings in summary card', () => {
        render(<ReferralBreakdownPage data={mockData} />);
        const tier2Card = screen.getByTestId('tier-summary-card-tier-2');
        expect(tier2Card).toHaveTextContent('$1.50');
    });

    it('shows correct tier-3 earnings in summary card', () => {
        render(<ReferralBreakdownPage data={mockData} />);
        const tier3Card = screen.getByTestId('tier-summary-card-tier-3');
        expect(tier3Card).toHaveTextContent('$0.25');
    });
});
