import { render, screen, fireEvent } from '@testing-library/react';
import { SubmitButton } from '../SubmitButton';

describe('SubmitButton', () => {
    it('renders with children text', () => {
        render(<SubmitButton>Save Profile</SubmitButton>);
        expect(screen.getByText('Save Profile')).toBeInTheDocument();
    });

    it('shows loading text when loading prop is true', () => {
        render(<SubmitButton loading={true}>Save Profile</SubmitButton>);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
        expect(screen.queryByText('Save Profile')).not.toBeInTheDocument();
    });

    it('is disabled when disabled prop is true', () => {
        render(<SubmitButton disabled={true}>Save Profile</SubmitButton>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('is disabled when loading prop is true', () => {
        render(<SubmitButton loading={true}>Save Profile</SubmitButton>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('calls onClick handler when clicked', () => {
        const handleClick = jest.fn();
        render(<SubmitButton onClick={handleClick}>Save Profile</SubmitButton>);
        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
        const handleClick = jest.fn();
        render(<SubmitButton onClick={handleClick} disabled={true}>Save Profile</SubmitButton>);
        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('applies correct CSS classes', () => {
        render(<SubmitButton>Save Profile</SubmitButton>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('w-full', 'h-12', 'bg-blue-600', 'text-white', 'rounded-lg');
    });

    it('renders as button type by default', () => {
        render(<SubmitButton>Save Profile</SubmitButton>);
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('type', 'button');
    });

    it('renders as submit type when specified', () => {
        render(<SubmitButton type="submit">Save Profile</SubmitButton>);
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('type', 'submit');
    });
});
