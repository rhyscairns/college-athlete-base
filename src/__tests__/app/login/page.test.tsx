import { render, screen } from '@testing-library/react';
import Login from '@/app/login/page';

// Mock the LoginPage component
jest.mock('@/authentication/pages/LoginPage', () => ({
    LoginPage: ({ redirectTo }: { redirectTo?: string }) => (
        <div data-testid="login-page">
            Login Page (redirectTo: {redirectTo})
        </div>
    ),
}));

describe('Login Route Page', () => {
    it('renders the LoginPage component', () => {
        render(<Login />);

        const loginPage = screen.getByTestId('login-page');
        expect(loginPage).toBeInTheDocument();
    });

    it('passes redirectTo prop as "/"', () => {
        render(<Login />);

        const loginPage = screen.getByTestId('login-page');
        expect(loginPage).toHaveTextContent('redirectTo: /');
    });
});
