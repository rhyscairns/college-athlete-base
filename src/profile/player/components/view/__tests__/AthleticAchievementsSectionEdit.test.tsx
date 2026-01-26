import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AthleticAchievementsSectionEdit } from '../AthleticAchievementsSectionEdit';
import type { ValidationErrors } from '../../../types';

describe('AthleticAchievementsSectionEdit', () => {
    const mockAchievements = [
        {
            id: 'achievement-1',
            icon: 'trophy',
            title: 'All-State Selection',
            description: '1st Team WR (2023)',
            color: 'gold',
        },
        {
            id: 'achievement-2',
            icon: 'medal',
            title: 'District MVP',
            description: 'Unanimous Choice',
            color: 'blue',
        },
    ];

    const defaultProps = {
        formData: mockAchievements,
        setFormData: jest.fn(),
        errors: {} as ValidationErrors,
        isSaving: false,
        onSave: jest.fn(),
        onCancel: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all achievements', () => {
        render(<AthleticAchievementsSectionEdit {...defaultProps} />);

        expect(screen.getByDisplayValue('All-State Selection')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1st Team WR (2023)')).toBeInTheDocument();
        expect(screen.getByDisplayValue('District MVP')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Unanimous Choice')).toBeInTheDocument();
    });

    it('renders achievement headers with correct numbering', () => {
        render(<AthleticAchievementsSectionEdit {...defaultProps} />);

        expect(screen.getByText('Achievement 1')).toBeInTheDocument();
        expect(screen.getByText('Achievement 2')).toBeInTheDocument();
    });

    it('renders title and description inputs for each achievement', () => {
        render(<AthleticAchievementsSectionEdit {...defaultProps} />);

        const titleInputs = screen.getAllByLabelText(/Title/i);
        const descriptionInputs = screen.getAllByLabelText(/Description/i);

        expect(titleInputs).toHaveLength(2);
        expect(descriptionInputs).toHaveLength(2);
    });

    it('renders icon and color selects for each achievement', () => {
        render(<AthleticAchievementsSectionEdit {...defaultProps} />);

        const iconSelects = screen.getAllByLabelText(/Icon/i);
        const colorSelects = screen.getAllByLabelText(/Color/i);

        expect(iconSelects).toHaveLength(2);
        expect(colorSelects).toHaveLength(2);
    });

    it('calls setFormData when title is changed', () => {
        const setFormData = jest.fn();
        render(<AthleticAchievementsSectionEdit {...defaultProps} setFormData={setFormData} />);

        const titleInput = screen.getByDisplayValue('All-State Selection');
        fireEvent.change(titleInput, { target: { value: 'New Title' } });

        expect(setFormData).toHaveBeenCalled();
    });

    it('calls setFormData when description is changed', () => {
        const setFormData = jest.fn();
        render(<AthleticAchievementsSectionEdit {...defaultProps} setFormData={setFormData} />);

        const descriptionInput = screen.getByDisplayValue('1st Team WR (2023)');
        fireEvent.change(descriptionInput, { target: { value: 'New Description' } });

        expect(setFormData).toHaveBeenCalled();
    });

    it('calls setFormData when icon is changed', () => {
        const setFormData = jest.fn();
        render(<AthleticAchievementsSectionEdit {...defaultProps} setFormData={setFormData} />);

        const iconSelects = screen.getAllByLabelText(/Icon/i);
        fireEvent.change(iconSelects[0], { target: { value: 'medal' } });

        expect(setFormData).toHaveBeenCalled();
    });

    it('calls setFormData when color is changed', () => {
        const setFormData = jest.fn();
        render(<AthleticAchievementsSectionEdit {...defaultProps} setFormData={setFormData} />);

        const colorSelects = screen.getAllByLabelText(/Color/i);
        fireEvent.change(colorSelects[0], { target: { value: 'blue' } });

        expect(setFormData).toHaveBeenCalled();
    });

    it('renders remove button for each achievement', () => {
        render(<AthleticAchievementsSectionEdit {...defaultProps} />);

        const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
        expect(removeButtons).toHaveLength(2);
    });

    it('calls setFormData when remove button is clicked', () => {
        const setFormData = jest.fn();
        render(<AthleticAchievementsSectionEdit {...defaultProps} setFormData={setFormData} />);

        const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
        fireEvent.click(removeButtons[0]);

        expect(setFormData).toHaveBeenCalled();
    });

    it('renders add achievement button', () => {
        render(<AthleticAchievementsSectionEdit {...defaultProps} />);

        expect(screen.getByRole('button', { name: /Add Achievement/i })).toBeInTheDocument();
    });

    it('calls setFormData when add achievement button is clicked', () => {
        const setFormData = jest.fn();
        render(<AthleticAchievementsSectionEdit {...defaultProps} setFormData={setFormData} />);

        const addButton = screen.getByRole('button', { name: /Add Achievement/i });
        fireEvent.click(addButton);

        expect(setFormData).toHaveBeenCalled();
    });

    it('renders empty state when no achievements', () => {
        render(<AthleticAchievementsSectionEdit {...defaultProps} formData={[]} />);

        expect(screen.getByText(/No achievements added yet/i)).toBeInTheDocument();
    });

    it('renders action buttons', () => {
        render(<AthleticAchievementsSectionEdit {...defaultProps} />);

        expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('calls onSave when save button is clicked', () => {
        const onSave = jest.fn();
        render(<AthleticAchievementsSectionEdit {...defaultProps} onSave={onSave} />);

        const saveButton = screen.getByRole('button', { name: /Save/i });
        fireEvent.click(saveButton);

        expect(onSave).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button is clicked', () => {
        const onCancel = jest.fn();
        render(<AthleticAchievementsSectionEdit {...defaultProps} onCancel={onCancel} />);

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButton);

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('disables all inputs when isSaving is true', () => {
        render(<AthleticAchievementsSectionEdit {...defaultProps} isSaving={true} />);

        const titleInputs = screen.getAllByLabelText(/Title/i);
        const descriptionInputs = screen.getAllByLabelText(/Description/i);
        const iconSelects = screen.getAllByLabelText(/Icon/i);
        const colorSelects = screen.getAllByLabelText(/Color/i);

        titleInputs.forEach((input) => expect(input).toBeDisabled());
        descriptionInputs.forEach((input) => expect(input).toBeDisabled());
        iconSelects.forEach((select) => expect(select).toBeDisabled());
        colorSelects.forEach((select) => expect(select).toBeDisabled());
    });

    it('disables all buttons when isSaving is true', () => {
        render(<AthleticAchievementsSectionEdit {...defaultProps} isSaving={true} />);

        const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
        const addButton = screen.getByRole('button', { name: /Add Achievement/i });

        removeButtons.forEach((button) => expect(button).toBeDisabled());
        expect(addButton).toBeDisabled();
    });

    it('displays validation errors', () => {
        const errors = {
            'achievement-0-title': 'Title is required',
            'achievement-1-description': 'Description is required',
        };

        render(<AthleticAchievementsSectionEdit {...defaultProps} errors={errors} />);

        expect(screen.getByText('Title is required')).toBeInTheDocument();
        expect(screen.getByText('Description is required')).toBeInTheDocument();
    });

    it('displays general achievements error', () => {
        const errors = {
            achievements: 'At least one achievement is required',
        };

        render(<AthleticAchievementsSectionEdit {...defaultProps} errors={errors} />);

        expect(screen.getByText('At least one achievement is required')).toBeInTheDocument();
    });

    it('renders all icon options', () => {
        render(<AthleticAchievementsSectionEdit {...defaultProps} />);

        const iconSelects = screen.getAllByLabelText(/Icon/i);
        const firstIconSelect = iconSelects[0];

        expect(firstIconSelect).toContainHTML('Trophy');
        expect(firstIconSelect).toContainHTML('Medal');
        expect(firstIconSelect).toContainHTML('Star');
        expect(firstIconSelect).toContainHTML('Lightning');
        expect(firstIconSelect).toContainHTML('Target');
        expect(firstIconSelect).toContainHTML('Award');
    });

    it('renders all color options', () => {
        render(<AthleticAchievementsSectionEdit {...defaultProps} />);

        const colorSelects = screen.getAllByLabelText(/Color/i);
        const firstColorSelect = colorSelects[0];

        expect(firstColorSelect).toContainHTML('Gold');
        expect(firstColorSelect).toContainHTML('Blue');
        expect(firstColorSelect).toContainHTML('Yellow');
        expect(firstColorSelect).toContainHTML('Orange');
        expect(firstColorSelect).toContainHTML('Green');
        expect(firstColorSelect).toContainHTML('Purple');
    });

    it('applies correct styling classes', () => {
        const { container } = render(<AthleticAchievementsSectionEdit {...defaultProps} />);

        // Check for edit mode container styling
        expect(container.querySelector('.space-y-4.p-4.sm\\:p-6.bg-white\\/5.rounded-2xl.border.border-white\\/10')).toBeInTheDocument();
    });

    it('renders required indicators on title and description fields', () => {
        render(<AthleticAchievementsSectionEdit {...defaultProps} />);

        const titleInputs = screen.getAllByLabelText(/Title/i);
        const descriptionInputs = screen.getAllByLabelText(/Description/i);

        // Check that inputs have required attribute
        titleInputs.forEach((input) => expect(input).toBeRequired());
        descriptionInputs.forEach((input) => expect(input).toBeRequired());
    });
});
