import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StatsShowcaseEdit } from '../StatsShowcaseEdit';

describe('StatsShowcaseEdit', () => {
    const mockSetFormData = jest.fn();
    const mockOnSave = jest.fn();
    const mockOnCancel = jest.fn();

    const defaultProps = {
        formData: {
            receivingYards: 1250,
            touchdowns: 12,
            receptions: 68,
        },
        setFormData: mockSetFormData,
        errors: {},
        isSaving: false,
        onSave: mockOnSave,
        onCancel: mockOnCancel,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all stat fields', () => {
        render(<StatsShowcaseEdit {...defaultProps} />);

        expect(screen.getAllByLabelText(/Stat Name/i)).toHaveLength(3);
        expect(screen.getAllByLabelText(/Value/i)).toHaveLength(3);
    });

    it('displays stat names and values correctly', () => {
        render(<StatsShowcaseEdit {...defaultProps} />);

        const nameInputs = screen.getAllByLabelText(/Stat Name/i);
        expect(nameInputs[0]).toHaveValue('receivingYards');
        expect(nameInputs[1]).toHaveValue('touchdowns');
        expect(nameInputs[2]).toHaveValue('receptions');

        const valueInputs = screen.getAllByLabelText(/Value/i);
        expect(valueInputs[0]).toHaveValue('1250');
        expect(valueInputs[1]).toHaveValue('12');
        expect(valueInputs[2]).toHaveValue('68');
    });

    it('renders Add Stat button', () => {
        render(<StatsShowcaseEdit {...defaultProps} />);

        expect(screen.getByRole('button', { name: /Add Stat/i })).toBeInTheDocument();
    });

    it('renders Remove button for each stat', () => {
        render(<StatsShowcaseEdit {...defaultProps} />);

        const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
        expect(removeButtons).toHaveLength(3);
    });

    it('calls setFormData when adding a new stat', () => {
        render(<StatsShowcaseEdit {...defaultProps} />);

        const addButton = screen.getByRole('button', { name: /Add Stat/i });
        fireEvent.click(addButton);

        expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
    });

    it('calls setFormData when removing a stat', () => {
        render(<StatsShowcaseEdit {...defaultProps} />);

        const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
        fireEvent.click(removeButtons[0]);

        expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
    });

    it('renders Save and Cancel buttons', () => {
        render(<StatsShowcaseEdit {...defaultProps} />);

        expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('calls onSave when Save button is clicked', () => {
        render(<StatsShowcaseEdit {...defaultProps} />);

        const saveButton = screen.getByRole('button', { name: /Save/i });
        fireEvent.click(saveButton);

        expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when Cancel button is clicked', () => {
        render(<StatsShowcaseEdit {...defaultProps} />);

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('disables all inputs when isSaving is true', () => {
        render(<StatsShowcaseEdit {...defaultProps} isSaving={true} />);

        const nameInputs = screen.getAllByLabelText(/Stat Name/i);
        const valueInputs = screen.getAllByLabelText(/Value/i);
        const addButton = screen.getByRole('button', { name: /Add Stat/i });
        const removeButtons = screen.getAllByRole('button', { name: /Remove/i });

        nameInputs.forEach((input) => expect(input).toBeDisabled());
        valueInputs.forEach((input) => expect(input).toBeDisabled());
        expect(addButton).toBeDisabled();
        removeButtons.forEach((button) => expect(button).toBeDisabled());
    });

    it('displays Save button with "Saving..." text when isSaving is true', () => {
        render(<StatsShowcaseEdit {...defaultProps} isSaving={true} />);

        expect(screen.getByRole('button', { name: /Saving.../i })).toBeInTheDocument();
    });

    it('displays validation errors', () => {
        const propsWithErrors = {
            ...defaultProps,
            errors: {
                'receivingYards-name': 'Stat name is required',
                'touchdowns-value': 'Value must be a number',
                stats: 'At least one stat is required',
            },
        };

        render(<StatsShowcaseEdit {...propsWithErrors} />);

        expect(screen.getByText('Stat name is required')).toBeInTheDocument();
        expect(screen.getByText('Value must be a number')).toBeInTheDocument();
        expect(screen.getByText('At least one stat is required')).toBeInTheDocument();
    });

    it('applies correct styling classes', () => {
        const { container } = render(<StatsShowcaseEdit {...defaultProps} />);

        // Check for edit mode container styling with responsive padding
        const editContainer = container.querySelector('.space-y-4.p-4.sm\\:p-6.bg-white\\/5');
        expect(editContainer).toBeInTheDocument();
    });

    it('uses responsive layout for stat fields', () => {
        const { container } = render(<StatsShowcaseEdit {...defaultProps} />);

        // Stats now use flex-col layout for mobile responsiveness
        const flexContainers = container.querySelectorAll('.flex-col');
        expect(flexContainers.length).toBeGreaterThan(0);
    });

    it('handles empty stats object', () => {
        const propsWithEmptyStats = {
            ...defaultProps,
            formData: {},
        };

        render(<StatsShowcaseEdit {...propsWithEmptyStats} />);

        expect(screen.queryByLabelText(/Stat Name/i)).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add Stat/i })).toBeInTheDocument();
    });

    it('handles stat value change', () => {
        render(<StatsShowcaseEdit {...defaultProps} />);

        const valueInputs = screen.getAllByLabelText(/Value/i);
        fireEvent.change(valueInputs[0], { target: { value: '1500' } });

        expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
    });

    it('handles stat name change', () => {
        render(<StatsShowcaseEdit {...defaultProps} />);

        const nameInputs = screen.getAllByLabelText(/Stat Name/i);
        fireEvent.change(nameInputs[0], { target: { value: 'totalYards' } });

        expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
    });
});
