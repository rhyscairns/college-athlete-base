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

describe('RegisterPage', () => {
    beforeEach(() => {
        mockPush.mockClear();
    });

    it('renders the page title', () => {
        render(<RegisterPage />);

        expect(screen.getByText('COLLEGE ATHLETE BASE')).toBeInTheDocument();
    });

    it('renders the RoleSelector component', () => {
        render(<RegisterPage />);

        expect(screen.getByText('Choose Your Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /register as player/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /register as coach/i })).toBeInTheDocument();
    });

    it('renders link back to login page', () => {
        render(<RegisterPage />);

        const loginLink = screen.getByRole('link', { name: /already have an account\? sign in/i });
        expect(loginLink).toBeInTheDocument();
        expect(loginLink).toHaveAttribute('href', '/login');
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

    it('has consistent styling with login page', () => {
        const { container } = render(<RegisterPage />);

        // Check for the same background styling classes
        const backgroundDiv = container.querySelector('.bg-sky-200');
        expect(backgroundDiv).toBeInTheDocument();

        // Check for the same title styling
        const title = screen.getByText('COLLEGE ATHLETE BASE');
        expect(title.tagName).toBe('STRONG');
        expect(title.parentElement).toHaveClass('text-6xl');
        expect(title.parentElement).toHaveClass('font-mono');
        expect(title.parentElement).toHaveClass('text-white');
    });

    it('displays background image', () => {
        const { container } = render(<RegisterPage />);

        const backgroundImage = container.querySelector('.absolute.inset-0.opacity-90');
        expect(backgroundImage).toBeInTheDocument();
        expect(backgroundImage).toHaveStyle({ backgroundSize: 'cover' });
    });

    it('has proper responsive layout classes', () => {
        const { container } = render(<RegisterPage />);

        const mainContainer = container.querySelector('.min-h-screen');
        expect(mainContainer).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });
});
