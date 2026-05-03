import React from 'react';
import { render, screen } from '@testing-library/react';
import { Skeleton, PlayerCardSkeleton } from '../Skeleton';

describe('Skeleton', () => {
    it('renders with role="status"', () => {
        render(<Skeleton />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has accessible label', () => {
        render(<Skeleton />);
        expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading…');
    });

    it('renders with data-testid', () => {
        render(<Skeleton data-testid="my-skeleton" />);
        expect(screen.getByTestId('my-skeleton')).toBeInTheDocument();
    });

    it('applies width and height via style', () => {
        render(<Skeleton width="200px" height="40px" data-testid="sized" />);
        const el = screen.getByTestId('sized');
        expect(el).toHaveStyle({ width: '200px', height: '40px' });
    });

    it('applies rounded-full class', () => {
        render(<Skeleton rounded="full" data-testid="round" />);
        expect(screen.getByTestId('round')).toHaveClass('rounded-full');
    });

    it('has sr-only text', () => {
        render(<Skeleton />);
        expect(screen.getByText('Loading…')).toBeInTheDocument();
    });
});

describe('PlayerCardSkeleton', () => {
    it('renders with role="status"', () => {
        render(<PlayerCardSkeleton />);
        const statuses = screen.getAllByRole('status');
        expect(statuses.length).toBeGreaterThan(0);
    });

    it('renders media, name, position, sport, and button skeletons', () => {
        render(<PlayerCardSkeleton />);
        expect(screen.getByTestId('skeleton-media')).toBeInTheDocument();
        expect(screen.getByTestId('skeleton-name')).toBeInTheDocument();
        expect(screen.getByTestId('skeleton-position')).toBeInTheDocument();
        expect(screen.getByTestId('skeleton-sport')).toBeInTheDocument();
        expect(screen.getByTestId('skeleton-btn-primary')).toBeInTheDocument();
        expect(screen.getByTestId('skeleton-btn-secondary')).toBeInTheDocument();
    });

    it('has accessible label on outer container', () => {
        render(<PlayerCardSkeleton data-testid="card-skel" />);
        expect(screen.getByTestId('card-skel')).toHaveAttribute('aria-label', 'Loading player card');
    });

    it('accepts custom data-testid', () => {
        render(<PlayerCardSkeleton data-testid="card-skel" />);
        expect(screen.getByTestId('card-skel')).toBeInTheDocument();
    });
});
