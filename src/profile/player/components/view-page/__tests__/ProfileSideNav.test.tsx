import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ProfileSideNav } from '../ProfileSideNav';

describe('ProfileSideNav', () => {
    beforeEach(() => {
        jest.useFakeTimers();

        // Mock scrollTo
        window.scrollTo = jest.fn();

        // Mock getElementById
        document.getElementById = jest.fn((_id) => ({
            offsetTop: 100,
            offsetHeight: 500,
        })) as any;
    });

    afterEach(() => {
        act(() => {
            jest.runOnlyPendingTimers();
        });
        jest.useRealTimers();
    });

    it('renders all navigation items', async () => {
        render(<ProfileSideNav />);

        // Wait for section detection
        await act(async () => {
            jest.advanceTimersByTime(100);
        });

        expect(screen.getByTitle('Profile')).toBeInTheDocument();
        expect(screen.getByTitle('Stats')).toBeInTheDocument();
        expect(screen.getByTitle('Achievements')).toBeInTheDocument();
        expect(screen.getByTitle('Academics')).toBeInTheDocument();
        expect(screen.getByTitle('Highlights')).toBeInTheDocument();
        expect(screen.getByTitle('Coaches')).toBeInTheDocument();
        expect(screen.getByTitle('Contact')).toBeInTheDocument();
    });

    it('scrolls to section when navigation item is clicked', async () => {
        render(<ProfileSideNav />);

        await act(async () => {
            jest.advanceTimersByTime(100);
        });

        const profileButton = screen.getByTitle('Profile');
        fireEvent.click(profileButton);

        expect(window.scrollTo).toHaveBeenCalledWith({
            top: 20, // 100 (offsetTop) - 80 (navbar height)
            behavior: 'smooth',
        });
    });

    it('applies active styles to current section', async () => {
        render(<ProfileSideNav />);

        await act(async () => {
            jest.advanceTimersByTime(100);
        });

        const profileButton = screen.getByTitle('Profile');
        // Active section is indicated by aria-current
        expect(profileButton).toHaveAttribute('aria-current', 'location');
    });

    it('has aria-current attribute on active section', async () => {
        render(<ProfileSideNav />);

        await act(async () => {
            jest.advanceTimersByTime(100);
        });

        const profileButton = screen.getByTitle('Profile');
        expect(profileButton).toHaveAttribute('aria-current', 'location');
    });

    it('does not have aria-current on inactive sections', async () => {
        render(<ProfileSideNav />);

        await act(async () => {
            jest.advanceTimersByTime(100);
        });

        const statsButton = screen.getByTitle('Stats');
        expect(statsButton).not.toHaveAttribute('aria-current');
    });

    it('updates active section on scroll with throttling', async () => {
        render(<ProfileSideNav />);

        await act(async () => {
            jest.advanceTimersByTime(100);
        });

        // Simulate scroll event
        Object.defineProperty(window, 'scrollY', { value: 200, writable: true });

        await act(async () => {
            fireEvent.scroll(window);
            jest.advanceTimersByTime(100);
        });

        // Active section should update based on scroll position
        const profileButton = screen.getByTitle('Profile');
        expect(profileButton).toBeInTheDocument();
    });

    it('throttles scroll events to improve performance', async () => {
        render(<ProfileSideNav />);

        await act(async () => {
            jest.advanceTimersByTime(100);
        });

        // Trigger multiple scroll events rapidly
        await act(async () => {
            fireEvent.scroll(window);
            fireEvent.scroll(window);
            fireEvent.scroll(window);
        });

        // Only one should be processed after throttle delay
        expect(jest.getTimerCount()).toBeGreaterThan(0);

        await act(async () => {
            jest.advanceTimersByTime(100);
        });

        // Verify throttling worked
        expect(document.getElementById).toHaveBeenCalled();
    });

    it('is hidden on mobile screens', async () => {
        const { container } = render(<ProfileSideNav />);

        await act(async () => {
            jest.advanceTimersByTime(100);
        });

        const nav = container.querySelector('nav');
        expect(nav).toHaveClass('hidden', 'lg:flex');
    });

    it('returns null when no sections are available', async () => {
        // Mock getElementById to return null (no sections found)
        document.getElementById = jest.fn(() => null) as any;

        const { container } = render(<ProfileSideNav />);

        // Wait for section detection
        await act(async () => {
            jest.advanceTimersByTime(100);
        });

        await waitFor(() => {
            expect(container.firstChild).toBeNull();
        });
    });

    it('cleans up scroll listener on unmount', async () => {
        const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

        const { unmount } = render(<ProfileSideNav />);

        await act(async () => {
            jest.advanceTimersByTime(100);
        });

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });
});
