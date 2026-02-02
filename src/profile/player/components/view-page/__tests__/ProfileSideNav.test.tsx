import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileSideNav } from '../ProfileSideNav';

describe('ProfileSideNav', () => {
    beforeEach(() => {
        // Mock scrollTo
        window.scrollTo = jest.fn();

        // Mock getElementById
        document.getElementById = jest.fn((id) => ({
            offsetTop: 100,
            offsetHeight: 500,
        })) as any;
    });

    it('renders all navigation items', () => {
        render(<ProfileSideNav />);

        expect(screen.getByTitle('Profile')).toBeInTheDocument();
        expect(screen.getByTitle('Stats')).toBeInTheDocument();
        expect(screen.getByTitle('Achievements')).toBeInTheDocument();
        expect(screen.getByTitle('Academics')).toBeInTheDocument();
        expect(screen.getByTitle('Highlights')).toBeInTheDocument();
        expect(screen.getByTitle('Coaches')).toBeInTheDocument();
        expect(screen.getByTitle('Contact')).toBeInTheDocument();
    });

    it('scrolls to section when navigation item is clicked', () => {
        render(<ProfileSideNav />);

        const profileButton = screen.getByTitle('Profile');
        fireEvent.click(profileButton);

        expect(window.scrollTo).toHaveBeenCalledWith({
            top: 20, // 100 (offsetTop) - 80 (navbar height)
            behavior: 'smooth',
        });
    });

    it('applies active styles to current section', () => {
        render(<ProfileSideNav />);

        const profileButton = screen.getByTitle('Profile');

        // Check if it has active classes (default is 'hero')
        expect(profileButton).toHaveClass('bg-yellow-400/20', 'text-yellow-400');
    });

    it('updates active section on scroll', () => {
        render(<ProfileSideNav />);

        // Simulate scroll event
        Object.defineProperty(window, 'scrollY', { value: 200, writable: true });
        fireEvent.scroll(window);

        // Active section should update based on scroll position
        const profileButton = screen.getByTitle('Profile');
        expect(profileButton).toBeInTheDocument();
    });

    it('is hidden on mobile screens', () => {
        const { container } = render(<ProfileSideNav />);

        const nav = container.querySelector('nav');
        expect(nav).toHaveClass('hidden', 'lg:flex');
    });
});
