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
}));

describe('CoachNavbar', () => {
    const mockCoachId = 'coach-123';

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render the navigation bar', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            expect(screen.getByRole('navigation')).toBeInTheDocument();
        });

        it('should render CAB branding as a link', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            const brandingLink = screen.getByRole('link', { name: /College Athlete Base/i });
            expect(brandingLink).toBeInTheDocument();
            expect(brandingLink).toHaveAttribute('href', `/coach/${mockCoachId}/dashboard`);
        });

        it('should render desktop navigation items', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
            expect(screen.getAllByRole('button', { name: 'Search' })[0]).toBeInTheDocument();
            expect(screen.getAllByRole('button', { name: 'Prospects' })[0]).toBeInTheDocument();
            expect(screen.getAllByRole('button', { name: 'Messages' })[0]).toBeInTheDocument();
            expect(screen.getAllByRole('button', { name: 'Profile' })[0]).toBeInTheDocument();
            expect(screen.getAllByRole('button', { name: 'Log Out' })[0]).toBeInTheDocument();
        });

        it('should have correct Home link href', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            const homeLink = screen.getByRole('link', { name: 'Home' });
            expect(homeLink).toHaveAttribute('href', `/coach/${mockCoachId}/dashboard`);
        });

        it('should have correct CAB branding href using coachId', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            const brandingLink = screen.getByRole('link', { name: /College Athlete Base/i });
            expect(brandingLink).toHaveAttribute('href', `/coach/${mockCoachId}/dashboard`);
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
            const profileButton = screen.getAllByRole('button', { name: 'Profile' })[0];
            const logoutButton = screen.getAllByRole('button', { name: 'Log Out' })[0];
            expect(profileButton).toBeEnabled();
            expect(logoutButton).toBeEnabled();
            expect(() => fireEvent.click(profileButton)).not.toThrow();
            expect(() => fireEvent.click(logoutButton)).not.toThrow();
        });
    });

    describe('Prospects Navigation', () => {
        it('should render Prospects button in desktop nav', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            expect(screen.getAllByRole('button', { name: 'Prospects' })[0]).toBeInTheDocument();
        });

        it('should render Prospects button in mobile menu', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            fireEvent.click(screen.getByLabelText('Toggle menu'));
            const prospectsButtons = screen.getAllByRole('button', { name: 'Prospects' });
            expect(prospectsButtons.length).toBeGreaterThanOrEqual(1);
            expect(screen.getByRole('menu', { name: /mobile navigation menu/i })).toBeInTheDocument();
        });

        it('should close mobile menu when Prospects is clicked', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            const hamburger = screen.getByLabelText('Toggle menu');
            fireEvent.click(hamburger);
            expect(hamburger).toHaveAttribute('aria-expanded', 'true');
            const prospectsButtons = screen.getAllByRole('button', { name: 'Prospects' });
            fireEvent.click(prospectsButtons[prospectsButtons.length - 1]);
            expect(hamburger).toHaveAttribute('aria-expanded', 'false');
        });
    });

    describe('Messages Navigation', () => {
        it('should render Messages button in desktop nav', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            expect(screen.getAllByRole('button', { name: 'Messages' })[0]).toBeInTheDocument();
        });

        it('should render Messages button between Prospects and Profile', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            const buttons = screen.getAllByRole('button');
            const names = buttons.map((b) => b.textContent?.trim());
            const prospectsIdx = names.indexOf('Prospects');
            const messagesIdx = names.indexOf('Messages');
            const profileIdx = names.indexOf('Profile');
            expect(messagesIdx).toBeGreaterThan(prospectsIdx);
            expect(messagesIdx).toBeLessThan(profileIdx);
        });

        it('should render Messages button in mobile menu', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            fireEvent.click(screen.getByLabelText('Toggle menu'));
            const mobileMenu = screen.getByRole('menu', { name: /mobile navigation menu/i });
            expect(mobileMenu).toBeInTheDocument();
            const messagesButtons = screen.getAllByRole('button', { name: 'Messages' });
            expect(messagesButtons.length).toBeGreaterThanOrEqual(1);
        });

        it('should close mobile menu when Messages is clicked', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            const hamburger = screen.getByLabelText('Toggle menu');
            fireEvent.click(hamburger);
            expect(hamburger).toHaveAttribute('aria-expanded', 'true');
            const messagesButtons = screen.getAllByRole('button', { name: 'Messages' });
            fireEvent.click(messagesButtons[messagesButtons.length - 1]);
            expect(hamburger).toHaveAttribute('aria-expanded', 'false');
        });

        it('should render NotificationBell with correct props', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            const bell = screen.getByTestId('notification-bell');
            expect(bell).toBeInTheDocument();
            expect(bell).toHaveAttribute('data-user-id', mockCoachId);
            expect(bell).toHaveAttribute('data-user-type', 'coach');
        });
    });

    describe('Accessibility', () => {
        it('should have proper semantic HTML structure', () => {
            render(<CoachNavbar coachId={mockCoachId} />);
            expect(screen.getByRole('navigation')).toBeInTheDocument();
            expect(screen.getByRole('link', { name: /College Athlete Base/i })).toBeInTheDocument();
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
            render(<CoachNavbar coachId={mockCoachId} />);
            const hamburgerButton = screen.getByLabelText('Toggle menu');
            fireEvent.click(hamburgerButton);
            expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');
            const profileButtons = screen.getAllByRole('button', { name: 'Profile' });
            fireEvent.click(profileButtons[profileButtons.length - 1]);
            expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
        });
    });
});
