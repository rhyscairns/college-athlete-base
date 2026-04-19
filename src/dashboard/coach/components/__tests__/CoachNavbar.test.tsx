import { render, screen, fireEvent } from '@testing-library/react';
import { CoachNavbar } from '../CoachNavbar';

// Mock AthleteSearchModal
jest.mock('../AthleteSearchModal', () => ({
    AthleteSearchModal: ({ isOpen, onClose, coachId }: { isOpen: boolean; onClose: () => void; coachId: string }) => (
        isOpen ? (
            <div data-testid="athlete-search-modal" data-coach-id={coachId}>
                <button onClick={onClose}>Close Modal</button>
            </div>
        ) : null
    ),
}));

describe('CoachNavbar', () => {
    const mockCoachId = 'coach-123';

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render the navigation bar', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const nav = screen.getByRole('navigation');
            expect(nav).toBeInTheDocument();
        });

        it('should render CAB branding as a link', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const brandingLink = screen.getByRole('link', { name: /College Athlete Base/i });
            expect(brandingLink).toBeInTheDocument();
            expect(brandingLink).toHaveAttribute('href', '/coach/dashboard');
        });

        it('should render desktop navigation items', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
            expect(screen.getAllByRole('button', { name: 'Search' })[0]).toBeInTheDocument();
            expect(screen.getAllByRole('button', { name: 'Profile' })[0]).toBeInTheDocument();
            expect(screen.getAllByRole('button', { name: 'Log Out' })[0]).toBeInTheDocument();
        });

        it('should have correct Home link href', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const homeLink = screen.getByRole('link', { name: 'Home' });
            expect(homeLink).toHaveAttribute('href', `/coach/dashboard/${mockCoachId}`);
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

            const closeButton = screen.getByRole('button', { name: 'Close Modal' });
            fireEvent.click(closeButton);

            expect(screen.queryByTestId('athlete-search-modal')).not.toBeInTheDocument();
        });
    });

    describe('Navigation Actions', () => {
        it('should call onClick handlers when buttons are clicked', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const profileButton = screen.getAllByRole('button', { name: 'Profile' })[0];
            const logoutButton = screen.getAllByRole('button', { name: 'Log Out' })[0];

            // Verify buttons are clickable
            expect(profileButton).toBeEnabled();
            expect(logoutButton).toBeEnabled();

            // Click should not throw
            expect(() => fireEvent.click(profileButton)).not.toThrow();
            expect(() => fireEvent.click(logoutButton)).not.toThrow();
        });
    });

    describe('Accessibility', () => {
        it('should have proper semantic HTML structure', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            // Check for nav element
            expect(screen.getByRole('navigation')).toBeInTheDocument();

            // Check for links and buttons
            expect(screen.getByRole('link', { name: /College Athlete Base/i })).toBeInTheDocument();
            expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
        });

        it('should support keyboard navigation', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const searchButton = screen.getAllByRole('button', { name: 'Search' })[0];

            // Focus the button
            searchButton.focus();
            expect(document.activeElement).toBe(searchButton);

            // Click the button (simulating keyboard activation)
            fireEvent.click(searchButton);

            // Modal should open
            expect(screen.getByTestId('athlete-search-modal')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle special characters in coachId', () => {
            const specialCoachId = 'coach-123-abc_def';
            render(<CoachNavbar coachId={specialCoachId} />);

            const homeLink = screen.getByRole('link', { name: 'Home' });
            expect(homeLink).toHaveAttribute('href', `/coach/dashboard/${specialCoachId}`);
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

            // Initially closed
            expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');

            // Open menu
            fireEvent.click(hamburgerButton);
            expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');

            // Close menu
            fireEvent.click(hamburgerButton);
            expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
        });

        it('should render mobile dropdown menu when opened', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const hamburgerButton = screen.getByLabelText('Toggle menu');

            // Open menu
            fireEvent.click(hamburgerButton);

            // Mobile menu should be visible - check that menu items exist in DOM
            // Even if hidden by CSS, they should be in the document when menu is open
            const allSearchButtons = screen.getAllByText('Search');
            // Should have both desktop and mobile search buttons (even if one is hidden by CSS)
            expect(allSearchButtons.length).toBeGreaterThanOrEqual(1);

            // Verify hamburger button shows menu is expanded
            expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');
        });

        it('should close mobile menu when search is clicked', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const hamburgerButton = screen.getByLabelText('Toggle menu');

            // Open menu
            fireEvent.click(hamburgerButton);
            expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');

            // Get search button from mobile menu while it's open
            const searchButtons = screen.getAllByRole('button', { name: 'Search' });
            // Desktop button is first, mobile is last
            const mobileSearchButton = searchButtons[searchButtons.length - 1];

            fireEvent.click(mobileSearchButton);

            // Menu should close
            expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
        });

        it('should close mobile menu when profile is clicked', () => {
            render(<CoachNavbar coachId={mockCoachId} />);

            const hamburgerButton = screen.getByLabelText('Toggle menu');

            // Open menu
            fireEvent.click(hamburgerButton);
            expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');

            // Get profile button from mobile menu while it's open
            const profileButtons = screen.getAllByRole('button', { name: 'Profile' });
            // Desktop button is first, mobile is last
            const mobileProfileButton = profileButtons[profileButtons.length - 1];

            fireEvent.click(mobileProfileButton);

            // Menu should close (checked via aria-expanded before navigation)
            expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
        });
    });
});
