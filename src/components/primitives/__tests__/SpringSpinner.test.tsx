import React from 'react';
import { render, screen } from '@testing-library/react';
import { SpringSpinner } from '../SpringSpinner';

describe('SpringSpinner', () => {
    it('renders with role="status"', () => {
        render(<SpringSpinner />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has default accessible label', () => {
        render(<SpringSpinner />);
        expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading…');
    });

    it('accepts a custom label', () => {
        render(<SpringSpinner label="Saving changes…" />);
        expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Saving changes…');
        expect(screen.getByText('Saving changes…')).toBeInTheDocument();
    });

    it('renders three dots', () => {
        render(<SpringSpinner data-testid="spinner" />);
        const dots = screen.getByTestId('spinner').querySelectorAll('[aria-hidden="true"]');
        expect(dots).toHaveLength(3);
    });

    it('renders with data-testid', () => {
        render(<SpringSpinner data-testid="my-spinner" />);
        expect(screen.getByTestId('my-spinner')).toBeInTheDocument();
    });

    it('hides dots from screen readers', () => {
        render(<SpringSpinner data-testid="spinner" />);
        const dots = screen.getByTestId('spinner').querySelectorAll('[aria-hidden="true"]');
        dots.forEach(dot => expect(dot).toHaveAttribute('aria-hidden', 'true'));
    });
});
