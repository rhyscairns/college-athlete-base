import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { SuccessNotification } from '../SuccessNotification';

describe('SuccessNotification', () => {
    const mockOnDismiss = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        act(() => {
            jest.runOnlyPendingTimers();
        });
        jest.useRealTimers();
    });

    it('renders the notification with the provided message', () => {
        render(
            <SuccessNotification message="Profile updated successfully" onDismiss={mockOnDismiss} />
        );

        expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
    });

    it('applies the correct styling classes', () => {
        render(
            <SuccessNotification message="Success!" onDismiss={mockOnDismiss} />
        );

        const notification = screen.getByRole('alert');
        expect(notification).toHaveClass('fixed', 'top-4', 'right-4', 'px-6', 'py-3');
        expect(notification).toHaveClass('bg-emerald-500', 'text-white', 'rounded-lg', 'shadow-lg');
    });

    it('includes a checkmark icon', () => {
        render(
            <SuccessNotification message="Success!" onDismiss={mockOnDismiss} />
        );

        const icon = screen.getByRole('alert').querySelector('svg');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveClass('w-5', 'h-5');
    });

    it('has proper accessibility attributes', () => {
        render(
            <SuccessNotification message="Success!" onDismiss={mockOnDismiss} />
        );

        const notification = screen.getByRole('alert');
        expect(notification).toHaveAttribute('aria-live', 'polite');
    });

    it('auto-dismisses after the default duration (3 seconds)', () => {
        render(
            <SuccessNotification message="Success!" onDismiss={mockOnDismiss} />
        );

        expect(mockOnDismiss).not.toHaveBeenCalled();

        // Fast-forward time by 3 seconds
        act(() => {
            jest.advanceTimersByTime(3000);
        });

        expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('auto-dismisses after a custom duration', () => {
        render(
            <SuccessNotification
                message="Success!"
                onDismiss={mockOnDismiss}
                duration={5000}
            />
        );

        expect(mockOnDismiss).not.toHaveBeenCalled();

        // Fast-forward time by 4 seconds (should not dismiss yet)
        act(() => {
            jest.advanceTimersByTime(4000);
        });
        expect(mockOnDismiss).not.toHaveBeenCalled();

        // Fast-forward by another 1 second (total 5 seconds)
        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });

    it('starts fade-out animation before dismissing', () => {
        render(
            <SuccessNotification message="Success!" onDismiss={mockOnDismiss} />
        );

        const notification = screen.getByRole('alert');

        // Initially should have fade-in animation
        expect(notification).toHaveClass('animate-fade-in');
        expect(notification).toHaveClass('opacity-100');

        // Fast-forward to just before fade-out starts (less than 2700ms)
        act(() => {
            jest.advanceTimersByTime(2600);
        });

        let currentNotification = screen.getByRole('alert');
        expect(currentNotification).toHaveClass('animate-fade-in');
        expect(currentNotification).toHaveClass('opacity-100');

        // Fast-forward past when fade-out starts (2700ms total)
        act(() => {
            jest.advanceTimersByTime(200);
        });

        // Re-query the notification after state update - should now be fading out
        currentNotification = screen.getByRole('alert');
        expect(currentNotification).toHaveClass('opacity-0');
        expect(currentNotification).not.toHaveClass('animate-fade-in');

        // Should not have dismissed yet
        expect(mockOnDismiss).not.toHaveBeenCalled();
    });

    it('cleans up timers on unmount', () => {
        const { unmount } = render(
            <SuccessNotification message="Success!" onDismiss={mockOnDismiss} />
        );

        unmount();

        // Fast-forward time - onDismiss should not be called after unmount
        act(() => {
            jest.advanceTimersByTime(5000);
        });
        expect(mockOnDismiss).not.toHaveBeenCalled();
    });

    it('returns null after dismissing', () => {
        const { container } = render(
            <SuccessNotification message="Success!" onDismiss={mockOnDismiss} />
        );

        expect(screen.getByRole('alert')).toBeInTheDocument();

        // Fast-forward to dismiss
        act(() => {
            jest.advanceTimersByTime(3000);
        });

        // Component should no longer render
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('displays different messages correctly', () => {
        const { rerender } = render(
            <SuccessNotification message="First message" onDismiss={mockOnDismiss} />
        );

        expect(screen.getByText('First message')).toBeInTheDocument();

        rerender(
            <SuccessNotification message="Second message" onDismiss={mockOnDismiss} />
        );

        expect(screen.getByText('Second message')).toBeInTheDocument();
        expect(screen.queryByText('First message')).not.toBeInTheDocument();
    });

    it('has proper z-index for stacking', () => {
        render(
            <SuccessNotification message="Success!" onDismiss={mockOnDismiss} />
        );

        const notification = screen.getByRole('alert');
        expect(notification).toHaveClass('z-50');
    });

    it('includes transition classes for smooth animations', () => {
        render(
            <SuccessNotification message="Success!" onDismiss={mockOnDismiss} />
        );

        const notification = screen.getByRole('alert');
        expect(notification).toHaveClass('transition-all', 'duration-300');
    });
});
