import { render, screen } from '@testing-library/react';
import { ErrorMessage } from '@/authentication/components/ErrorMessage';

describe('ErrorMessage', () => {
  it('renders error message text', () => {
    render(<ErrorMessage message="Invalid email address" />);
    expect(screen.getByText('Invalid email address')).toBeInTheDocument();
  });

  it('has role="alert" for accessibility', () => {
    render(<ErrorMessage message="Error occurred" />);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
  });

  it('has aria-live="polite" for screen readers', () => {
    render(<ErrorMessage message="Error occurred" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });

  it('applies default styling classes', () => {
    render(<ErrorMessage message="Error occurred" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('text-sm', 'text-red-600');
  });

  it('applies custom className when provided', () => {
    render(<ErrorMessage message="Error occurred" className="mt-2" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('mt-2');
  });

  it('combines default and custom classes', () => {
    render(<ErrorMessage message="Error occurred" className="custom-class" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('text-sm', 'text-red-600', 'custom-class');
  });
});
