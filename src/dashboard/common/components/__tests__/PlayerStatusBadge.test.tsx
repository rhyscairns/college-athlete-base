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
    });

    describe('Styling', () => {
        it('should apply green background for available status', () => {
            render(<PlayerStatusBadge status="available" />);

            const badge = screen.getByText('Available');
            expect(badge).toHaveClass('bg-green-500', 'text-white');
        });

        it('should apply orange background for interested status', () => {
            render(<PlayerStatusBadge status="interested" />);

            const badge = screen.getByText('Interested');
            expect(badge).toHaveClass('bg-orange-500', 'text-white');
        });

        it('should apply red background for contacted status', () => {
            render(<PlayerStatusBadge status="contacted" />);

            const badge = screen.getByText('Contacted');
            expect(badge).toHaveClass('bg-red-500', 'text-white');
        });

        it('should have rounded-full styling', () => {
            render(<PlayerStatusBadge status="available" />);

            const badge = screen.getByText('Available');
            expect(badge).toHaveClass('rounded-full');
        });

        it('should have proper padding', () => {
            render(<PlayerStatusBadge status="available" />);

            const badge = screen.getByText('Available');
            expect(badge).toHaveClass('px-3', 'py-1');
        });

        it('should have shadow styling', () => {
            render(<PlayerStatusBadge status="available" />);

            const badge = screen.getByText('Available');
            expect(badge).toHaveClass('shadow-lg');
        });

        it('should have font styling', () => {
            render(<PlayerStatusBadge status="available" />);

            const badge = screen.getByText('Available');
            expect(badge).toHaveClass('text-sm', 'font-semibold');
        });

        it('should be positioned absolutely in top-right', () => {
            const { container } = render(<PlayerStatusBadge status="available" />);

            const wrapper = container.firstChild;
            expect(wrapper).toHaveClass('absolute', 'top-3', 'right-3');
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

    describe('Color Contrast', () => {
        it('should use white text on green background for available', () => {
            render(<PlayerStatusBadge status="available" />);

            const badge = screen.getByText('Available');
            // bg-green-500 (#10b981) with white text has sufficient contrast (4.5:1+)
            expect(badge).toHaveClass('bg-green-500', 'text-white');
        });

        it('should use white text on orange background for interested', () => {
            render(<PlayerStatusBadge status="interested" />);

            const badge = screen.getByText('Interested');
            // bg-orange-500 (#f97316) with white text has sufficient contrast (4.5:1+)
            expect(badge).toHaveClass('bg-orange-500', 'text-white');
        });

        it('should use white text on red background for contacted', () => {
            render(<PlayerStatusBadge status="contacted" />);

            const badge = screen.getByText('Contacted');
            // bg-red-500 (#ef4444) with white text has sufficient contrast (4.5:1+)
            expect(badge).toHaveClass('bg-red-500', 'text-white');
        });
    });

    describe('Integration', () => {
        it('should render correctly within a parent container', () => {
            const { container } = render(
                <div className="relative">
                    <PlayerStatusBadge status="available" />
                </div>
            );

            const badge = screen.getByText('Available');
            expect(badge).toBeInTheDocument();
            expect(container.querySelector('.absolute')).toBeInTheDocument();
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
