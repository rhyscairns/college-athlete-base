import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmailInput } from '@/authentication/components/EmailInput';

describe('EmailInput', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders email input with label', () => {
    render(<EmailInput value="" onChange={mockOnChange} />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders with provided value', () => {
    render(<EmailInput value="test@example.com" onChange={mockOnChange} />);
    const input = screen.getByLabelText('Email') as HTMLInputElement;
    expect(input.value).toBe('test@example.com');
  });

  it('calls onChange when user types', async () => {
    const user = userEvent.setup();
    render(<EmailInput value="" onChange={mockOnChange} />);
    const input = screen.getByLabelText('Email');

    await user.type(input, 'test');

    expect(mockOnChange).toHaveBeenCalledTimes(4);
    expect(mockOnChange).toHaveBeenNthCalledWith(1, 't');
    expect(mockOnChange).toHaveBeenNthCalledWith(2, 'e');
    expect(mockOnChange).toHaveBeenNthCalledWith(3, 's');
    expect(mockOnChange).toHaveBeenNthCalledWith(4, 't');
  });

  it('has type="email" attribute', () => {
    render(<EmailInput value="" onChange={mockOnChange} />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('displays error message when error prop is provided', () => {
    render(<EmailInput value="" onChange={mockOnChange} error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('does not display error message when error prop is not provided', () => {
    render(<EmailInput value="" onChange={mockOnChange} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('sets aria-invalid to true when error exists', () => {
    render(<EmailInput value="" onChange={mockOnChange} error="Invalid email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-invalid to false when no error', () => {
    render(<EmailInput value="" onChange={mockOnChange} />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });

  it('links error message with aria-describedby when error exists', () => {
    render(<EmailInput value="" onChange={mockOnChange} error="Invalid email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-describedby', 'email-error');
  });

  it('does not have aria-describedby when no error', () => {
    render(<EmailInput value="" onChange={mockOnChange} />);
    const input = screen.getByLabelText('Email');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('disables input when disabled prop is true', () => {
    render(<EmailInput value="" onChange={mockOnChange} disabled={true} />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeDisabled();
  });

  it('enables input by default', () => {
    render(<EmailInput value="" onChange={mockOnChange} />);
    const input = screen.getByLabelText('Email');
    expect(input).not.toBeDisabled();
  });

  it('applies disabled styling when disabled', () => {
    render(<EmailInput value="" onChange={mockOnChange} disabled={true} />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });
});
