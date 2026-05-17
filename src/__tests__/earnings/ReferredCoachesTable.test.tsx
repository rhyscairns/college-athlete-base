import { render, screen } from '@testing-library/react';
import { ReferredCoachesTable } from '@/earnings/components/ReferredCoachesTable';
import type { ReferredCoach } from '@/earnings/types';

const mockCoach: ReferredCoach = {
    coachId: 'c1',
    firstName: 'Jane',
    lastName: 'Doe',
    joinedAt: '2025-03-10T00:00:00Z',
    directPlayerReferrals: 7,
    directCoachReferrals: 2,
};

describe('ReferredCoachesTable', () => {
    it('renders empty state when no coaches', () => {
        render(<ReferredCoachesTable coaches={[]} />);
        expect(screen.getByTestId('referred-coaches-empty')).toBeInTheDocument();
        expect(screen.getByText(/No referred coaches yet/)).toBeInTheDocument();
    });

    it('renders coach row with correct name', () => {
        render(<ReferredCoachesTable coaches={[mockCoach]} />);
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('coach name links to their profile', () => {
        render(<ReferredCoachesTable coaches={[mockCoach]} />);
        const link = screen.getByRole('link', { name: /View profile for Jane Doe/ });
        expect(link).toHaveAttribute('href', '/coach/c1/profile');
    });

    it('renders player referral count', () => {
        render(<ReferredCoachesTable coaches={[mockCoach]} />);
        expect(screen.getByTestId('player-referrals-c1')).toHaveTextContent('7');
    });

    it('renders coach referral count', () => {
        render(<ReferredCoachesTable coaches={[mockCoach]} />);
        expect(screen.getByTestId('coach-referrals-c1')).toHaveTextContent('2');
    });

    it('renders multiple coach rows', () => {
        const second: ReferredCoach = { ...mockCoach, coachId: 'c2', firstName: 'Tom', lastName: 'Brown' };
        render(<ReferredCoachesTable coaches={[mockCoach, second]} />);
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        expect(screen.getByText('Tom Brown')).toBeInTheDocument();
    });

    it('renders column headers', () => {
        render(<ReferredCoachesTable coaches={[mockCoach]} />);
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Joined')).toBeInTheDocument();
        expect(screen.getByText('Their player referrals')).toBeInTheDocument();
        expect(screen.getByText('Their coach referrals')).toBeInTheDocument();
    });
});
