import { render, screen, fireEvent } from '@testing-library/react';
import { HeroSectionEdit } from '../HeroSectionEdit';
import type { HeroData, ValidationErrors } from '../../../types';

describe('HeroSectionEdit', () => {
    const mockFormData: HeroData = {
        firstName: 'Marcus',
        lastName: 'Johnson',
        position: 'Wide Receiver',
        school: 'Westlake High School',
        location: 'Austin, TX',
        classYear: '2025',
        height: '6\'2"',
        weight: '185 lbs',
    };

    const mockSetFormData = jest.fn();
    const mockOnSave = jest.fn();
    const mockOnCancel = jest.fn();
    const mockErrors: ValidationErrors = {};

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all form fields with correct values', () => {
        render(
            <HeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        expect(screen.getByLabelText(/first name/i)).toHaveValue('Marcus');
        expect(screen.getByLabelText(/last name/i)).toHaveValue('Johnson');
        expect(screen.getByLabelText(/position/i)).toHaveValue('Wide Receiver');
        expect(screen.getByLabelText(/school/i)).toHaveValue('Westlake High School');
        expect(screen.getByLabelText(/location/i)).toHaveValue('Austin, TX');
        expect(screen.getByLabelText(/class year/i)).toHaveValue('2025');
        expect(screen.getByLabelText(/height/i)).toHaveValue('6\'2"');
        expect(screen.getByLabelText(/weight/i)).toHaveValue('185 lbs');
    });

    it('calls setFormData when input values change', () => {
        render(
            <HeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const firstNameInput = screen.getByLabelText(/first name/i);
        fireEvent.change(firstNameInput, { target: { value: 'John' } });

        expect(mockSetFormData).toHaveBeenCalled();
    });

    it('displays validation errors when present', () => {
        const errorsWithMessages: ValidationErrors = {
            firstName: 'First name is required',
            position: 'Position is required',
        };

        render(
            <HeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={errorsWithMessages}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        expect(screen.getByText('First name is required')).toBeInTheDocument();
        expect(screen.getByText('Position is required')).toBeInTheDocument();
    });

    it('calls onSave when Save button is clicked', () => {
        render(
            <HeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.click(saveButton);

        expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when Cancel button is clicked', () => {
        render(
            <HeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('disables all inputs when isSaving is true', () => {
        render(
            <HeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={true}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        expect(screen.getByLabelText(/first name/i)).toBeDisabled();
        expect(screen.getByLabelText(/last name/i)).toBeDisabled();
        expect(screen.getByLabelText(/position/i)).toBeDisabled();
        expect(screen.getByLabelText(/school/i)).toBeDisabled();
        expect(screen.getByLabelText(/location/i)).toBeDisabled();
        expect(screen.getByLabelText(/class year/i)).toBeDisabled();
        expect(screen.getByLabelText(/height/i)).toBeDisabled();
        expect(screen.getByLabelText(/weight/i)).toBeDisabled();
    });

    it('shows "Saving..." text on Save button when isSaving is true', () => {
        render(
            <HeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={true}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
    });

    it('applies correct styling classes', () => {
        const { container } = render(
            <HeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const mainContainer = container.firstChild;
        expect(mainContainer).toHaveClass('space-y-4', 'p-4', 'sm:p-6', 'bg-white/5', 'rounded-2xl', 'border', 'border-white/10');
    });

    it('applies fade-in animation class', () => {
        const { container } = render(
            <HeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const mainContainer = container.firstChild;
        expect(mainContainer).toHaveClass('animate-fade-in');
    });

    it('uses grid layout for paired fields', () => {
        const { container } = render(
            <HeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const gridContainers = container.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2.gap-4');
        expect(gridContainers.length).toBe(3); // Name fields, School/Location, Height/Weight
    });
});
