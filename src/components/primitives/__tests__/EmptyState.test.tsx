import React from 'react';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
    const illustration = <svg data-testid="test-illustration" />;

    it('renders title and description', () => {
        render(
            <EmptyState
                illustration={illustration}
                title="Nothing here"
                description="Try again later."
            />
        );
        expect(screen.getByText('Nothing here')).toBeInTheDocument();
        expect(screen.getByText('Try again later.')).toBeInTheDocument();
    });

    it('renders illustration', () => {
        render(
            <EmptyState
                illustration={illustration}
                title="Empty"
                description="No data."
            />
        );
        expect(screen.getByTestId('test-illustration')).toBeInTheDocument();
    });

    it('renders optional action', () => {
        render(
            <EmptyState
                illustration={illustration}
                title="Empty"
                description="No data."
                action={<button>Start scouting</button>}
            />
        );
        expect(screen.getByRole('button', { name: 'Start scouting' })).toBeInTheDocument();
    });

    it('has role="status" for screen readers', () => {
        render(
            <EmptyState
                illustration={illustration}
                title="Empty"
                description="No data."
            />
        );
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders with custom data-testid', () => {
        render(
            <EmptyState
                illustration={illustration}
                title="Empty"
                description="No data."
                data-testid="my-empty"
            />
        );
        expect(screen.getByTestId('my-empty')).toBeInTheDocument();
    });
});
