import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/authentication/components/LoginForm';

const exampleEmail = 'test@example.com';
const exampleCoachEmail = 'coach@university.edu';

// Helper to get password input reliably
const getPasswordInput = () => document.getElementById('password') as HTMLInputElement;

// Mock fetch globally
global.fetch = jest.fn();

describe('LoginForm', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders all form elements', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(getPasswordInput()).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
  });

  it('updates email input value when user types', () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: exampleEmail } });

    expect(emailInput.value).toBe(exampleEmail);
  });

  it('updates password input value when user types', () => {
    render(<LoginForm />);
    const passwordInput = getPasswordInput() as HTMLInputElement;

    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(passwordInput.value).toBe('password123');
  });

  it('disables submit button when form is empty', () => {
    render(<LoginForm />);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when both fields have values', () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = getPasswordInput();
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: exampleEmail } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(submitButton).not.toBeDisabled();
  });

  it('shows validation error when email is empty on submit', async () => {
    render(<LoginForm />);
    const passwordInput = getPasswordInput();
    const form = screen.getByRole('form');

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when email format is invalid', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = getPasswordInput();
    const form = screen.getByRole('form');

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when password is empty on submit', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const form = screen.getByRole('form');

    fireEvent.change(emailInput, { target: { value: exampleEmail } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when password is too short', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = getPasswordInput();
    const form = screen.getByRole('form');

    fireEvent.change(emailInput, { target: { value: exampleEmail } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during form submission', async () => {
    // Mock API response with delay
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Login successful',
          playerId: 'player-123',
        }),
      }), 100))
    );

    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = getPasswordInput();
    const form = screen.getByRole('form');

    fireEvent.change(emailInput, { target: { value: exampleEmail } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  it('disables form inputs during submission', async () => {
    // Mock API response with delay
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Login successful',
          playerId: 'player-123',
        }),
      }), 100))
    );

    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = getPasswordInput();
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    const form = screen.getByRole('form');

    fireEvent.change(emailInput, { target: { value: exampleEmail } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  it('calls onSuccess callback with user data on successful player login', async () => {
    const onSuccess = jest.fn();
    const mockPlayerId = 'player-123';

    // Mock successful API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Login successful',
        playerId: mockPlayerId,
      }),
    });

    render(<LoginForm onSuccess={onSuccess} />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = getPasswordInput();
    const form = screen.getByRole('form');

    fireEvent.change(emailInput, { target: { value: exampleEmail } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockPlayerId,
          email: exampleEmail,
          role: 'player',
        })
      );
    });

    // Verify correct endpoint was called
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/auth/login/player',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: exampleEmail,
          password: 'password123',
        }),
      })
    );
  });

  it('clears general error when form is resubmitted', async () => {
    // Mock failed API response first
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        message: 'Invalid email or password. Please try again.',
      }),
    });

    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = getPasswordInput();
    const form = screen.getByRole('form');

    // First submission with valid data but wrong credentials
    fireEvent.change(emailInput, { target: { value: exampleEmail } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });

    // Mock successful response for second attempt
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Login successful',
        playerId: 'player-123',
      }),
    });

    // Second submission should clear the error
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.queryByText(/invalid email or password/i)).not.toBeInTheDocument();
    });
  });

  it('shows multiple validation errors simultaneously', async () => {
    render(<LoginForm />);
    const form = screen.getByRole('form');

    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('clears validation errors when user corrects input', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const form = screen.getByRole('form');

    // Submit with empty email to trigger error
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    // Correct the email and resubmit
    fireEvent.change(emailInput, { target: { value: exampleEmail } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
    });
  });

  it('applies responsive styling classes', () => {
    const { container } = render(<LoginForm />);
    const form = container.querySelector('form');

    expect(form).toHaveClass('w-full', 'max-w-md', 'mx-auto', 'p-12');
  });

  it('renders with redirectTo prop without errors', () => {
    render(<LoginForm redirectTo="/dashboard" />);

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('accepts valid email formats', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = getPasswordInput();
    const form = screen.getByRole('form');

    const validEmails = [
      exampleEmail,
      'user.name@example.co.uk',
      'user+tag@example.com',
    ];

    for (const email of validEmails) {
      fireEvent.change(emailInput, { target: { value: email } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument();
      });
    }
  });

  // API Integration Tests
  it('calls player login API for non-.edu email addresses', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Login successful',
        playerId: 'player-123',
      }),
    });

    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = getPasswordInput();
    const form = screen.getByRole('form');

    fireEvent.change(emailInput, { target: { value: exampleEmail } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/login/player',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );
    });
  });

  it('calls coach login API for .edu email addresses', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Login successful',
        coachId: 'coach-123',
      }),
    });

    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = getPasswordInput();
    const form = screen.getByRole('form');

    fireEvent.change(emailInput, { target: { value: exampleCoachEmail } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/login/coach',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );
    });
  });

  it('calls onSuccess with coach role for .edu email', async () => {
    const onSuccess = jest.fn();
    const mockCoachId = 'coach-123';

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Login successful',
        coachId: mockCoachId,
      }),
    });

    render(<LoginForm onSuccess={onSuccess} />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = getPasswordInput();
    const form = screen.getByRole('form');

    fireEvent.change(emailInput, { target: { value: exampleCoachEmail } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockCoachId,
          email: exampleCoachEmail,
          role: 'coach',
        })
      );
    });
  });

  it('displays API error message on authentication failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        message: 'Invalid email or password. Please try again.',
      }),
    });

    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = getPasswordInput();
    const form = screen.getByRole('form');

    fireEvent.change(emailInput, { target: { value: exampleEmail } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('displays validation errors from API response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        errors: [
          { field: 'email', message: 'Invalid email format' },
          { field: 'password', message: 'Password is too weak' },
        ],
      }),
    });

    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = getPasswordInput();
    const form = screen.getByRole('form');

    // Use valid format to pass client-side validation
    fireEvent.change(emailInput, { target: { value: exampleEmail } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      expect(screen.getByText(/password is too weak/i)).toBeInTheDocument();
    });
  });

  it('handles network errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = getPasswordInput();
    const form = screen.getByRole('form');

    fireEvent.change(emailInput, { target: { value: exampleEmail } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/an error occurred during login/i)).toBeInTheDocument();
    });
  });

  it('handles server errors (500) gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        message: 'An error occurred during login',
      }),
    });

    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = getPasswordInput();
    const form = screen.getByRole('form');

    fireEvent.change(emailInput, { target: { value: exampleEmail } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/an error occurred during login/i)).toBeInTheDocument();
    });
  });

  it('includes credentials in API request', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Login successful',
        playerId: 'player-123',
      }),
    });

    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = getPasswordInput();
    const form = screen.getByRole('form');

    fireEvent.change(emailInput, { target: { value: exampleEmail } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });
  });

  it('sends correct request body to API', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Login successful',
        playerId: 'player-123',
      }),
    });

    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = getPasswordInput();
    const form = screen.getByRole('form');

    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';

    fireEvent.change(emailInput, { target: { value: testEmail } });
    fireEvent.change(passwordInput, { target: { value: testPassword } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            email: testEmail,
            password: testPassword,
          }),
        })
      );
    });
  });
});
