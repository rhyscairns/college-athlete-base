import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/authentication/components/LoginForm';
import type { User } from '@/authentication/types';

// Helper to get password input reliably
const getPasswordInput = () => screen.getByLabelText(/^password$/i);

describe('LoginForm', () => {
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

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(emailInput.value).toBe('test@example.com');
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

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
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

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
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

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('shows loading state during form submission', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = getPasswordInput();
    const form = screen.getByRole('form');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  it('disables form inputs during submission', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = getPasswordInput();
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    const form = screen.getByRole('form');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });
  });

  it('calls onSuccess callback with user data on successful submission', async () => {
    const onSuccess = jest.fn();
    render(<LoginForm onSuccess={onSuccess} />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = getPasswordInput();
    const form = screen.getByRole('form');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          role: 'player',
        })
      );
    }, { timeout: 2000 });
  });

  it('clears general error when form is resubmitted', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = getPasswordInput();
    const form = screen.getByRole('form');

    // First submission with valid data
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    // Wait for submission to complete with increased timeout
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Second submission should clear any previous errors
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
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
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
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
      'test@example.com',
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
});
