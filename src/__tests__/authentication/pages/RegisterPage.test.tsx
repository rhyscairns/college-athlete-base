import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterPage } from '@/authentication/pages/RegisterPage';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

// Mock the SplitScreenLayout component
jest.mock('@/authentication/components/SplitScreenLayout', () => ({
    SplitScreenLayout: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="split-screen-layout" className="min-h-screen flex flex-col lg:flex-row">
            {children}
        </div>
    ),
}));

describe('RegisterPage', () => {
    beforeEach(() => {
        mockPush.mockClear();
    });

    it('renders the page heading', () => {
        render(<RegisterPage />);

        expect(screen.getByText('Create your account')).toBeInTheDocument();
    });

    it('renders the RoleSelector component', () => {
        render(<RegisterPage />);

        expect(screen.getByRole('button', { name: /register as player/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /register as coach/i })).toBeInTheDocument();
    });

    it('renders link back to login page', () => {
        render(<RegisterPage />);

        const loginLink = screen.getByText('Sign in');
        expect(loginLink).toBeInTheDocument();
        expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
    });

    it('navigates to /register/player when Player role is selected', async () => {
        const user = userEvent.setup();
        render(<RegisterPage />);

        const playerButton = screen.getByRole('button', { name: /register as player/i });
        await user.click(playerButton);

        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledWith('/register/player');
    });

    it('navigates to /register/coach when Coach role is selected', async () => {
        const user = userEvent.setup();
        render(<RegisterPage />);

        const coachButton = screen.getByRole('button', { name: /register as coach/i });
        await user.click(coachButton);

        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledWith('/register/coach');
    });

    it('renders with SplitScreenLayout', () => {
        render(<RegisterPage />);

        expect(screen.getByTestId('split-screen-layout')).toBeInTheDocument();
    });

    it('has proper responsive layout classes', () => {
        const { container } = render(<RegisterPage />);

        const mainContainer = container.querySelector('.min-h-screen');
        expect(mainContainer).toHaveClass('flex', 'flex-col', 'lg:flex-row');
    });
});
