import { render, screen } from '@testing-library/react';
import { LoginPage } from '@/authentication/pages/LoginPage';
import type { User } from '@/authentication/types';

// Mock the LoginForm component
jest.mock('@/authentication/components/LoginForm', () => ({
    LoginForm: ({ onSuccess, redirectTo }: { onSuccess?: (user: User) => void; redirectTo?: string }) => (
        <div data-testid="login-form">
            <span data-testid="on-success">{onSuccess ? 'has-onSuccess' : 'no-onSuccess'}</span>
            <span data-testid="redirect-to">{redirectTo || 'no-redirect'}</span>
        </div>
    ),
}));

describe('LoginPage', () => {
    it('renders without crashing', () => {
        render(<LoginPage />);
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    it('applies responsive container classes', () => {
        const { container } = render(<LoginPage />);
        const wrapper = container.firstChild as HTMLElement;

        expect(wrapper).toHaveClass('min-h-screen');
        expect(wrapper).toHaveClass('flex');
        expect(wrapper).toHaveClass('items-center');
        expect(wrapper).toHaveClass('justify-center');
    });

    it('applies responsive padding classes', () => {
        const { container } = render(<LoginPage />);
        const wrapper = container.firstChild as HTMLElement;

        expect(wrapper).toHaveClass('px-4');
        expect(wrapper).toHaveClass('sm:px-6');
        expect(wrapper).toHaveClass('lg:px-8');
    });

    it('applies background color', () => {
        const { container } = render(<LoginPage />);
        const wrapper = container.firstChild as HTMLElement;

        expect(wrapper).toHaveClass('bg-sky-200');
    });

    it('constrains content width with max-w-md', () => {
        const { container } = render(<LoginPage />);
        const innerWrapper = container.querySelector('.max-w-md');

        expect(innerWrapper).toBeInTheDocument();
        expect(innerWrapper).toHaveClass('w-full');
    });

    it('passes onSuccess prop to LoginForm', () => {
        const mockOnSuccess = jest.fn();
        render(<LoginPage onSuccess={mockOnSuccess} />);

        expect(screen.getByTestId('on-success')).toHaveTextContent('has-onSuccess');
    });

    it('passes redirectTo prop to LoginForm', () => {
        render(<LoginPage redirectTo="/dashboard" />);

        expect(screen.getByTestId('redirect-to')).toHaveTextContent('/dashboard');
    });

    it('renders LoginForm without props when none provided', () => {
        render(<LoginPage />);

        expect(screen.getByTestId('on-success')).toHaveTextContent('no-onSuccess');
        expect(screen.getByTestId('redirect-to')).toHaveTextContent('no-redirect');
    });

    it('centers content vertically and horizontally', () => {
        const { container } = render(<LoginPage />);
        const wrapper = container.firstChild as HTMLElement;

        // Check for flexbox centering
        expect(wrapper).toHaveClass('flex');
        expect(wrapper).toHaveClass('items-center'); // vertical centering
        expect(wrapper).toHaveClass('justify-center'); // horizontal centering
    });

    it('uses full viewport height', () => {
        const { container } = render(<LoginPage />);
        const wrapper = container.firstChild as HTMLElement;

        expect(wrapper).toHaveClass('min-h-screen');
    });

    it('has proper structure for responsive layout', () => {
        const { container } = render(<LoginPage />);

        // Outer container
        const outerDiv = container.firstChild as HTMLElement;
        expect(outerDiv.tagName).toBe('DIV');

        // Find the form container (skip the background image div and title div)
        const formContainer = Array.from(outerDiv.children).find(
            child => child.classList.contains('max-w-md')
        ) as HTMLElement;

        expect(formContainer).toBeTruthy();
        expect(formContainer).toHaveClass('w-full');
        expect(formContainer).toHaveClass('max-w-md');
    });

    it('passes all props correctly to LoginForm', () => {
        const mockOnSuccess = jest.fn();
        const redirectTo = '/home';

        render(<LoginPage onSuccess={mockOnSuccess} redirectTo={redirectTo} />);

        expect(screen.getByTestId('on-success')).toHaveTextContent('has-onSuccess');
        expect(screen.getByTestId('redirect-to')).toHaveTextContent('/home');
    });
});
