import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CoachesPerspectiveSectionEdit } from '../CoachesPerspectiveSectionEdit';

describe('CoachesPerspectiveSectionEdit', () => {
    const mockTestimonials = [
        {
            id: 'testimonial-1',
            quote: 'Marcus is an exceptional player with great leadership skills.',
            coachName: 'Coach David Miller',
            coachTitle: 'Head Football Coach',
            coachOrganization: 'Westlake High School',
        },
        {
            id: 'testimonial-2',
            quote: 'A rare combination of speed, size, and football IQ.',
            coachName: 'James Wilson',
            coachTitle: 'Offensive Coordinator',
            coachOrganization: 'Westlake High School',
        },
    ];

    const mockSetFormData = jest.fn();
    const mockOnSave = jest.fn();
    const mockOnCancel = jest.fn();

    const defaultProps = {
        formData: mockTestimonials,
        setFormData: mockSetFormData,
        errors: {},
        isSaving: false,
        onSave: mockOnSave,
        onCancel: mockOnCancel,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all testimonials', () => {
        render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

        expect(screen.getByText('Testimonial 1')).toBeInTheDocument();
        expect(screen.getByText('Testimonial 2')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Marcus is an exceptional player with great leadership skills.')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Coach David Miller')).toBeInTheDocument();
    });

    it('renders textarea for testimonial text', () => {
        render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

        const textareas = screen.getAllByRole('textbox', { name: /testimonial/i });
        expect(textareas.length).toBeGreaterThan(0);
        expect(textareas[0].tagName).toBe('TEXTAREA');
    });

    it('renders all required fields for each testimonial', () => {
        render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

        // Check for Coach Name fields
        expect(screen.getAllByLabelText(/coach name/i)).toHaveLength(2);

        // Check for Coach Title fields
        expect(screen.getAllByLabelText(/coach title/i)).toHaveLength(2);

        // Check for Organization fields
        expect(screen.getAllByLabelText(/organization/i)).toHaveLength(2);
    });

    it('calls setFormData when testimonial quote is changed', () => {
        render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

        const textarea = screen.getAllByRole('textbox', { name: /testimonial/i })[0];
        fireEvent.change(textarea, { target: { value: 'Updated testimonial text' } });

        expect(mockSetFormData).toHaveBeenCalled();
    });

    it('calls setFormData when coach name is changed', () => {
        render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

        const coachNameInput = screen.getAllByLabelText(/coach name/i)[0];
        fireEvent.change(coachNameInput, { target: { value: 'New Coach Name' } });

        expect(mockSetFormData).toHaveBeenCalled();
    });

    it('calls setFormData when coach title is changed', () => {
        render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

        const coachTitleInput = screen.getAllByLabelText(/coach title/i)[0];
        fireEvent.change(coachTitleInput, { target: { value: 'New Title' } });

        expect(mockSetFormData).toHaveBeenCalled();
    });

    it('calls setFormData when organization is changed', () => {
        render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

        const organizationInput = screen.getAllByLabelText(/organization/i)[0];
        fireEvent.change(organizationInput, { target: { value: 'New Organization' } });

        expect(mockSetFormData).toHaveBeenCalled();
    });

    it('renders add testimonial button', () => {
        render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

        expect(screen.getByText('+ Add Testimonial')).toBeInTheDocument();
    });

    it('calls setFormData when add testimonial button is clicked', () => {
        render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

        const addButton = screen.getByText('+ Add Testimonial');
        fireEvent.click(addButton);

        expect(mockSetFormData).toHaveBeenCalled();
    });

    it('renders remove button for each testimonial', () => {
        render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

        const removeButtons = screen.getAllByText('Remove');
        expect(removeButtons).toHaveLength(2);
    });

    it('calls setFormData when remove button is clicked', () => {
        render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

        const removeButtons = screen.getAllByText('Remove');
        fireEvent.click(removeButtons[0]);

        expect(mockSetFormData).toHaveBeenCalled();
    });

    it('displays validation errors for testimonial fields', () => {
        const propsWithErrors = {
            ...defaultProps,
            errors: {
                'testimonial-0-quote': 'Testimonial is required',
                'testimonial-0-coachName': 'Coach name is required',
            },
        };

        render(<CoachesPerspectiveSectionEdit {...propsWithErrors} />);

        expect(screen.getByText('Testimonial is required')).toBeInTheDocument();
        expect(screen.getByText('Coach name is required')).toBeInTheDocument();
    });

    it('displays general testimonials error', () => {
        const propsWithErrors = {
            ...defaultProps,
            errors: {
                testimonials: 'At least one testimonial is required',
            },
        };

        render(<CoachesPerspectiveSectionEdit {...propsWithErrors} />);

        expect(screen.getByText('At least one testimonial is required')).toBeInTheDocument();
    });

    it('disables all inputs when isSaving is true', () => {
        const propsWithSaving = {
            ...defaultProps,
            isSaving: true,
        };

        render(<CoachesPerspectiveSectionEdit {...propsWithSaving} />);

        const textareas = screen.getAllByRole('textbox', { name: /testimonial/i });
        textareas.forEach((textarea) => {
            expect(textarea).toBeDisabled();
        });

        const coachNameInputs = screen.getAllByLabelText(/coach name/i);
        coachNameInputs.forEach((input) => {
            expect(input).toBeDisabled();
        });
    });

    it('disables add and remove buttons when isSaving is true', () => {
        const propsWithSaving = {
            ...defaultProps,
            isSaving: true,
        };

        render(<CoachesPerspectiveSectionEdit {...propsWithSaving} />);

        const addButton = screen.getByText('+ Add Testimonial');
        expect(addButton).toBeDisabled();

        const removeButtons = screen.getAllByText('Remove');
        removeButtons.forEach((button) => {
            expect(button).toBeDisabled();
        });
    });

    it('renders ActionButtons component', () => {
        render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

        expect(screen.getByText('Save')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('calls onSave when save button is clicked', () => {
        render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        expect(mockOnSave).toHaveBeenCalled();
    });

    it('calls onCancel when cancel button is clicked', () => {
        render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalled();
    });

    it('displays empty state message when no testimonials', () => {
        const propsWithNoTestimonials = {
            ...defaultProps,
            formData: [],
        };

        render(<CoachesPerspectiveSectionEdit {...propsWithNoTestimonials} />);

        expect(screen.getByText(/no testimonials added yet/i)).toBeInTheDocument();
    });

    it('applies edit mode container styling', () => {
        const { container } = render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

        const editContainer = container.querySelector('.space-y-4.p-4.sm\\:p-6.bg-white\\/5.rounded-2xl.border.border-white\\/10');
        expect(editContainer).toBeInTheDocument();
    });

    it('renders required indicators for required fields', () => {
        render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

        // Check for required asterisks
        const requiredIndicators = screen.getAllByText('*');
        expect(requiredIndicators.length).toBeGreaterThan(0);
    });

    it('uses textarea with proper styling for testimonial text', () => {
        render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

        const textareas = screen.getAllByRole('textbox', { name: /testimonial/i });
        const firstTextarea = textareas[0];

        expect(firstTextarea).toHaveClass('w-full');
        expect(firstTextarea).toHaveClass('bg-white/5');
        expect(firstTextarea).toHaveClass('rounded-lg');
    });
});
