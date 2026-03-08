import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CoachesPerspectiveSectionEdit } from '../components/sections/CoachesPerspectiveSectionEdit';
import type { Testimonial } from '../../../types';

describe('CoachesPerspectiveSectionEdit - Light Theme Visual Tests', () => {
    const mockTestimonials: Testimonial[] = [
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

    const defaultProps = {
        formData: mockTestimonials,
        setFormData: jest.fn(),
        errors: {},
        isSaving: false,
        onSave: jest.fn(),
        onCancel: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Requirement 1.1, 1.2: Container with white card design', () => {
        it('renders with white background and shadow', () => {
            const { container } = render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const mainContainer = container.querySelector('.bg-white.rounded-2xl.shadow-lg');
            expect(mainContainer).toBeInTheDocument();
        });

        it('has proper padding on container', () => {
            const { container } = render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const mainContainer = container.querySelector('.p-6.sm\\:p-8');
            expect(mainContainer).toBeInTheDocument();
        });
    });

    describe('Requirement 5.1, 5.2: Testimonial card backgrounds and borders', () => {
        it('renders testimonial cards with gray-50 background', () => {
            const { container } = render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const testimonialCards = container.querySelectorAll('.bg-gray-50');
            expect(testimonialCards.length).toBeGreaterThan(0);
        });

        it('renders testimonial cards with gray-200 borders', () => {
            const { container } = render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const testimonialCards = container.querySelectorAll('.border-gray-200');
            expect(testimonialCards.length).toBeGreaterThan(0);
        });

        it('renders testimonial cards with rounded corners', () => {
            const { container } = render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const testimonialCards = container.querySelectorAll('.rounded-xl');
            expect(testimonialCards.length).toBeGreaterThan(0);
        });
    });

    describe('Requirement 4.1, 4.2: Text colors in dark theme', () => {
        it('renders testimonial labels with dark text', () => {
            render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const testimonialLabel = screen.getByText('Testimonial 1');
            expect(testimonialLabel).toHaveClass('text-gray-900');
        });

        it('renders field labels with gray-700 text', () => {
            render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const coachNameLabel = screen.getAllByText(/coach name/i)[0];
            expect(coachNameLabel).toHaveClass('text-gray-700');
        });

        it('renders all testimonial labels with proper styling', () => {
            const { container } = render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const labels = container.querySelectorAll('.text-gray-900');
            expect(labels.length).toBeGreaterThan(0);
        });
    });

    describe('Requirement 2.1, 2.5: Textarea styling for quotes', () => {
        it('renders textarea with white background', () => {
            render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const textareas = screen.getAllByRole('textbox', { name: /testimonial/i });
            textareas.forEach((textarea) => {
                expect(textarea).toHaveClass('bg-white');
            });
        });

        it('renders textarea with gray-300 border', () => {
            render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const textareas = screen.getAllByRole('textbox', { name: /testimonial/i });
            textareas.forEach((textarea) => {
                expect(textarea).toHaveClass('border-gray-300');
            });
        });

        it('renders textarea with gray-900 text color', () => {
            render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const textareas = screen.getAllByRole('textbox', { name: /testimonial/i });
            textareas.forEach((textarea) => {
                expect(textarea).toHaveClass('text-gray-900');
            });
        });

        it('renders textarea with gray-400 placeholder', () => {
            render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const textareas = screen.getAllByRole('textbox', { name: /testimonial/i });
            textareas.forEach((textarea) => {
                expect(textarea).toHaveClass('placeholder-gray-400');
            });
        });

        it('renders textarea with blue focus ring', () => {
            render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const textareas = screen.getAllByRole('textbox', { name: /testimonial/i });
            textareas.forEach((textarea) => {
                expect(textarea).toHaveClass('focus:border-blue-500');
                expect(textarea).toHaveClass('focus:ring-blue-500/20');
            });
        });
    });

    describe('Requirement 3.4: Add/Remove button styles', () => {
        it('renders Add Testimonial button with blue light theme', () => {
            render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const addButton = screen.getByText('+ Add Testimonial');
            expect(addButton).toHaveClass('bg-blue-50');
            expect(addButton).toHaveClass('text-blue-600');
            expect(addButton).toHaveClass('border-blue-200');
        });

        it('renders Remove buttons with red light theme', () => {
            render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const removeButtons = screen.getAllByText('Remove');
            removeButtons.forEach((button) => {
                expect(button).toHaveClass('bg-red-50');
                expect(button).toHaveClass('text-red-600');
                expect(button).toHaveClass('border-red-200');
            });
        });

        it('Add button has hover state', () => {
            render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const addButton = screen.getByText('+ Add Testimonial');
            expect(addButton).toHaveClass('hover:bg-blue-100');
        });

        it('Remove buttons have hover state', () => {
            render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const removeButtons = screen.getAllByText('Remove');
            removeButtons.forEach((button) => {
                expect(button).toHaveClass('hover:bg-red-100');
            });
        });
    });

    describe('Requirement 5.3: Empty state text color', () => {
        it('renders empty state with gray-500 text', () => {
            const emptyProps = {
                ...defaultProps,
                formData: [],
            };

            render(<CoachesPerspectiveSectionEdit {...emptyProps} />);

            const emptyMessage = screen.getByText('No testimonials added yet. Click "Add Testimonial" to get started.');
            expect(emptyMessage).toHaveClass('text-gray-500');
        });
    });

    describe('Requirement 8.1, 8.2, 8.3: Functionality tests', () => {
        it('can add a new testimonial', () => {
            render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const addButton = screen.getByText('+ Add Testimonial');
            fireEvent.click(addButton);

            expect(defaultProps.setFormData).toHaveBeenCalled();
        });

        it('can remove a testimonial', () => {
            render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const removeButtons = screen.getAllByText('Remove');
            fireEvent.click(removeButtons[0]);

            expect(defaultProps.setFormData).toHaveBeenCalled();
        });

        it('can edit testimonial quote', () => {
            render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const quoteTextarea = screen.getByDisplayValue('Marcus is an exceptional player with great leadership skills.');
            fireEvent.change(quoteTextarea, { target: { value: 'Updated testimonial' } });

            expect(defaultProps.setFormData).toHaveBeenCalled();
        });

        it('can edit coach name', () => {
            render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const coachNameInput = screen.getByDisplayValue('Coach David Miller');
            fireEvent.change(coachNameInput, { target: { value: 'Updated Coach Name' } });

            expect(defaultProps.setFormData).toHaveBeenCalled();
        });

        it('can edit coach title', () => {
            render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const coachTitleInput = screen.getByDisplayValue('Head Football Coach');
            fireEvent.change(coachTitleInput, { target: { value: 'Updated Title' } });

            expect(defaultProps.setFormData).toHaveBeenCalled();
        });

        it('can edit organization', () => {
            render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const organizationInputs = screen.getAllByDisplayValue('Westlake High School');
            fireEvent.change(organizationInputs[0], { target: { value: 'Updated Organization' } });

            expect(defaultProps.setFormData).toHaveBeenCalled();
        });
    });

    describe('Requirement 8.1, 8.2: Form validation and save/cancel', () => {
        it('calls onSave when Save button is clicked', () => {
            render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const saveButton = screen.getByText('Save');
            fireEvent.click(saveButton);

            expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
        });

        it('calls onCancel when Cancel button is clicked', () => {
            render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const cancelButton = screen.getByText('Cancel');
            fireEvent.click(cancelButton);

            expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
        });

        it('disables all inputs when saving', () => {
            const savingProps = {
                ...defaultProps,
                isSaving: true,
            };

            render(<CoachesPerspectiveSectionEdit {...savingProps} />);

            const quoteTextarea = screen.getByDisplayValue('Marcus is an exceptional player with great leadership skills.');
            expect(quoteTextarea).toBeDisabled();

            const addButton = screen.getByText('+ Add Testimonial');
            expect(addButton).toBeDisabled();

            const removeButtons = screen.getAllByText('Remove');
            removeButtons.forEach((button) => {
                expect(button).toBeDisabled();
            });
        });

        it('displays field-level error messages', () => {
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

        it('displays form-level error messages', () => {
            const propsWithErrors = {
                ...defaultProps,
                errors: {
                    testimonials: 'At least one testimonial is required',
                },
            };

            render(<CoachesPerspectiveSectionEdit {...propsWithErrors} />);

            expect(screen.getByText('At least one testimonial is required')).toBeInTheDocument();
        });

        it('displays error messages in red-600', () => {
            const propsWithErrors = {
                ...defaultProps,
                errors: {
                    'testimonial-0-quote': 'Testimonial is required',
                },
            };

            render(<CoachesPerspectiveSectionEdit {...propsWithErrors} />);

            const errorMessage = screen.getByText('Testimonial is required');
            expect(errorMessage).toHaveClass('text-red-600');
        });
    });

    describe('Accessibility and responsive design', () => {
        it('has minimum touch target size for buttons', () => {
            render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const addButton = screen.getByText('+ Add Testimonial');
            expect(addButton).toHaveClass('min-h-[44px]');

            const removeButtons = screen.getAllByText('Remove');
            removeButtons.forEach((button) => {
                expect(button).toHaveClass('min-h-[44px]');
            });
        });

        it('has transition effects on buttons', () => {
            render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const addButton = screen.getByText('+ Add Testimonial');
            expect(addButton).toHaveClass('transition-colors');

            const removeButtons = screen.getAllByText('Remove');
            removeButtons.forEach((button) => {
                expect(button).toHaveClass('transition-colors');
            });
        });

        it('has proper responsive padding', () => {
            const { container } = render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const mainContainer = container.querySelector('.p-6.sm\\:p-8');
            expect(mainContainer).toBeInTheDocument();
        });

        it('has proper responsive button widths', () => {
            render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const addButton = screen.getByText('+ Add Testimonial');
            expect(addButton).toHaveClass('w-full');
            expect(addButton).toHaveClass('sm:w-auto');
        });
    });

    describe('Required field indicators', () => {
        it('shows required asterisk for testimonial field', () => {
            render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const labels = screen.getAllByText('*');
            expect(labels.length).toBeGreaterThan(0);
        });

        it('required asterisks are red-600', () => {
            const { container } = render(<CoachesPerspectiveSectionEdit {...defaultProps} />);

            const requiredIndicators = container.querySelectorAll('.text-red-600');
            expect(requiredIndicators.length).toBeGreaterThan(0);
        });
    });
});
