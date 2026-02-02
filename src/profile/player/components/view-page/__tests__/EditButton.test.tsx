import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditButton } from '../EditButton';

describe('EditButton', () => {
    it('renders with correct text', () => {
        const mockOnClick = jest.fn();
        render(<EditButton onClick={mockOnClick} />);

        const button = screen.getByRole('button', { name: /edit section/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('Edit');
    });

    it('calls onClick handler when clicked', async () => {
        const mockOnClick = jest.fn();
        const user = userEvent.setup();
        render(<EditButton onClick={mockOnClick} />);

        const button = screen.getByRole('button', { name: /edit section/i });
        await user.click(button);

        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
        const mockOnClick = jest.fn();
        const user = userEvent.setup();
        render(<EditButton onClick={mockOnClick} disabled={true} />);

        const button = screen.getByRole('button', { name: /edit section/i });
        await user.click(button);

        expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('applies disabled styling when disabled', () => {
        const mockOnClick = jest.fn();
        render(<EditButton onClick={mockOnClick} disabled={true} />);

        const button = screen.getByRole('button', { name: /edit section/i });
        expect(button).toBeDisabled();
        expect(button).toHaveClass('disabled:opacity-50');
        expect(button).toHaveClass('disabled:cursor-not-allowed');
    });

    it('shows tooltip when disabled and hovered', async () => {
        const mockOnClick = jest.fn();
        const tooltipText = 'Another section is being edited';
        const user = userEvent.setup();
        render(<EditButton onClick={mockOnClick} disabled={true} tooltip={tooltipText} />);

        const button = screen.getByRole('button', { name: /edit section/i });

        // Tooltip should not be visible initially
        expect(screen.queryByText(tooltipText)).not.toBeInTheDocument();

        // Hover over the button
        await user.hover(button);

        // Tooltip should now be visible
        await waitFor(() => {
            expect(screen.getByText(tooltipText)).toBeInTheDocument();
        });
    });

    it('hides tooltip when mouse leaves', async () => {
        const mockOnClick = jest.fn();
        const tooltipText = 'Another section is being edited';
        const user = userEvent.setup();
        render(<EditButton onClick={mockOnClick} disabled={true} tooltip={tooltipText} />);

        const button = screen.getByRole('button', { name: /edit section/i });

        // Hover over the button
        await user.hover(button);

        await waitFor(() => {
            expect(screen.getByText(tooltipText)).toBeInTheDocument();
        });

        // Mouse leaves
        await user.unhover(button);

        await waitFor(() => {
            expect(screen.queryByText(tooltipText)).not.toBeInTheDocument();
        });
    });

    it('does not show tooltip when not disabled', async () => {
        const mockOnClick = jest.fn();
        const tooltipText = 'Another section is being edited';
        const user = userEvent.setup();
        render(<EditButton onClick={mockOnClick} disabled={false} tooltip={tooltipText} />);

        const button = screen.getByRole('button', { name: /edit section/i });

        // Hover over the button
        await user.hover(button);

        // Tooltip should not be visible for enabled button
        expect(screen.queryByText(tooltipText)).not.toBeInTheDocument();
    });

    it('applies correct base styling', () => {
        const mockOnClick = jest.fn();
        render(<EditButton onClick={mockOnClick} />);

        const button = screen.getByRole('button', { name: /edit section/i });
        expect(button).toHaveClass('px-4');
        expect(button).toHaveClass('py-2');
        expect(button).toHaveClass('bg-white/10');
        expect(button).toHaveClass('border');
        expect(button).toHaveClass('border-white/20');
        expect(button).toHaveClass('rounded-lg');
        expect(button).toHaveClass('text-white');
        expect(button).toHaveClass('text-sm');
        expect(button).toHaveClass('font-semibold');
        expect(button).toHaveClass('transition-all');
    });

    it('applies hover styling class', () => {
        const mockOnClick = jest.fn();
        render(<EditButton onClick={mockOnClick} />);

        const button = screen.getByRole('button', { name: /edit section/i });
        expect(button).toHaveClass('hover:bg-white/15');
    });
});
