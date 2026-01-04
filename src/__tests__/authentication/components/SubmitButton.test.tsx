import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubmitButton } from '@/authentication/components/SubmitButton';

describe('SubmitButton', () => {
  it('renders button with children text', () => {
    render(<SubmitButton loading={false} disabled={false}>Sign In</SubmitButton>);
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('has type="submit" attribute', () => {
    render(<SubmitButton loading={false} disabled={false}>Submit</SubmitButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('is enabled when loading and disabled are false', () => {
    render(<SubmitButton loading={false} disabled={false}>Submit</SubmitButton>);
    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<SubmitButton loading={false} disabled={true}>Submit</SubmitButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('is disabled when loading prop is true', () => {
    render(<SubmitButton loading={true} disabled={false}>Submit</SubmitButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('is disabled when both loading and disabled are true', () => {
    render(<SubmitButton loading={true} disabled={true}>Submit</SubmitButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('displays loading spinner when loading is true', () => {
    render(<SubmitButton loading={true} disabled={false}>Submit</SubmitButton>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays children when loading is false', () => {
    render(<SubmitButton loading={false} disabled={false}>Sign In</SubmitButton>);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('applies disabled styling classes', () => {
    render(<SubmitButton loading={false} disabled={true}>Submit</SubmitButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('disabled:bg-gray-400', 'disabled:cursor-not-allowed');
  });

  it('applies base styling classes', () => {
    render(<SubmitButton loading={false} disabled={false}>Submit</SubmitButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-full', 'bg-gray-900', 'text-white', 'rounded-xl');
  });

  it('can be clicked when enabled', async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn((e) => e.preventDefault());

    render(
      <form onSubmit={handleSubmit}>
        <SubmitButton loading={false} disabled={false}>Submit</SubmitButton>
      </form>
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('cannot be clicked when disabled', async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn((e) => e.preventDefault());

    render(
      <form onSubmit={handleSubmit}>
        <SubmitButton loading={false} disabled={true}>Submit</SubmitButton>
      </form>
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('cannot be clicked when loading', async () => {
    const user = userEvent.setup();
    const handleSubmit = jest.fn((e) => e.preventDefault());

    render(
      <form onSubmit={handleSubmit}>
        <SubmitButton loading={true} disabled={false}>Submit</SubmitButton>
      </form>
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('renders spinner with animation class when loading', () => {
    const { container } = render(<SubmitButton loading={true} disabled={false}>Submit</SubmitButton>);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});
