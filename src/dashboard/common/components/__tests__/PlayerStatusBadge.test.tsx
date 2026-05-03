import React from 'react';
import { render, screen } from '@testing-library/react';
import { PlayerStatusBadge } from '../PlayerStatusBadge';

describe('PlayerStatusBadge', () => {
    describe('Rendering', () => {
        it('should render available status badge', () => {
            render(<PlayerStatusBadge status="available" />);

            const badge = screen.getByText('Available');
            expect(badge).toBeInTheDocument();
        });

        it('should render interested status badge', () => {
            render(<PlayerStatusBadge status="interested" />);

            const badge = screen.getByText('Interested');
            expect(badge).toBeInTheDocument();
        });

        it('should render contacted status badge', () => {
            render(<PlayerStatusBadge status="contacted" />);

            const badge = screen.getByText('Contacted');
            expect(badge).toBeInTheDocument();
        });

        it('should render with role="status"', () => {
            render(<PlayerStatusBadge status="available" />);

            const badge = screen.getByRole('status');
            expect(badge).toBeInTheDocument();
        });

        it('should render with data-testid', () => {
            render(<PlayerStatusBadge status="available" />);
            expect(screen.getByTestId('status-badge')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper aria-label for available status', () => {
            render(<PlayerStatusBadge status="available" />);

            const badge = screen.getByRole('status');
            expect(badge).toHaveAttribute('aria-label', 'Status: Available');
        });

        it('should have proper aria-label for interested status', () => {
            render(<PlayerStatusBadge status="interested" />);

            const badge = screen.getByRole('status');
            expect(badge).toHaveAttribute('aria-label', 'Status: Interested');
        });

        it('should have proper aria-label for contacted status', () => {
            render(<PlayerStatusBadge status="contacted" />);

            const badge = screen.getByRole('status');
            expect(badge).toHaveAttribute('aria-label', 'Status: Contacted');
        });

        it('should use semantic role="status" for live region', () => {
            render(<PlayerStatusBadge status="available" />);

            const badge = screen.getByRole('status');
            expect(badge).toBeInTheDocument();
        });

        it('should have visible text content matching aria-label', () => {
            render(<PlayerStatusBadge status="available" />);

            const badge = screen.getByRole('status');
            expect(badge).toHaveTextContent('Available');
            expect(badge).toHaveAttribute('aria-label', 'Status: Available');
        });
    });

    describe('Integration', () => {
        it('should render correctly within a parent container', () => {
            render(
                <div className="relative">
                    <PlayerStatusBadge status="available" />
                </div>
            );

            const badge = screen.getByText('Available');
            expect(badge).toBeInTheDocument();
            expect(screen.getByTestId('status-badge-wrapper')).toBeInTheDocument();
        });

        it('should not interfere with other content when positioned absolutely', () => {
            render(
                <div className="relative">
                    <div>Other content</div>
                    <PlayerStatusBadge status="available" />
                </div>
            );

            expect(screen.getByText('Other content')).toBeInTheDocument();
            expect(screen.getByText('Available')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle all valid status values', () => {
            const statuses: Array<'available' | 'interested' | 'contacted'> = [
                'available',
                'interested',
                'contacted',
            ];

            statuses.forEach((status) => {
                const { unmount } = render(<PlayerStatusBadge status={status} />);
                const badge = screen.getByRole('status');
                expect(badge).toBeInTheDocument();
                unmount();
            });
        });
    });
});
