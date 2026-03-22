import { render, screen } from '@testing-library/react';
import { LoginPage } from '@/authentication/pages/LoginPage';
import type { User } from '@/authentication/types';

// Mock the LoginForm component
jest.mock('@/authentication/components/LoginForm', () => ({
    LoginForm: ({ onSuccess, redirectTo }: { onSuccess?: (_user: User) => void; redirectTo?: string }) => (
        <div data-testid="login-form">
            <span data-testid="on-success">{onSuccess ? 'has-onSuccess' : 'no-onSuccess'}</span>
            <span data-testid="redirect-to">{redirectTo || 'no-redirect'}</span>
        </div>
    ),
}));

// Mock the SplitScreenLayout component
jest.mock('@/authentication/components/SplitScreenLayout', () => ({
    SplitScreenLayout: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="split-screen-layout" className="min-h-screen flex flex-col lg:flex-row">
            {children}
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
        expect(wrapper).toHaveClass('flex-col');
        expect(wrapper).toHaveClass('lg:flex-row');
    });

    it('renders with SplitScreenLayout', () => {
        render(<LoginPage />);
        expect(screen.getByTestId('split-screen-layout')).toBeInTheDocument();
    });

    it('renders sign in heading', () => {
        render(<LoginPage />);
        expect(screen.getByText('Sign in')).toBeInTheDocument();
    });

    it('renders sign up link', () => {
        render(<LoginPage />);
        const signUpLink = screen.getByText('Sign up');
        expect(signUpLink).toBeInTheDocument();
        expect(signUpLink.closest('a')).toHaveAttribute('href', '/register');
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

    it('uses full viewport height', () => {
        const { container } = render(<LoginPage />);
        const wrapper = container.firstChild as HTMLElement;

        expect(wrapper).toHaveClass('min-h-screen');
    });

    it('has proper structure for responsive layout', () => {
        render(<LoginPage />);

        // Check that the layout is rendered
        expect(screen.getByTestId('split-screen-layout')).toBeInTheDocument();
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    it('passes all props correctly to LoginForm', () => {
        const mockOnSuccess = jest.fn();
        const redirectTo = '/home';

        render(<LoginPage onSuccess={mockOnSuccess} redirectTo={redirectTo} />);

        expect(screen.getByTestId('on-success')).toHaveTextContent('has-onSuccess');
        expect(screen.getByTestId('redirect-to')).toHaveTextContent('/home');
    });
});
