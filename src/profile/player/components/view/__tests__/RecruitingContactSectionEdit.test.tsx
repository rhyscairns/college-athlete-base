import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecruitingContactSectionEdit, type ContactFormData } from '../RecruitingContactSectionEdit';

describe('RecruitingContactSectionEdit', () => {
    const mockFormData: ContactFormData = {
        email: 'player@example.com',
        phone: '(555) 123-4567',
        parentGuardianName: 'John Doe',
        parentGuardianPhone: '(555) 987-6543',
        parentGuardianEmail: 'parent@example.com',
        socialMedia: {
            twitter: 'https://twitter.com/player',
            instagram: 'https://instagram.com/player',
            youtube: 'https://youtube.com/@player',
            tiktok: 'https://tiktok.com/@player',
        },
        preferredContactMethod: 'Email',
    };

    const mockSetFormData = jest.fn();
    const mockOnSave = jest.fn();
    const mockOnCancel = jest.fn();

    const defaultProps = {
        formData: mockFormData,
        setFormData: mockSetFormData,
        errors: {},
        isSaving: false,
        onSave: mockOnSave,
        onCancel: mockOnCancel,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all form fields', () => {
        render(<RecruitingContactSectionEdit {...defaultProps} />);

        // Player contact fields
        expect(screen.getByLabelText(/^Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^Phone/i)).toBeInTheDocument();

        // Parent/Guardian fields
        expect(screen.getByLabelText(/Parent\/Guardian Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Parent\/Guardian Phone/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Parent\/Guardian Email/i)).toBeInTheDocument();

        // Social media fields
        expect(screen.getByLabelText(/Twitter\/X/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Instagram/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/YouTube/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/TikTok/i)).toBeInTheDocument();

        // Preferred contact method
        expect(screen.getByLabelText(/Preferred Contact Method/i)).toBeInTheDocument();
    });

    it('displays form data correctly', () => {
        render(<RecruitingContactSectionEdit {...defaultProps} />);

        expect(screen.getByDisplayValue('player@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('(555) 123-4567')).toBeInTheDocument();
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('(555) 987-6543')).toBeInTheDocument();
        expect(screen.getByDisplayValue('parent@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('https://twitter.com/player')).toBeInTheDocument();
        expect(screen.getByDisplayValue('https://instagram.com/player')).toBeInTheDocument();
        expect(screen.getByDisplayValue('https://youtube.com/@player')).toBeInTheDocument();
        expect(screen.getByDisplayValue('https://tiktok.com/@player')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Email')).toBeInTheDocument();
    });

    it('calls setFormData when email is changed', () => {
        render(<RecruitingContactSectionEdit {...defaultProps} />);

        const emailInput = screen.getByLabelText(/^Email/i);
        fireEvent.change(emailInput, { target: { value: 'newemail@example.com' } });

        expect(mockSetFormData).toHaveBeenCalled();
    });

    it('calls setFormData when phone is changed', () => {
        render(<RecruitingContactSectionEdit {...defaultProps} />);

        const phoneInput = screen.getByLabelText(/^Phone/i);
        fireEvent.change(phoneInput, { target: { value: '(555) 999-8888' } });

        expect(mockSetFormData).toHaveBeenCalled();
    });

    it('calls setFormData when parent/guardian name is changed', () => {
        render(<RecruitingContactSectionEdit {...defaultProps} />);

        const nameInput = screen.getByLabelText(/Parent\/Guardian Name/i);
        fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

        expect(mockSetFormData).toHaveBeenCalled();
    });

    it('calls setFormData when social media fields are changed', () => {
        render(<RecruitingContactSectionEdit {...defaultProps} />);

        const twitterInput = screen.getByLabelText(/Twitter\/X/i);
        fireEvent.change(twitterInput, { target: { value: 'https://twitter.com/newhandle' } });

        expect(mockSetFormData).toHaveBeenCalled();
    });

    it('calls setFormData when preferred contact method is changed', () => {
        render(<RecruitingContactSectionEdit {...defaultProps} />);

        const methodInput = screen.getByLabelText(/Preferred Contact Method/i);
        fireEvent.change(methodInput, { target: { value: 'Phone' } });

        expect(mockSetFormData).toHaveBeenCalled();
    });

    it('displays validation errors', () => {
        const propsWithErrors = {
            ...defaultProps,
            errors: {
                email: 'Invalid email format',
                phone: 'Invalid phone number',
                'socialMedia.twitter': 'Invalid URL',
            },
        };

        render(<RecruitingContactSectionEdit {...propsWithErrors} />);

        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
        expect(screen.getByText('Invalid phone number')).toBeInTheDocument();
        expect(screen.getByText('Invalid URL')).toBeInTheDocument();
    });

    it('renders Save and Cancel buttons', () => {
        render(<RecruitingContactSectionEdit {...defaultProps} />);

        expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('calls onSave when Save button is clicked', () => {
        render(<RecruitingContactSectionEdit {...defaultProps} />);

        const saveButton = screen.getByRole('button', { name: /Save/i });
        fireEvent.click(saveButton);

        expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when Cancel button is clicked', () => {
        render(<RecruitingContactSectionEdit {...defaultProps} />);

        const cancelButton = screen.getByRole('button', { name: /Cancel/i });
        fireEvent.click(cancelButton);

        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('disables all inputs when isSaving is true', () => {
        const propsWithSaving = {
            ...defaultProps,
            isSaving: true,
        };

        render(<RecruitingContactSectionEdit {...propsWithSaving} />);

        const emailInput = screen.getByLabelText(/^Email/i) as HTMLInputElement;
        const phoneInput = screen.getByLabelText(/^Phone/i) as HTMLInputElement;
        const nameInput = screen.getByLabelText(/Parent\/Guardian Name/i) as HTMLInputElement;

        expect(emailInput.disabled).toBe(true);
        expect(phoneInput.disabled).toBe(true);
        expect(nameInput.disabled).toBe(true);
    });

    it('shows "Saving..." text on Save button when isSaving is true', () => {
        const propsWithSaving = {
            ...defaultProps,
            isSaving: true,
        };

        render(<RecruitingContactSectionEdit {...propsWithSaving} />);

        expect(screen.getByRole('button', { name: /Saving.../i })).toBeInTheDocument();
    });

    it('uses grid layout for paired fields', () => {
        const { container } = render(<RecruitingContactSectionEdit {...defaultProps} />);

        // Check for grid layout classes with responsive breakpoints
        const gridContainers = container.querySelectorAll('.grid.grid-cols-1.sm\\:grid-cols-2');
        expect(gridContainers.length).toBeGreaterThan(0);
    });

    it('applies edit mode container styling', () => {
        const { container } = render(<RecruitingContactSectionEdit {...defaultProps} />);

        const editContainer = container.querySelector('.space-y-4.p-4.sm\\:p-6.bg-white\\/5.rounded-2xl.border.border-white\\/10');
        expect(editContainer).toBeInTheDocument();
    });

    it('handles empty optional fields', () => {
        const propsWithEmptyFields = {
            ...defaultProps,
            formData: {
                ...mockFormData,
                parentGuardianName: undefined,
                parentGuardianPhone: undefined,
                parentGuardianEmail: undefined,
                socialMedia: {
                    twitter: undefined,
                    instagram: undefined,
                    youtube: undefined,
                    tiktok: undefined,
                },
            },
        };

        render(<RecruitingContactSectionEdit {...propsWithEmptyFields} />);

        // Should render without errors
        expect(screen.getByLabelText(/Parent\/Guardian Name/i)).toHaveValue('');
        expect(screen.getByLabelText(/Twitter\/X/i)).toHaveValue('');
    });

    it('has section headers for organization', () => {
        render(<RecruitingContactSectionEdit {...defaultProps} />);

        expect(screen.getByText('Player Contact')).toBeInTheDocument();
        expect(screen.getByText('Parent/Guardian Contact')).toBeInTheDocument();
        expect(screen.getByText('Social Media')).toBeInTheDocument();
    });
});
