import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordInput } from '@/authentication/components/PasswordInput';

describe('PasswordInput', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders password input with label', () => {
    render(<PasswordInput value="" onChange={mockOnChange} />);
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders with provided value', () => {
    render(<PasswordInput value="password123" onChange={mockOnChange} />);
    const input = screen.getByLabelText('Password') as HTMLInputElement;
    expect(input.value).toBe('password123');
  });

  it('calls onChange when user types', async () => {
    const user = userEvent.setup();
    render(<PasswordInput value="" onChange={mockOnChange} />);
    const input = screen.getByLabelText('Password');
    
    await user.type(input, 'pass');
    
    expect(mockOnChange).toHaveBeenCalledTimes(4);
  });

  it('has type="password" by default', () => {
    render(<PasswordInput value="" onChange={mockOnChange} />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders show/hide password toggle button', () => {
    render(<PasswordInput value="" onChange={mockOnChange} />);
    expect(screen.getByLabelText('Show password')).toBeInTheDocument();
  });

  it('toggles password visibility when button is clicked', async () => {
    const user = userEvent.setup();
    render(<PasswordInput value="password123" onChange={mockOnChange} />);
    const input = screen.getByLabelText('Password');
    const toggleButton = screen.getByLabelText('Show password');
    
    expect(input).toHaveAttribute('type', 'password');
    
    await user.click(toggleButton);
    
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Hide password')).toBeInTheDocument();
  });

  it('toggles back to hidden when clicked again', async () => {
    const user = userEvent.setup();
    render(<PasswordInput value="password123" onChange={mockOnChange} />);
    const input = screen.getByLabelText('Password');
    
    await user.click(screen.getByLabelText('Show password'));
    expect(input).toHaveAttribute('type', 'text');
    
    await user.click(screen.getByLabelText('Hide password'));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('displays error message when error prop is provided', () => {
    render(<PasswordInput value="" onChange={mockOnChange} error="Password is required" />);
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('does not display error message when error prop is not provided', () => {
    render(<PasswordInput value="" onChange={mockOnChange} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('sets aria-invalid to true when error exists', () => {
    render(<PasswordInput value="" onChange={mockOnChange} error="Password is required" />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-invalid to false when no error', () => {
    render(<PasswordInput value="" onChange={mockOnChange} />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('links error message with aria-describedby when error exists', () => {
    render(<PasswordInput value="" onChange={mockOnChange} error="Password is required" />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('aria-describedby', 'password-error');
  });

  it('does not have aria-describedby when no error', () => {
    render(<PasswordInput value="" onChange={mockOnChange} />);
    const input = screen.getByLabelText('Password');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('disables input when disabled prop is true', () => {
    render(<PasswordInput value="" onChange={mockOnChange} disabled={true} />);
    const input = screen.getByLabelText('Password');
    expect(input).toBeDisabled();
  });

  it('disables toggle button when disabled prop is true', () => {
    render(<PasswordInput value="" onChange={mockOnChange} disabled={true} />);
    const toggleButton = screen.getByLabelText('Show password');
    expect(toggleButton).toBeDisabled();
  });

  it('enables input by default', () => {
    render(<PasswordInput value="" onChange={mockOnChange} />);
    const input = screen.getByLabelText('Password');
    expect(input).not.toBeDisabled();
  });

  it('applies disabled styling when disabled', () => {
    render(<PasswordInput value="" onChange={mockOnChange} disabled={true} />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveClass('disabled:bg-gray-100', 'disabled:cursor-not-allowed');
  });
});
