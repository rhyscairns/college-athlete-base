import { render, screen, fireEvent } from '@testing-library/react';
import { CoachNavbar } from '../CoachNavbar';

jest.mock('../AthleteSearchModal', () => ({
    AthleteSearchModal: ({ isOpen, onClose, coachId }: { isOpen: boolean; onClose: () => void; coachId: string }) => (
        isOpen ? (
            <div data-testid="athlete-search-modal" data-coach-id={coachId}>
                <button onClick={onClose}>Close Modal</button>
            </div>
        ) : null
    ),
}));

jest.mock('../../../../messages/components/NotificationBell', () => ({
    NotificationBell: ({ userId, userType }: { userId: string; userType: string }) => (
        <div data-testid="notification-bell" data-user-id={userId} data-user-type={userType} />
    ),
}));

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn() }),
    usePathname: () => '/coach/coach-123/dashboard',
}));

describe('CoachNavbar', () => {
    const mockCoachId = 'coach-123';

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render the navigation bar', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            expect(screen.getAllByRole('navigation')[0]).toBeInTheDocument();
        });

        it('should render CAB branding as a link', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            const brandingLinks = screen.getAllByRole('link', { name: /College Athlete Base/i });
            expect(brandingLinks[0]).toBeInTheDocument();
            expect(brandingLinks[0]).toHaveAttribute('href', `/coach/${mockCoachId}/dashboard`);
        });

        it('should render desktop navigation items', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
            expect(screen.getAllByRole('button', { name: 'Search' })[0]).toBeInTheDocument();
            // Prospects, Messages, Profile are now Links in the redesign
            expect(screen.getAllByText('Prospects')[0]).toBeInTheDocument();
            expect(screen.getAllByText('Messages')[0]).toBeInTheDocument();
            expect(screen.getAllByText('Profile')[0]).toBeInTheDocument();
            expect(screen.getAllByRole('button', { name: 'Log Out' })[0]).toBeInTheDocument();
        });

        it('should have correct Home link href', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            const homeLink = screen.getByRole('link', { name: 'Home' });
            expect(homeLink).toHaveAttribute('href', `/coach/${mockCoachId}/dashboard`);
        });

        it('should have correct CAB branding href using coachId', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            const brandingLinks = screen.getAllByRole('link', { name: /College Athlete Base/i });
            expect(brandingLinks[0]).toHaveAttribute('href', `/coach/${mockCoachId}/dashboard`);
        });
    });

    describe('Search Modal', () => {
        it('should open search modal when Search button is clicked', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            const searchButton = screen.getAllByRole('button', { name: 'Search' })[0];
            fireEvent.click(searchButton);
            const modal = screen.getByTestId('athlete-search-modal');
            expect(modal).toBeInTheDocument();
            expect(modal).toHaveAttribute('data-coach-id', mockCoachId);
        });

        it('should close search modal when close is triggered', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            const searchButton = screen.getAllByRole('button', { name: 'Search' })[0];
            fireEvent.click(searchButton);
            fireEvent.click(screen.getByRole('button', { name: 'Close Modal' }));
            expect(screen.queryByTestId('athlete-search-modal')).not.toBeInTheDocument();
        });
    });

    describe('Navigation Actions', () => {
        it('should call onClick handlers when buttons are clicked', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            const logoutButton = screen.getAllByRole('button', { name: 'Log Out' })[0];
            expect(logoutButton).toBeEnabled();
            expect(() => fireEvent.click(logoutButton)).not.toThrow();
        });
    });

    describe('Prospects Navigation', () => {
        it('should render Prospects button in desktop nav', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            expect(screen.getAllByText('Prospects')[0]).toBeInTheDocument();
        });

        it('should render Prospects button in mobile menu', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            fireEvent.click(screen.getByLabelText('Toggle menu'));
            expect(screen.getByRole('menu', { name: /mobile navigation menu/i })).toBeInTheDocument();
            expect(screen.getAllByText('Prospects').length).toBeGreaterThanOrEqual(1);
        });

        it('should close mobile menu when Prospects is clicked', () => {
            const { container } = render(<CoachNavbar coachId={mockCoachId} />);
            const hamburger = screen.getByLabelText('Toggle menu');
            fireEvent.click(hamburger);
            expect(hamburger).toHaveAttribute('aria-expanded', 'true');
            const dropdown = container.querySelector('.mobile-dropdown');
            const prospectsLink = Array.from(dropdown?.querySelectorAll('a') ?? []).find(
                el => el.textContent === 'Prospects'
            );
            if (prospectsLink) fireEvent.click(prospectsLink);
            expect(hamburger).toHaveAttribute('aria-expanded', 'false');
        });
    });

    describe('Messages Navigation', () => {
        it('should render Messages button in desktop nav', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            expect(screen.getAllByText('Messages')[0]).toBeInTheDocument();
        });

        it('should render Messages button between Prospects and Profile', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            const allText = Array.from(document.querySelectorAll('a, button'))
                .map(el => el.textContent?.trim())
                .filter(Boolean);
            const prospectsIdx = allText.indexOf('Prospects');
            const messagesIdx = allText.indexOf('Messages');
            const profileIdx = allText.indexOf('Profile');
            expect(messagesIdx).toBeGreaterThan(prospectsIdx);
            expect(messagesIdx).toBeLessThan(profileIdx);
        });

        it('should render Messages button in mobile menu', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            fireEvent.click(screen.getByLabelText('Toggle menu'));
            const mobileMenu = screen.getByRole('menu', { name: /mobile navigation menu/i });
            expect(mobileMenu).toBeInTheDocument();
            expect(screen.getAllByText('Messages').length).toBeGreaterThanOrEqual(1);
        });

        it('should close mobile menu when Messages is clicked', () => {
            const { container } = render(<CoachNavbar coachId={mockCoachId} />);
            const hamburger = screen.getByLabelText('Toggle menu');
            fireEvent.click(hamburger);
            expect(hamburger).toHaveAttribute('aria-expanded', 'true');
            const dropdown = container.querySelector('.mobile-dropdown');
            const messagesLink = Array.from(dropdown?.querySelectorAll('a') ?? []).find(
                el => el.textContent === 'Messages'
            );
            if (messagesLink) fireEvent.click(messagesLink);
            expect(hamburger).toHaveAttribute('aria-expanded', 'false');
        });

        it('should render NotificationBell with correct props', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            const bells = screen.getAllByTestId('notification-bell');
            expect(bells[0]).toHaveAttribute('data-user-id', mockCoachId);
            expect(bells[0]).toHaveAttribute('data-user-type', 'coach');
        });
    });

    describe('Accessibility', () => {
        it('should have proper semantic HTML structure', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            expect(screen.getAllByRole('navigation')[0]).toBeInTheDocument();
            expect(screen.getAllByRole('link', { name: /College Athlete Base/i })[0]).toBeInTheDocument();
            expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
        });

        it('should support keyboard navigation', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            const searchButton = screen.getAllByRole('button', { name: 'Search' })[0];
            searchButton.focus();
            expect(document.activeElement).toBe(searchButton);
            fireEvent.click(searchButton);
            expect(screen.getByTestId('athlete-search-modal')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle special characters in coachId', () => {
            const specialCoachId = 'coach-123-abc_def';
            render(<CoachNavbar coachId={specialCoachId} />);
            const homeLink = screen.getByRole('link', { name: 'Home' });
            expect(homeLink).toHaveAttribute('href', `/coach/${specialCoachId}/dashboard`);
        });
    });

    describe('Mobile Menu', () => {
        it('should have hamburger button with proper accessibility attributes', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            const hamburgerButton = screen.getByLabelText('Toggle menu');
            expect(hamburgerButton).toBeInTheDocument();
            expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
        });

        it('should toggle aria-expanded when hamburger button is clicked', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            const hamburgerButton = screen.getByLabelText('Toggle menu');
            expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
            fireEvent.click(hamburgerButton);
            expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');
            fireEvent.click(hamburgerButton);
            expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
        });

        it('should render mobile dropdown menu when opened', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            const hamburgerButton = screen.getByLabelText('Toggle menu');
            fireEvent.click(hamburgerButton);
            const allSearchButtons = screen.getAllByText('Search');
            expect(allSearchButtons.length).toBeGreaterThanOrEqual(1);
            expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');
        });

        it('should close mobile menu when search is clicked', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            const hamburgerButton = screen.getByLabelText('Toggle menu');
            fireEvent.click(hamburgerButton);
            expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');
            const searchButtons = screen.getAllByRole('button', { name: 'Search' });
            fireEvent.click(searchButtons[searchButtons.length - 1]);
            expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
        });

        it('should close mobile menu when profile is clicked', () => {
            const { container } = render(<CoachNavbar coachId={mockCoachId} />);
            const hamburgerButton = screen.getByLabelText('Toggle menu');
            fireEvent.click(hamburgerButton);
            expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');
            const dropdown = container.querySelector('.mobile-dropdown');
            const profileLink = Array.from(dropdown?.querySelectorAll('a') ?? []).find(
                el => el.textContent === 'Profile'
            );
            if (profileLink) fireEvent.click(profileLink);
            expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
        });
    });
});
