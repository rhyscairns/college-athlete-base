import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ProgressBar } from '../ProgressBar';

describe('ProgressBar', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('does not render when active=false initially', () => {
        render(<ProgressBar active={false} />);
        expect(screen.queryByTestId('progress-bar')).not.toBeInTheDocument();
    });

    it('renders when active=true', () => {
        render(<ProgressBar active={true} />);
        expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    });

    it('has role="progressbar"', () => {
        render(<ProgressBar active={true} />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('has accessible label', () => {
        render(<ProgressBar active={true} />);
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Page loading');
    });

    it('renders with data-testid', () => {
        render(<ProgressBar active={true} data-testid="nav-progress" />);
        expect(screen.getByTestId('nav-progress')).toBeInTheDocument();
    });

    it('hides after active transitions to false', () => {
        const { rerender } = render(<ProgressBar active={true} />);
        expect(screen.getByTestId('progress-bar')).toBeInTheDocument();

        rerender(<ProgressBar active={false} />);

        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(screen.queryByTestId('progress-bar')).not.toBeInTheDocument();
    });

    it('stays visible during completion animation', () => {
        const { rerender } = render(<ProgressBar active={true} />);
        rerender(<ProgressBar active={false} />);

        // Still visible before timeout fires
        expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    });
});
