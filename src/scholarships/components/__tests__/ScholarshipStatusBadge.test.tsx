import { render, screen } from '@testing-library/react';
import { ScholarshipStatusBadge } from '../ScholarshipStatusBadge';

describe('ScholarshipStatusBadge', () => {
    it('renders "Pending" label for pending status', () => {
        render(<ScholarshipStatusBadge status="pending" />);
        expect(screen.getByTestId('status-badge-pending')).toHaveTextContent('Pending');
    });

    it('renders "Accepted" label for accepted status', () => {
        render(<ScholarshipStatusBadge status="accepted" />);
        expect(screen.getByTestId('status-badge-accepted')).toHaveTextContent('Accepted');
    });

    it('renders "Rejected" label for rejected status', () => {
        render(<ScholarshipStatusBadge status="rejected" />);
        expect(screen.getByTestId('status-badge-rejected')).toHaveTextContent('Rejected');
    });

    it('renders "Countered" label for countered status', () => {
        render(<ScholarshipStatusBadge status="countered" />);
        expect(screen.getByTestId('status-badge-countered')).toHaveTextContent('Countered');
    });

    it('applies amber styling for pending status', () => {
        render(<ScholarshipStatusBadge status="pending" />);
        const badge = screen.getByTestId('status-badge-pending');
        expect(badge.style.color).toContain('oklch');
    });

    it('applies green styling for accepted status', () => {
        render(<ScholarshipStatusBadge status="accepted" />);
        const badge = screen.getByTestId('status-badge-accepted');
        expect(badge.style.color).toContain('oklch');
    });

    it('applies danger styling for rejected status', () => {
        render(<ScholarshipStatusBadge status="rejected" />);
        const badge = screen.getByTestId('status-badge-rejected');
        expect(badge.style.color).toBe('var(--status-danger)');
    });

    it('applies amber styling for countered status', () => {
        render(<ScholarshipStatusBadge status="countered" />);
        const badge = screen.getByTestId('status-badge-countered');
        expect(badge.style.color).toContain('oklch');
    });
});
