import { render, screen } from '@testing-library/react';
import { LoginLink } from '@/authentication/components/LoginLink';

describe('LoginLink', () => {
  it('renders the prompt text', () => {
    render(<LoginLink />);
    expect(screen.getByText("Don't have an account?", { exact: false })).toBeInTheDocument();
  });

  it('renders the sign up link', () => {
    render(<LoginLink />);
    const link = screen.getByRole('link', { name: 'Sign up' });
    expect(link).toBeInTheDocument();
  });

  it('links to the registration page', () => {
    render(<LoginLink />);
    const link = screen.getByRole('link', { name: 'Sign up' });
    expect(link).toHaveAttribute('href', '/register');
  });

  it('applies default styling classes to the container', () => {
    const { container } = render(<LoginLink />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('text-center', 'text-sm');
  });

  it('applies custom className when provided', () => {
    const { container } = render(<LoginLink className="mt-4" />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('mt-4');
  });

  it('combines default and custom classes', () => {
    const { container } = render(<LoginLink className="custom-class" />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('text-center', 'text-sm', 'custom-class');
  });

  it('applies proper styling to the link', () => {
    render(<LoginLink />);
    const link = screen.getByRole('link', { name: 'Sign up' });
    expect(link).toHaveClass('text-gray-800', 'hover:text-gray-900', 'font-semibold');
  });

  it('has focus styles for accessibility', () => {
    render(<LoginLink />);
    const link = screen.getByRole('link', { name: 'Sign up' });
    expect(link).toHaveClass('focus:outline-none', 'focus:underline');
  });
});
