import { render, screen } from '@testing-library/react';
import Login from '@/app/login/page';
import { useRouter } from 'next/navigation';
import type { User } from '@/authentication/types';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Store the onSuccess callback for testing
let capturedOnSuccess: ((user: User) => void) | undefined;

// Mock the LoginPage component
jest.mock('@/authentication/pages/LoginPage', () => ({
    LoginPage: ({ onSuccess }: { onSuccess?: (user: User) => void }) => {
        capturedOnSuccess = onSuccess;
        return <div data-testid="login-page">Login Page</div>;
    },
}));

describe('Login Route Page', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
    });

    it('renders the LoginPage component', () => {
        render(<Login />);

        const loginPage = screen.getByTestId('login-page');
        expect(loginPage).toBeInTheDocument();
    });

    it('redirects to player dashboard on successful player login', () => {
        render(<Login />);

        // Simulate successful player login
        const playerUser: User = {
            id: 'test-player-id',
            email: 'test@example.com',
            name: 'Test Player',
            role: 'player',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        capturedOnSuccess?.(playerUser);

        expect(mockPush).toHaveBeenCalledWith('/player/dashboard/test-player-id');
    });

    it('redirects to coach dashboard on successful coach login', () => {
        render(<Login />);

        // Simulate successful coach login
        const coachUser: User = {
            id: 'test-coach-id',
            email: 'coach@university.edu',
            name: 'Test Coach',
            role: 'coach',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        capturedOnSuccess?.(coachUser);

        expect(mockPush).toHaveBeenCalledWith('/coach/dashboard/test-coach-id');
    });

    it('redirects to home page for unknown role', () => {
        render(<Login />);

        // Simulate login with unknown role
        const unknownUser: User = {
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
            role: 'unknown' as any,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        capturedOnSuccess?.(unknownUser);

        expect(mockPush).toHaveBeenCalledWith('/');
    });
});
