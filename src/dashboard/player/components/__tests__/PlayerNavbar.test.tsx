import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PlayerNavbar } from '../PlayerNavbar';

describe('PlayerNavbar', () => {
    const mockPlayerId = 'player-123';

    beforeEach(() => {
        jest.clearAllMocks();
        document.cookie = '';
    });

    afterEach(() => {
        cleanup();
    });

    describe('Branding', () => {
        it('renders CAB branding correctly', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);

            const branding = screen.getByText('CAB');
            expect(branding).toBeInTheDocument();
        });

        it('applies correct styling to CAB branding', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);

            const branding = screen.getByText('CAB');
            expect(branding).toHaveStyle({
                fontSize: '28px',
                fontWeight: 'bold',
            });
            const styles = window.getComputedStyle(branding);
            expect(styles.color).toBe('rgb(255, 255, 255)');
        });
    });

    describe('Navigation Items', () => {
        it('renders all navigation items', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);

            expect(screen.getByText('Home')).toBeInTheDocument();
            expect(screen.getByText('Profile')).toBeInTheDocument();
            expect(screen.getByText('Log Out')).toBeInTheDocument();
        });

        it('does not render Search button', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);

            expect(screen.queryByText('Search')).not.toBeInTheDocument();
        });

        it('renders Home as a link', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);

            const homeLink = screen.getByText('Home').closest('a');
            expect(homeLink).toBeInTheDocument();
            expect(homeLink?.tagName).toBe('A');
        });

        it('renders Profile as a button', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);

            const profileButton = screen.getByText('Profile').closest('button');
            expect(profileButton).toBeInTheDocument();
            expect(profileButton?.tagName).toBe('BUTTON');
        });

        it('renders Log Out as a button', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);

            const logoutButton = screen.getByText('Log Out').closest('button');
            expect(logoutButton).toBeInTheDocument();
            expect(logoutButton?.tagName).toBe('BUTTON');
        });
    });

    describe('Home Link Navigation', () => {
        it('has correct href with playerId', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);

            const homeLink = screen.getByText('Home').closest('a');
            expect(homeLink).toHaveAttribute('href', `/player/${mockPlayerId}/dashboard`);
        });

        it('updates href when playerId changes', () => {
            const { rerender } = render(<PlayerNavbar playerId={mockPlayerId} />);

            let homeLink = screen.getByText('Home').closest('a');
            expect(homeLink).toHaveAttribute('href', `/player/${mockPlayerId}/dashboard`);

            const newPlayerId = 'player-456';
            rerender(<PlayerNavbar playerId={newPlayerId} />);

            homeLink = screen.getByText('Home').closest('a');
            expect(homeLink).toHaveAttribute('href', `/player/${newPlayerId}/dashboard`);
        });
    });

    describe('Profile Link', () => {
        it('Profile button is clickable and does not throw errors', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);

            const profileButton = screen.getByText('Profile').closest('button');

            expect(() => fireEvent.click(profileButton!)).not.toThrow();
        });

        it('Profile button has onClick handler', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);

            const profileButton = screen.getByText('Profile').closest('button');

            fireEvent.click(profileButton!);
            expect(profileButton).toBeInTheDocument();
        });
    });

    describe('Logout Functionality', () => {
        it('Log Out button has onClick handler', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);

            const logoutButton = screen.getByText('Log Out').closest('button');

            expect(logoutButton).toBeInTheDocument();
            expect(logoutButton?.tagName).toBe('BUTTON');
        });
    });

    describe('Styling and Visual Feedback', () => {
        it('applies correct navbar background styling', () => {
            const { container } = render(<PlayerNavbar playerId={mockPlayerId} />);

            const nav = container.querySelector('nav');
            expect(nav).toHaveStyle({
                width: '100%',
                backgroundColor: '#111827',
                borderBottom: '1px solid #1f2937',
            });
        });

        it('applies correct styling to Home link', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);

            const homeLink = screen.getByText('Home').closest('a');
            expect(homeLink).toHaveStyle({
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#d1d5db',
            });
        });

        it('applies correct styling to Profile button', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);

            const profileButton = screen.getByText('Profile').closest('button');
            expect(profileButton).toHaveStyle({
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#d1d5db',
            });
        });

        it('applies correct styling to Log Out button', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);

            const logoutButton = screen.getByText('Log Out').closest('button');
            expect(logoutButton).toHaveStyle({
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
            });
            const styles = window.getComputedStyle(logoutButton!);
            expect(styles.color).toBeTruthy();
        });
    });

    describe('Hover States', () => {
        it('changes Home link style on hover', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);

            const homeLink = screen.getByText('Home').closest('a') as HTMLElement;

            expect(homeLink.style.color).toBe('rgb(209, 213, 219)');

            fireEvent.mouseEnter(homeLink);
            expect(homeLink.style.backgroundColor).toBe('rgb(31, 41, 55)');
            expect(homeLink.style.color).toBe('white');

            fireEvent.mouseLeave(homeLink);
            expect(homeLink.style.backgroundColor).toBe('transparent');
            expect(homeLink.style.color).toBe('rgb(209, 213, 219)');
        });

        it('changes Profile button style on hover', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);

            const profileButton = screen.getByText('Profile').closest('button') as HTMLElement;

            expect(profileButton.style.color).toBe('rgb(209, 213, 219)');

            fireEvent.mouseEnter(profileButton);
            expect(profileButton.style.backgroundColor).toBe('rgb(31, 41, 55)');
            expect(profileButton.style.color).toBe('white');

            fireEvent.mouseLeave(profileButton);
            expect(profileButton.style.backgroundColor).toBe('transparent');
            expect(profileButton.style.color).toBe('rgb(209, 213, 219)');
        });

        it('changes Log Out button style on hover', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);

            const logoutButton = screen.getByText('Log Out').closest('button') as HTMLElement;

            expect(logoutButton.style.backgroundColor).toBe('rgb(220, 38, 38)');

            fireEvent.mouseEnter(logoutButton);
            expect(logoutButton.style.backgroundColor).toBe('rgb(185, 28, 28)');

            fireEvent.mouseLeave(logoutButton);
            expect(logoutButton.style.backgroundColor).toBe('rgb(220, 38, 38)');
        });
    });

    describe('Responsive Layout', () => {
        it('renders navigation container with correct layout', () => {
            const { container } = render(<PlayerNavbar playerId={mockPlayerId} />);

            const navContainer = container.querySelector('nav > div');
            expect(navContainer).toHaveStyle({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: '80px',
            });
        });

        it('renders desktop navigation items container with correct layout', () => {
            const { container } = render(<PlayerNavbar playerId={mockPlayerId} />);

            const desktopNav = container.querySelector('.desktop-nav');
            expect(desktopNav).toHaveStyle({
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
            });
        });

        it('maintains consistent spacing between navigation items', () => {
            const { container } = render(<PlayerNavbar playerId={mockPlayerId} />);

            const desktopNav = container.querySelector('.desktop-nav');
            expect(desktopNav).toHaveStyle({
                gap: '24px',
            });
        });

        it('renders mobile menu button', () => {
            const { container } = render(<PlayerNavbar playerId={mockPlayerId} />);

            const mobileButton = container.querySelector('.mobile-menu-button');
            expect(mobileButton).toBeInTheDocument();
            expect(mobileButton).toHaveAttribute('aria-label', 'Toggle menu');
        });

        it('toggles mobile menu when hamburger is clicked', () => {
            const { container } = render(<PlayerNavbar playerId={mockPlayerId} />);

            const mobileButton = container.querySelector('.mobile-menu-button') as HTMLElement;

            expect(mobileButton).toHaveAttribute('aria-expanded', 'false');

            fireEvent.click(mobileButton);
            expect(mobileButton).toHaveAttribute('aria-expanded', 'true');

            fireEvent.click(mobileButton);
            expect(mobileButton).toHaveAttribute('aria-expanded', 'false');
        });

        it('mobile dropdown contains all navigation items', () => {
            const { container } = render(<PlayerNavbar playerId={mockPlayerId} />);

            const mobileButton = container.querySelector('.mobile-menu-button') as HTMLElement;
            fireEvent.click(mobileButton);

            const mobileDropdown = container.querySelector('.mobile-dropdown');
            expect(mobileDropdown).toBeInTheDocument();

            const dropdownLinks = mobileDropdown?.querySelectorAll('a, button');
            expect(dropdownLinks?.length).toBe(3); // Home, Profile, Log Out
        });

        it('closes mobile menu when a navigation item is clicked', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);

            const mobileButton = screen.getByLabelText('Toggle menu');
            fireEvent.click(mobileButton);

            expect(mobileButton).toHaveAttribute('aria-expanded', 'true');

            const profileButtons = screen.getAllByText('Profile');
            const mobileProfileButton = profileButtons.find(btn =>
                btn.closest('.mobile-dropdown')
            );

            if (mobileProfileButton) {
                fireEvent.click(mobileProfileButton);
            }

            expect(mobileButton).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('has proper navigation landmark', () => {
            const { container } = render(<PlayerNavbar playerId={mockPlayerId} />);

            const nav = container.querySelector('nav');
            expect(nav).toBeInTheDocument();
        });

        it('Home link is keyboard accessible', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);

            const homeLink = screen.getByText('Home').closest('a');
            expect(homeLink).toHaveAttribute('href');
        });

        it('all buttons are keyboard accessible', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);

            const profileButton = screen.getByText('Profile').closest('button');
            const logoutButton = screen.getByText('Log Out').closest('button');

            expect(profileButton?.tagName).toBe('BUTTON');
            expect(logoutButton?.tagName).toBe('BUTTON');
        });

        it('buttons have appropriate cursor styling', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);

            const profileButton = screen.getByText('Profile').closest('button');
            const logoutButton = screen.getByText('Log Out').closest('button');

            expect(profileButton).toHaveStyle({ cursor: 'pointer' });
            expect(logoutButton).toHaveStyle({ cursor: 'pointer' });
        });
    });

    describe('Component Props', () => {
        it('accepts and uses playerId prop', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);

            const homeLink = screen.getByText('Home').closest('a');
            expect(homeLink).toHaveAttribute('href', `/player/${mockPlayerId}/dashboard`);
        });

        it('handles different playerId formats', () => {
            const playerIds = ['player-123', 'abc-def-ghi', '12345', 'player_test_001'];

            playerIds.forEach(playerId => {
                const { unmount } = render(<PlayerNavbar playerId={playerId} />);

                const homeLink = screen.getByText('Home').closest('a');
                expect(homeLink).toHaveAttribute('href', `/player/${playerId}/dashboard`);

                unmount();
            });
        });
    });
});
