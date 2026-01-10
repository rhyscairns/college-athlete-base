/**
 * Tests for CoachRegisterPage component
 */

import { render, screen, waitFor } from '../../utils/test-utils';
import { CoachRegisterPage } from '@/authentication/pages/CoachRegisterPage';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock CoachRegistrationForm
jest.mock('@/authentication/components/CoachRegistrationForm', () => ({
    CoachRegistrationForm: ({ onSubmit, onCancel }: any) => (
        <div data-testid="coach-registration-form">
            <button onClick={async () => {
                try {
                    await onSubmit({
                        firstName: 'John',
                        lastName: 'Coach',
                        email: 'john@example.com',
                        password: 'Password123!',
                        coachingCategory: 'mens',
                        sports: ['basketball'],
                        university: 'UCLA'
                    });
                } catch (error) {
                    // Form would handle error display
                }
            }}>
                Submit Form
            </button>
            <button onClick={onCancel}>Cancel</button>
        </div>
    ),
}));

describe('CoachRegisterPage', () => {
    const mockPush = jest.fn();
    const mockRouter = {
        push: mockPush,
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        global.fetch = jest.fn();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    describe('Component Rendering', () => {
        it('renders the coach registration page', () => {
            render(<CoachRegisterPage />);

            expect(screen.getByText(/COACH REGISTRATION/i)).toBeInTheDocument();
            expect(screen.getByTestId('coach-registration-form')).toBeInTheDocument();
        });

        it('renders back to login button', () => {
            render(<CoachRegisterPage />);

            expect(screen.getByText(/Back to Login/i)).toBeInTheDocument();
        });

        it('navigates to login when back button is clicked', () => {
            render(<CoachRegisterPage />);

            const backButton = screen.getByText(/Back to Login/i);
            backButton.click();

            expect(mockPush).toHaveBeenCalledWith('/login');
        });
    });

    describe('Form Submission', () => {
        it('submits form data to API successfully', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    message: 'Coach registered successfully',
                    coachId: 'coach-123',
                }),
            });

            render(<CoachRegisterPage />);

            const submitButton = screen.getByText('Submit Form');
            submitButton.click();

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalledWith(
                    '/api/auth/register/coach',
                    expect.objectContaining({
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            firstName: 'John',
                            lastName: 'Coach',
                            email: 'john@example.com',
                            password: 'Password123!',
                            coachingCategory: 'mens',
                            sports: ['basketball'],
                            university: 'UCLA',
                        }),
                    })
                );
            });
        });

        it('displays success message after successful registration', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    message: 'Coach registered successfully',
                    coachId: 'coach-123',
                }),
            });

            render(<CoachRegisterPage />);

            const submitButton = screen.getByText('Submit Form');
            submitButton.click();

            await waitFor(() => {
                expect(screen.getByText(/Success!/i)).toBeInTheDocument();
                expect(screen.getByText(/Registration successful! Redirecting to login.../i)).toBeInTheDocument();
            });
        });

        it('redirects to login after successful registration', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    success: true,
                    message: 'Coach registered successfully',
                    coachId: 'coach-123',
                }),
            });

            render(<CoachRegisterPage />);

            const submitButton = screen.getByText('Submit Form');
            submitButton.click();

            await waitFor(() => {
                expect(screen.getByText(/Success!/i)).toBeInTheDocument();
            });

            // Fast-forward time by 2 seconds
            jest.advanceTimersByTime(2000);

            expect(mockPush).toHaveBeenCalledWith('/login');
        });
    });

    describe('Error Handling', () => {
        it('handles validation errors from API', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({
                    success: false,
                    message: 'Validation failed',
                    errors: [
                        { field: 'email', message: 'Invalid email address' },
                        { field: 'password', message: 'Password too weak' },
                    ],
                }),
            });

            render(<CoachRegisterPage />);

            const submitButton = screen.getByText('Submit Form');
            submitButton.click();

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'Coach registration error:',
                    expect.any(Error)
                );
            });

            consoleErrorSpy.mockRestore();
        });

        it('handles email already registered error', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({
                    success: false,
                    message: 'Email already registered',
                }),
            });

            render(<CoachRegisterPage />);

            const submitButton = screen.getByText('Submit Form');
            submitButton.click();

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'Coach registration error:',
                    expect.objectContaining({
                        message: 'Email already registered',
                    })
                );
            });

            consoleErrorSpy.mockRestore();
        });

        it('handles network errors', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            render(<CoachRegisterPage />);

            const submitButton = screen.getByText('Submit Form');
            submitButton.click();

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'Coach registration error:',
                    expect.objectContaining({
                        message: 'Network error',
                    })
                );
            });

            consoleErrorSpy.mockRestore();
        });

        it('handles generic API errors', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: async () => ({}),
            });

            render(<CoachRegisterPage />);

            const submitButton = screen.getByText('Submit Form');
            submitButton.click();

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'Coach registration error:',
                    expect.objectContaining({
                        message: 'Registration failed. Please try again.',
                    })
                );
            });

            consoleErrorSpy.mockRestore();
        });
    });

    describe('Cancel Functionality', () => {
        it('navigates to login when cancel is clicked', () => {
            render(<CoachRegisterPage />);

            const cancelButton = screen.getByText('Cancel');
            cancelButton.click();

            expect(mockPush).toHaveBeenCalledWith('/login');
        });
    });
});
