import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionButtons } from '../components/sections/ActionButtons';

describe('ActionButtons', () => {
    const mockOnSave = jest.fn();
    const mockOnCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders Save and Cancel buttons', () => {
        render(
            <ActionButtons
                onSave={mockOnSave}
                onCancel={mockOnCancel}
                isSaving={false}
            />
        );

        expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('calls onSave when Save button is clicked', () => {
        render(
            <ActionButtons
                onSave={mockOnSave}
                onCancel={mockOnCancel}
                isSaving={false}
            />
        );

        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);

        expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when Cancel button is clicked', () => {
        render(
            <ActionButtons
                onSave={mockOnSave}
                onCancel={mockOnCancel}
                isSaving={false}
            />
        );

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('shows loading state when isSaving is true', () => {
        render(
            <ActionButtons
                onSave={mockOnSave}
                onCancel={mockOnCancel}
                isSaving={true}
            />
        );

        expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
    });

    it('displays loading spinner when isSaving is true', () => {
        const { container } = render(
            <ActionButtons
                onSave={mockOnSave}
                onCancel={mockOnCancel}
                isSaving={true}
            />
        );

        // Check for the spinner SVG element
        const spinner = container.querySelector('svg.animate-spin');
        expect(spinner).toBeInTheDocument();
    });

    it('disables Save button when isSaving is true', () => {
        render(
            <ActionButtons
                onSave={mockOnSave}
                onCancel={mockOnCancel}
                isSaving={true}
            />
        );

        const saveButton = screen.getByRole('button', { name: /saving/i });
        expect(saveButton).toBeDisabled();
    });

    it('disables Cancel button when isSaving is true', () => {
        render(
            <ActionButtons
                onSave={mockOnSave}
                onCancel={mockOnCancel}
                isSaving={true}
            />
        );

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        expect(cancelButton).toBeDisabled();
    });

    it('disables Save button when disabled prop is true', () => {
        render(
            <ActionButtons
                onSave={mockOnSave}
                onCancel={mockOnCancel}
                isSaving={false}
                disabled={true}
            />
        );

        const saveButton = screen.getByRole('button', { name: /save/i });
        expect(saveButton).toBeDisabled();
    });

    it('does not call onSave when Save button is disabled', () => {
        render(
            <ActionButtons
                onSave={mockOnSave}
                onCancel={mockOnCancel}
                isSaving={false}
                disabled={true}
            />
        );

        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);

        expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('applies correct styling classes', () => {
        render(
            <ActionButtons
                onSave={mockOnSave}
                onCancel={mockOnCancel}
                isSaving={false}
            />
        );

        const saveButton = screen.getByRole('button', { name: /save/i });
        const cancelButton = screen.getByRole('button', { name: /cancel/i });

        expect(saveButton).toHaveClass('px-6', 'py-3', 'rounded-lg', 'font-semibold', 'disabled:opacity-50', 'transition-colors');
        expect(cancelButton).toHaveClass('px-6', 'py-3', 'rounded-lg', 'font-semibold', 'transition-colors');
    });

    it('applies flex layout with gap to container', () => {
        const { container } = render(
            <ActionButtons
                onSave={mockOnSave}
                onCancel={mockOnCancel}
                isSaving={false}
            />
        );

        const buttonContainer = container.firstChild as HTMLElement;
        expect(buttonContainer).toHaveClass('flex', 'gap-3', 'pt-4');
    });
});
