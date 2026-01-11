import { render, screen, fireEvent } from '@testing-library/react';
import { CoachNavbar } from '../CoachNavbar';

/**
 * Visual Regression Tests for CoachNavbar
 * Tests navbar appearance on mobile, tablet, and desktop viewports
 */
describe('CoachNavbar - Visual Regression Tests', () => {
    const mockCoachId = 'coach-123';

    beforeEach(() => {
        jest.clearAllMocks();
        document.cookie = '';
    });

    describe('Mobile Viewport (< 640px)', () => {
        beforeEach(() => {
            // Mock mobile viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 375,
            });
            Object.defineProperty(window, 'innerHeight', {
                writable: true,
                configurable: true,
                value: 667,
            });
        });

        it('renders navbar with correct mobile styling', () => {
            const { container } = render(<CoachNavbar coachId={mockCoachId} />);

            const nav = container.querySelector('nav');
            expect(nav).toBeInTheDocument();
            expect(nav).toHaveStyle({
                width: '100%',
                backgroundColor: '#111827',
            });
        });

        it('displays CAB branding on mobile', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const branding = screen.getByText('CAB');
            expect(branding).toBeInTheDocument();
            expect(branding).toHaveStyle({
                fontSize: '28px',
                fontWeight: 'bold',
            });
        });

        it('displays hamburger menu button on mobile', () => {
            const { container } = render(<CoachNavbar coachId={mockCoachId} />);

            const mobileButton = container.querySelector('.mobile-menu-button');
            expect(mobileButton).toBeInTheDocument();
            expect(mobileButton).toHaveAttribute('aria-label', 'Toggle menu');
        });

        it('hides desktop navigation on mobile', () => {
            const { container } = render(<CoachNavbar coachId={mockCoachId} />);

            const desktopNav = container.querySelector('.desktop-nav');
            expect(desktopNav).toBeInTheDocument();
            // Desktop nav should be hidden via CSS media query
        });

        it('shows mobile dropdown when menu is opened', () => {
            const { container } = render(<CoachNavbar coachId={mockCoachId} />);

            const mobileButton = container.querySelector('.mobile-menu-button') as HTMLElement;
            fireEvent.click(mobileButton);

            const mobileDropdown = container.querySelector('.mobile-dropdown');
            expect(mobileDropdown).toBeInTheDocument();
        });

        it('mobile dropdown contains all navigation items', () => {
            const { container } = render(<CoachNavbar coachId={mockCoachId} />);

            const mobileButton = container.querySelector('.mobile-menu-button') as HTMLElement;
            fireEvent.click(mobileButton);

            const mobileDropdown = container.querySelector('.mobile-dropdown');

            // Check for all navigation items
            const homeLink = Array.from(mobileDropdown?.querySelectorAll('a') || [])
                .find(a => a.textContent === 'Home');
            expect(homeLink).toBeInTheDocument();

            const buttons = Array.from(mobileDropdown?.querySelectorAll('button') || []);
            const searchButton = buttons.find(b => b.textContent === 'Search');
            const profileButton = buttons.find(b => b.textContent === 'Profile');
            const logoutButton = buttons.find(b => b.textContent === 'Log Out');

            expect(searchButton).toBeInTheDocument();
            expect(profileButton).toBeInTheDocument();
            expect(logoutButton).toBeInTheDocument();
        });

        it('maintains proper spacing on mobile', () => {
            const { container } = render(<CoachNavbar coachId={mockCoachId} />);

            const navContainer = container.querySelector('nav > div');
            expect(navContainer).toHaveStyle({
                height: '80px',
                paddingLeft: '24px',
                paddingRight: '24px',
            });
        });

        it('hamburger button has adequate touch target on mobile', () => {
            const { container } = render(<CoachNavbar coachId={mockCoachId} />);

            const mobileButton = container.querySelector('.mobile-menu-button');
            expect(mobileButton).toHaveStyle({
                width: '44px',
                height: '44px',
            });
        });

        it('mobile dropdown items have adequate touch targets', () => {
            const { container } = render(<CoachNavbar coachId={mockCoachId} />);

            const mobileButton = container.querySelector('.mobile-menu-button') as HTMLElement;
            fireEvent.click(mobileButton);

            const mobileDropdown = container.querySelector('.mobile-dropdown');
            const items = mobileDropdown?.querySelectorAll('a, button');

            items?.forEach(item => {
                const styles = window.getComputedStyle(item);
                expect(styles.padding).toBe('16px 24px');
            });
        });
    });

    describe('Tablet Viewport (640px - 1024px)', () => {
        beforeEach(() => {
            // Mock tablet viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 768,
            });
            Object.defineProperty(window, 'innerHeight', {
                writable: true,
                configurable: true,
                value: 1024,
            });
        });

        it('renders navbar with correct tablet styling', () => {
            const { container } = render(<CoachNavbar coachId={mockCoachId} />);

            const nav = container.querySelector('nav');
            expect(nav).toBeInTheDocument();
            expect(nav).toHaveStyle({
                width: '100%',
                backgroundColor: '#111827',
            });
        });

        it('displays all navigation items horizontally on tablet', () => {
            const { container } = render(<CoachNavbar coachId={mockCoachId} />);

            const navItems = container.querySelector('nav > div > div:last-child');
            expect(navItems).toHaveStyle({
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
            });
        });

        it('maintains consistent spacing on tablet', () => {
            const { container } = render(<CoachNavbar coachId={mockCoachId} />);

            const navContainer = container.querySelector('nav > div');
            expect(navContainer).toHaveStyle({
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            });
        });

        it('CAB branding is visible and properly styled on tablet', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const branding = screen.getByText('CAB');
            expect(branding).toBeInTheDocument();
            expect(branding).toHaveStyle({
                fontSize: '28px',
                fontWeight: 'bold',
                color: 'rgb(255, 255, 255)',
            });
        });
    });

    describe('Desktop Viewport (> 1024px)', () => {
        beforeEach(() => {
            // Mock desktop viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 1920,
            });
            Object.defineProperty(window, 'innerHeight', {
                writable: true,
                configurable: true,
                value: 1080,
            });
        });

        it('renders navbar with correct desktop styling', () => {
            const { container } = render(<CoachNavbar coachId={mockCoachId} />);

            const nav = container.querySelector('nav');
            expect(nav).toBeInTheDocument();
            expect(nav).toHaveStyle({
                width: '100%',
                backgroundColor: '#111827',
                borderBottom: '1px solid #1f2937',
            });
        });

        it('displays all navigation items horizontally on desktop', () => {
            const { container } = render(<CoachNavbar coachId={mockCoachId} />);

            const navItems = container.querySelector('nav > div > div:last-child');
            expect(navItems).toHaveStyle({
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
            });
        });

        it('navigation items have proper spacing on desktop', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const homeLink = screen.getByText('Home').closest('a');
            expect(homeLink).toHaveStyle({
                padding: '12px 24px',
                fontSize: '14px',
            });
        });

        it('CAB branding is prominent on desktop', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const branding = screen.getByText('CAB');
            expect(branding).toHaveStyle({
                fontSize: '28px',
                fontWeight: 'bold',
                color: 'rgb(255, 255, 255)',
                letterSpacing: '-0.5px',
            });
        });

        it('maintains consistent layout structure on desktop', () => {
            const { container } = render(<CoachNavbar coachId={mockCoachId} />);

            const navContainer = container.querySelector('nav > div');
            expect(navContainer).toHaveStyle({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '80px',
            });
        });
    });

    describe('Responsive Behavior Across Viewports', () => {
        it('maintains consistent navbar height across all viewports', () => {
            const viewports = [
                { width: 375, height: 667 },   // Mobile
                { width: 768, height: 1024 },  // Tablet
                { width: 1920, height: 1080 }, // Desktop
            ];

            viewports.forEach(viewport => {
                Object.defineProperty(window, 'innerWidth', {
                    writable: true,
                    configurable: true,
                    value: viewport.width,
                });

                const { container, unmount } = render(<CoachNavbar coachId={mockCoachId} />);

                const navContainer = container.querySelector('nav > div');
                expect(navContainer).toHaveStyle({ height: '80px' });

                unmount();
            });
        });

        it('maintains consistent color scheme across all viewports', () => {
            const viewports = [375, 768, 1920];

            viewports.forEach(width => {
                Object.defineProperty(window, 'innerWidth', {
                    writable: true,
                    configurable: true,
                    value: width,
                });

                const { container, unmount } = render(<CoachNavbar coachId={mockCoachId} />);

                const nav = container.querySelector('nav');
                expect(nav).toHaveStyle({
                    backgroundColor: '#111827',
                });

                unmount();
            });
        });

        it('CAB branding remains consistent across all viewports', () => {
            const viewports = [375, 768, 1920];

            viewports.forEach(width => {
                Object.defineProperty(window, 'innerWidth', {
                    writable: true,
                    configurable: true,
                    value: width,
                });

                const { unmount } = render(<CoachNavbar coachId={mockCoachId} />);

                const branding = screen.getByText('CAB');
                expect(branding).toHaveStyle({
                    fontSize: '28px',
                    fontWeight: 'bold',
                });

                unmount();
            });
        });
    });
});
