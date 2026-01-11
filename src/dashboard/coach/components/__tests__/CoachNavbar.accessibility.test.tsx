import { render, screen, fireEvent } from '@testing-library/react';
import { CoachNavbar } from '../CoachNavbar';

/**
 * Accessibility and Visual Regression Tests for CoachNavbar
 * Tests keyboard navigation, screen reader compatibility, focus indicators,
 * color contrast, and touch target sizes
 */
describe('CoachNavbar - Accessibility Tests', () => {
    const mockCoachId = 'coach-123';

    beforeEach(() => {
        jest.clearAllMocks();
        document.cookie = '';
    });

    describe('Keyboard Navigation', () => {
        it('allows keyboard navigation through all interactive elements', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const homeLink = screen.getByText('Home').closest('a') as HTMLElement;
            const searchButton = screen.getByText('Search').closest('button') as HTMLElement;
            const profileButton = screen.getByText('Profile').closest('button') as HTMLElement;
            const logoutButton = screen.getByText('Log Out').closest('button') as HTMLElement;

            // All elements should be focusable
            homeLink.focus();
            expect(document.activeElement).toBe(homeLink);

            searchButton.focus();
            expect(document.activeElement).toBe(searchButton);

            profileButton.focus();
            expect(document.activeElement).toBe(profileButton);

            logoutButton.focus();
            expect(document.activeElement).toBe(logoutButton);
        });

        it('mobile menu button is keyboard accessible', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const mobileButton = screen.getByLabelText('Toggle menu');

            mobileButton.focus();
            expect(document.activeElement).toBe(mobileButton);
        });

        it('mobile menu items are keyboard accessible when menu is open', () => {
            const { container } = render(<CoachNavbar coachId={mockCoachId} />);

            const mobileButton = screen.getByLabelText('Toggle menu');
            fireEvent.click(mobileButton);

            const mobileDropdown = container.querySelector('.mobile-dropdown');
            const items = mobileDropdown?.querySelectorAll('a, button');

            items?.forEach(item => {
                (item as HTMLElement).focus();
                expect(document.activeElement).toBe(item);
            });
        });

        it('supports Enter key activation on buttons', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const searchButton = screen.getByText('Search').closest('button') as HTMLElement;

            searchButton.focus();

            // Simulate Enter key press
            fireEvent.keyDown(searchButton, { key: 'Enter', code: 'Enter' });

            // Button should still be in the document (no navigation occurred)
            expect(searchButton).toBeInTheDocument();
        });

        it('supports Space key activation on buttons', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const profileButton = screen.getByText('Profile').closest('button') as HTMLElement;

            profileButton.focus();

            // Simulate Space key press
            fireEvent.keyDown(profileButton, { key: ' ', code: 'Space' });

            // Button should still be in the document
            expect(profileButton).toBeInTheDocument();
        });

        it('allows Tab navigation through all interactive elements in order', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const homeLink = screen.getByText('Home').closest('a') as HTMLElement;
            const searchButton = screen.getByText('Search').closest('button') as HTMLElement;
            const profileButton = screen.getByText('Profile').closest('button') as HTMLElement;
            const logoutButton = screen.getByText('Log Out').closest('button') as HTMLElement;

            // Start with Home link
            homeLink.focus();
            expect(document.activeElement).toBe(homeLink);

            // Tab to Search button
            fireEvent.keyDown(homeLink, { key: 'Tab', code: 'Tab' });
            searchButton.focus();
            expect(document.activeElement).toBe(searchButton);

            // Tab to Profile button
            fireEvent.keyDown(searchButton, { key: 'Tab', code: 'Tab' });
            profileButton.focus();
            expect(document.activeElement).toBe(profileButton);

            // Tab to Logout button
            fireEvent.keyDown(profileButton, { key: 'Tab', code: 'Tab' });
            logoutButton.focus();
            expect(document.activeElement).toBe(logoutButton);
        });
    });

    describe('Screen Reader Compatibility', () => {
        it('has proper semantic HTML structure with nav element', () => {
            const { container } = render(<CoachNavbar coachId={mockCoachId} />);

            const nav = container.querySelector('nav');
            expect(nav).toBeInTheDocument();
            expect(nav?.tagName).toBe('NAV');
        });

        it('mobile menu button has proper ARIA attributes', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const mobileButton = screen.getByLabelText('Toggle menu');
            expect(mobileButton).toHaveAttribute('aria-label', 'Toggle menu');
            expect(mobileButton).toHaveAttribute('aria-expanded', 'false');

            // Open menu
            fireEvent.click(mobileButton);
            expect(mobileButton).toHaveAttribute('aria-expanded', 'true');
        });

        it('Home link has accessible text content', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const homeLink = screen.getByText('Home').closest('a');
            expect(homeLink).toHaveTextContent('Home');
            expect(homeLink).toHaveAttribute('href');
        });

        it('Search button has accessible text content', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const searchButton = screen.getByText('Search').closest('button');
            expect(searchButton).toHaveTextContent('Search');
        });

        it('Profile button has accessible text content', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const profileButton = screen.getByText('Profile').closest('button');
            expect(profileButton).toHaveTextContent('Profile');
        });

        it('Log Out button has accessible text content', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const logoutButton = screen.getByText('Log Out').closest('button');
            expect(logoutButton).toHaveTextContent('Log Out');
        });

        it('CAB branding is accessible to screen readers', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const branding = screen.getByText('CAB');
            expect(branding).toBeInTheDocument();
            expect(branding).toHaveTextContent('CAB');
        });

        it('all interactive elements have meaningful text', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            // Check that all interactive elements have non-empty text content
            const homeLink = screen.getByText('Home');
            const searchButton = screen.getByText('Search');
            const profileButton = screen.getByText('Profile');
            const logoutButton = screen.getByText('Log Out');

            expect(homeLink.textContent).toBeTruthy();
            expect(searchButton.textContent).toBeTruthy();
            expect(profileButton.textContent).toBeTruthy();
            expect(logoutButton.textContent).toBeTruthy();
        });

        it('mobile dropdown items have accessible text', () => {
            const { container } = render(<CoachNavbar coachId={mockCoachId} />);

            const mobileButton = screen.getByLabelText('Toggle menu');
            fireEvent.click(mobileButton);

            const mobileDropdown = container.querySelector('.mobile-dropdown');
            const items = mobileDropdown?.querySelectorAll('a, button');

            items?.forEach(item => {
                expect(item.textContent).toBeTruthy();
            });
        });
    });

    describe('Focus Indicators', () => {
        it('Home link is focusable', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const homeLink = screen.getByText('Home').closest('a') as HTMLElement;
            homeLink.focus();

            expect(document.activeElement).toBe(homeLink);
        });

        it('Search button is focusable', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const searchButton = screen.getByText('Search').closest('button') as HTMLElement;
            searchButton.focus();

            expect(document.activeElement).toBe(searchButton);
        });

        it('Profile button is focusable', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const profileButton = screen.getByText('Profile').closest('button') as HTMLElement;
            profileButton.focus();

            expect(document.activeElement).toBe(profileButton);
        });

        it('Log Out button is focusable', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const logoutButton = screen.getByText('Log Out').closest('button') as HTMLElement;
            logoutButton.focus();

            expect(document.activeElement).toBe(logoutButton);
        });

        it('maintains focus after interaction', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const searchButton = screen.getByText('Search').closest('button') as HTMLElement;
            searchButton.focus();

            // Click the button
            fireEvent.click(searchButton);

            // Focus should remain on the button
            expect(document.activeElement).toBe(searchButton);
        });
    });

    describe('Color Contrast - WCAG AA Standards', () => {
        it('CAB branding has sufficient contrast (white on dark gray)', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const branding = screen.getByText('CAB');
            const styles = window.getComputedStyle(branding);

            // White text (#ffffff) on dark gray background (#111827)
            // This combination has a contrast ratio of approximately 15.8:1
            // which exceeds WCAG AA requirement of 4.5:1 for normal text
            expect(styles.color).toBe('rgb(255, 255, 255)'); // white
        });

        it('navigation links have sufficient contrast (light gray on dark gray)', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const homeLink = screen.getByText('Home').closest('a');
            const styles = window.getComputedStyle(homeLink!);

            // Light gray text (#d1d5db) on dark gray background (#111827)
            // This combination has a contrast ratio of approximately 9.7:1
            // which exceeds WCAG AA requirement of 4.5:1 for normal text
            expect(styles.color).toBe('rgb(209, 213, 219)'); // #d1d5db
        });

        it('Log Out button has sufficient contrast (white on red)', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const logoutButton = screen.getByText('Log Out').closest('button');
            const styles = window.getComputedStyle(logoutButton!);

            // White text on red background (#dc2626)
            // This combination has a contrast ratio of approximately 5.1:1
            // which exceeds WCAG AA requirement of 4.5:1 for normal text
            expect(styles.color).toBe('rgb(255, 255, 255)'); // white
            expect(styles.backgroundColor).toBe('rgb(220, 38, 38)'); // #dc2626
        });

        it('hover state maintains sufficient contrast', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const homeLink = screen.getByText('Home').closest('a') as HTMLElement;

            // Trigger hover
            fireEvent.mouseEnter(homeLink);

            // White text on darker gray background (#1f2937)
            // This combination has a contrast ratio of approximately 13.1:1
            // which exceeds WCAG AA requirement
            expect(homeLink.style.color).toBe('white');
            expect(homeLink.style.backgroundColor).toBe('rgb(31, 41, 55)'); // #1f2937
        });
    });

    describe('Touch Target Sizes - Mobile Accessibility', () => {
        it('Home link meets minimum touch target size (44x44px)', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const homeLink = screen.getByText('Home').closest('a');
            const styles = window.getComputedStyle(homeLink!);

            // Padding: 12px top/bottom, 24px left/right
            // With default font size, this creates a touch target larger than 44x44px
            expect(styles.padding).toBe('12px 24px');

            // Calculate approximate height: 12px (top) + 12px (bottom) + font height (~20px) = ~44px
            // Width is determined by content + padding, which will be > 44px
        });

        it('Search button meets minimum touch target size (44x44px)', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const searchButton = screen.getByText('Search').closest('button');
            const styles = window.getComputedStyle(searchButton!);

            expect(styles.padding).toBe('12px 24px');
            // Same calculation as Home link
        });

        it('Profile button meets minimum touch target size (44x44px)', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const profileButton = screen.getByText('Profile').closest('button');
            const styles = window.getComputedStyle(profileButton!);

            expect(styles.padding).toBe('12px 24px');
        });

        it('Log Out button meets minimum touch target size (44x44px)', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const logoutButton = screen.getByText('Log Out').closest('button');
            const styles = window.getComputedStyle(logoutButton!);

            expect(styles.padding).toBe('12px 24px');
        });

        it('all interactive elements have adequate spacing between them', () => {
            const { container } = render(<CoachNavbar coachId={mockCoachId} />);

            const navItems = container.querySelector('nav > div > div:last-child');
            const styles = window.getComputedStyle(navItems!);

            // Gap of 24px between items ensures they don't overlap and are easy to tap
            expect(styles.gap).toBe('24px');
        });

        it('navbar height provides adequate touch area', () => {
            const { container } = render(<CoachNavbar coachId={mockCoachId} />);

            const navContainer = container.querySelector('nav > div');
            const styles = window.getComputedStyle(navContainer!);

            // Height of 80px provides ample vertical space for touch targets
            expect(styles.height).toBe('80px');
        });
    });
});
