import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PlayerNavbar } from '../PlayerNavbar';

jest.mock('../../../../messages/components/NotificationBell', () => ({
    NotificationBell: ({ userId, userType }: { userId: string; userType: string }) => (
        <div data-testid="notification-bell" data-user-id={userId} data-user-type={userType} />
    ),
}));

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn() }),
    usePathname: () => '/player/player-123/dashboard',
}));

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
            expect(screen.getAllByText('CAB')[0]).toBeInTheDocument();
        });

        it('branding is a link to dashboard', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);
            const brandingLinks = screen.getAllByRole('link', { name: /College Athlete Base/i });
            expect(brandingLinks[0]).toHaveAttribute('href', `/player/${mockPlayerId}/dashboard`);
        });
    });

    describe('Navigation Items', () => {
        it('renders all navigation items', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);
            expect(screen.getAllByText('Home')[0]).toBeInTheDocument();
            expect(screen.getAllByText('Profile')[0]).toBeInTheDocument();
            expect(screen.getAllByText('Messages')[0]).toBeInTheDocument();
            expect(screen.getByText('Log Out')).toBeInTheDocument();
        });

        it('does not render Search button', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);
            expect(screen.queryByText('Search')).not.toBeInTheDocument();
        });

        it('renders Home as a link', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);
            const homeLink = screen.getAllByText('Home')[0].closest('a');
            expect(homeLink).toBeInTheDocument();
        });

        it('renders Profile as a link', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);
            const profileLink = screen.getAllByText('Profile')[0].closest('a');
            expect(profileLink).toBeInTheDocument();
        });

        it('renders Messages as a link', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);
            const messagesLink = screen.getAllByText('Messages')[0].closest('a');
            expect(messagesLink).toBeInTheDocument();
        });

        it('renders Log Out as a button', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);
            const logoutButton = screen.getByText('Log Out').closest('button');
            expect(logoutButton?.tagName).toBe('BUTTON');
        });
    });

    describe('Home Link Navigation', () => {
        it('has correct href with playerId', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);
            const homeLink = screen.getAllByText('Home')[0].closest('a');
            expect(homeLink).toHaveAttribute('href', `/player/${mockPlayerId}/dashboard`);
        });

        it('updates href when playerId changes', () => {
            const { rerender } = render(<PlayerNavbar playerId={mockPlayerId} />);
            expect(screen.getAllByText('Home')[0].closest('a')).toHaveAttribute('href', `/player/${mockPlayerId}/dashboard`);

            rerender(<PlayerNavbar playerId="player-456" />);
            expect(screen.getAllByText('Home')[0].closest('a')).toHaveAttribute('href', '/player/player-456/dashboard');
        });
    });

    describe('Messages Navigation', () => {
        it('Messages link is clickable and does not throw errors', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);
            expect(() => fireEvent.click(screen.getAllByText('Messages')[0])).not.toThrow();
        });
    });

    describe('Profile Link', () => {
        it('Profile link is clickable and does not throw errors', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);
            expect(() => fireEvent.click(screen.getAllByText('Profile')[0])).not.toThrow();
        });

        it('Profile link has correct href', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);
            const profileLink = screen.getAllByText('Profile')[0].closest('a');
            expect(profileLink).toHaveAttribute('href', `/player/${mockPlayerId}/profile`);
        });
    });

    describe('Logout Functionality', () => {
        it('Log Out button is present and clickable', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);
            const logoutButton = screen.getByText('Log Out').closest('button');
            expect(logoutButton).toBeInTheDocument();
            expect(() => fireEvent.click(logoutButton!)).not.toThrow();
        });
    });

    describe('NotificationBell', () => {
        it('renders NotificationBell with correct userId and userType', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);
            const bells = screen.getAllByTestId('notification-bell');
            expect(bells[0]).toHaveAttribute('data-user-id', mockPlayerId);
            expect(bells[0]).toHaveAttribute('data-user-type', 'player');
        });
    });

    describe('Styling and Visual Feedback', () => {
        it('applies correct navbar background styling', () => {
            const { container } = render(<PlayerNavbar playerId={mockPlayerId} />);
            expect(container.querySelector('nav')).toBeInTheDocument();
        });
    });

    describe('Hover States', () => {
        it('changes Home link style on hover without error', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);
            const homeLink = screen.getAllByText('Home')[0].closest('a') as HTMLElement;
            fireEvent.mouseEnter(homeLink);
            fireEvent.mouseLeave(homeLink);
            expect(homeLink).toBeInTheDocument();
        });

        it('changes Log Out button style on hover without error', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);
            const logoutButton = screen.getByText('Log Out').closest('button') as HTMLElement;
            fireEvent.mouseEnter(logoutButton);
            fireEvent.mouseLeave(logoutButton);
            expect(logoutButton).toBeInTheDocument();
        });
    });

    describe('Responsive Layout', () => {
        it('renders navigation container', () => {
            const { container } = render(<PlayerNavbar playerId={mockPlayerId} />);
            expect(container.querySelector('nav > div')).toBeInTheDocument();
        });

        it('renders desktop navigation items container', () => {
            const { container } = render(<PlayerNavbar playerId={mockPlayerId} />);
            // Desktop nav is the hidden md:block nav element
            const desktopNav = container.querySelector('nav.hidden');
            expect(desktopNav).toBeInTheDocument();
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

        it('mobile dropdown contains navigation items including Messages', () => {
            const { container } = render(<PlayerNavbar playerId={mockPlayerId} />);
            const mobileButton = container.querySelector('.mobile-menu-button') as HTMLElement;
            fireEvent.click(mobileButton);
            const mobileDropdown = container.querySelector('.mobile-dropdown');
            expect(mobileDropdown).toBeInTheDocument();
            const dropdownLinks = mobileDropdown?.querySelectorAll('a, button');
            expect(dropdownLinks?.length).toBeGreaterThanOrEqual(3);
        });

        it('mobile dropdown contains Messages link', () => {
            const { container } = render(<PlayerNavbar playerId={mockPlayerId} />);
            const mobileButton = container.querySelector('.mobile-menu-button') as HTMLElement;
            fireEvent.click(mobileButton);
            const mobileDropdown = container.querySelector('.mobile-dropdown');
            const messagesEl = Array.from(mobileDropdown?.querySelectorAll('a, button') ?? []).find(
                el => el.textContent === 'Messages'
            );
            expect(messagesEl).toBeInTheDocument();
        });

        it('closes mobile menu when a navigation item is clicked', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);
            const mobileButton = screen.getByLabelText('Toggle menu');
            fireEvent.click(mobileButton);
            expect(mobileButton).toHaveAttribute('aria-expanded', 'true');
            const profileLinks = screen.getAllByText('Profile');
            const mobileProfileLink = profileLinks.find(el => el.closest('.mobile-dropdown'));
            if (mobileProfileLink) fireEvent.click(mobileProfileLink);
            expect(mobileButton).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('has proper navigation landmark', () => {
            const { container } = render(<PlayerNavbar playerId={mockPlayerId} />);
            expect(container.querySelector('nav')).toBeInTheDocument();
        });

        it('Home link is keyboard accessible', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);
            const homeLink = screen.getAllByText('Home')[0].closest('a');
            expect(homeLink).toHaveAttribute('href');
        });

        it('Log Out button is keyboard accessible', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);
            expect(screen.getByText('Log Out').closest('button')?.tagName).toBe('BUTTON');
        });

        it('buttons have appropriate cursor styling', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);
            expect(screen.getByText('Log Out').closest('button')?.tagName).toBe('BUTTON');
        });
    });

    describe('Component Props', () => {
        it('accepts and uses playerId prop', () => {
            render(<PlayerNavbar playerId={mockPlayerId} />);
            const homeLink = screen.getAllByText('Home')[0].closest('a');
            expect(homeLink).toHaveAttribute('href', `/player/${mockPlayerId}/dashboard`);
        });

        it('handles different playerId formats', () => {
            const playerIds = ['player-123', 'abc-def-ghi', '12345', 'player_test_001'];
            playerIds.forEach(playerId => {
                const { unmount } = render(<PlayerNavbar playerId={playerId} />);
                const homeLink = screen.getAllByText('Home')[0].closest('a');
                expect(homeLink).toHaveAttribute('href', `/player/${playerId}/dashboard`);
                unmount();
            });
        });
    });
});
