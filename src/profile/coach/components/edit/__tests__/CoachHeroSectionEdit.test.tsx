import { render, screen, fireEvent } from '@testing-library/react';
import { CoachHeroSectionEdit } from '../CoachHeroSectionEdit';
import type { CoachProfile, ValidationErrors } from '../../../types';

describe('CoachHeroSectionEdit', () => {
    const mockFormData: CoachProfile = {
        id: '123',
        firstName: 'John',
        lastName: 'Smith',
        initials: 'JS',
        email: 'john.smith@university.edu',
        phone: '+1-555-0123',
        university: 'State University',
        position: 'Head Coach',
        sport: 'Basketball',
        profileImage: 'https://example.com/image.jpg',
        teamWebsiteUrl: 'https://university.edu/basketball',
        createdAt: new Date(),
        updatedAt: new Date(),
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
            <CoachHeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        expect(screen.getByLabelText(/first name/i)).toHaveValue('John');
        expect(screen.getByLabelText(/last name/i)).toHaveValue('Smith');
        expect(screen.getByLabelText(/email/i)).toHaveValue('john.smith@university.edu');
        expect(screen.getByLabelText(/phone/i)).toHaveValue('+1-555-0123');
        expect(screen.getByLabelText(/university/i)).toHaveValue('State University');
        expect(screen.getByLabelText(/position/i)).toHaveValue('Head Coach');
        expect(screen.getByLabelText(/sport/i)).toHaveValue('Basketball');
        expect(screen.getByLabelText(/profile image url/i)).toHaveValue('https://example.com/image.jpg');
        expect(screen.getByLabelText(/team website url/i)).toHaveValue('https://university.edu/basketball');
    });

    it('renders form with empty optional fields', () => {
        const minimalFormData: CoachProfile = {
            id: '123',
            firstName: 'John',
            lastName: 'Smith',
            initials: 'JS',
            email: 'john.smith@university.edu',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        render(
            <CoachHeroSectionEdit
                formData={minimalFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        expect(screen.getByLabelText(/phone/i)).toHaveValue('');
        expect(screen.getByLabelText(/university/i)).toHaveValue('');
        expect(screen.getByLabelText(/position/i)).toHaveValue('');
        expect(screen.getByLabelText(/sport/i)).toHaveValue('');
        expect(screen.getByLabelText(/profile image url/i)).toHaveValue('');
        expect(screen.getByLabelText(/team website url/i)).toHaveValue('');
    });

    it('calls setFormData when input values change', () => {
        render(
            <CoachHeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const firstNameInput = screen.getByLabelText(/first name/i);
        fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

        expect(mockSetFormData).toHaveBeenCalled();
    });

    it('calls setFormData for each field change', () => {
        render(
            <CoachHeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const emailInput = screen.getByLabelText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'new.email@test.com' } });

        expect(mockSetFormData).toHaveBeenCalled();

        const phoneInput = screen.getByLabelText(/phone/i);
        fireEvent.change(phoneInput, { target: { value: '+1-555-9999' } });

        expect(mockSetFormData).toHaveBeenCalledTimes(2);
    });

    it('displays validation errors when present', () => {
        const errorsWithMessages: ValidationErrors = {
            firstName: 'First name is required',
            email: 'Invalid email format',
            phone: 'Invalid phone number format',
        };

        render(
            <CoachHeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={errorsWithMessages}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        expect(screen.getByText('First name is required')).toBeInTheDocument();
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
        expect(screen.getByText('Invalid phone number format')).toBeInTheDocument();
    });

    it('calls onSave when Save button is clicked', () => {
        render(
            <CoachHeroSectionEdit
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
            <CoachHeroSectionEdit
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
            <CoachHeroSectionEdit
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
        expect(screen.getByLabelText(/email/i)).toBeDisabled();
        expect(screen.getByLabelText(/phone/i)).toBeDisabled();
        expect(screen.getByLabelText(/university/i)).toBeDisabled();
        expect(screen.getByLabelText(/position/i)).toBeDisabled();
        expect(screen.getByLabelText(/sport/i)).toBeDisabled();
        expect(screen.getByLabelText(/profile image url/i)).toBeDisabled();
        expect(screen.getByLabelText(/team website url/i)).toBeDisabled();
    });

    it('disables Save button when isSaving is true', () => {
        render(
            <CoachHeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={true}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const saveButton = screen.getByRole('button', { name: /saving/i });
        expect(saveButton).toBeDisabled();
    });

    it('shows "Saving..." text on Save button when isSaving is true', () => {
        render(
            <CoachHeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={true}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^save$/i })).not.toBeInTheDocument();
    });

    it('shows loading spinner when isSaving is true', () => {
        const { container } = render(
            <CoachHeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={true}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const spinner = container.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
    });

    it('does not show loading spinner when isSaving is false', () => {
        const { container } = render(
            <CoachHeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const spinner = container.querySelector('.animate-spin');
        expect(spinner).not.toBeInTheDocument();
    });

    it('applies correct styling classes', () => {
        const { container } = render(
            <CoachHeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const mainContainer = container.firstChild;
        expect(mainContainer).toHaveClass('space-y-4', 'p-3', 'sm:p-4', 'bg-white/5', 'rounded-2xl', 'border', 'border-white/10', 'animate-fade-in');
    });

    it('uses grid layout for paired fields', () => {
        const { container } = render(
            <CoachHeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const gridContainers = container.querySelectorAll('.grid.grid-cols-1.md\\:grid-cols-2.gap-4');
        expect(gridContainers.length).toBe(2); // Name fields, University/Position
    });

    it('has minimum 44px touch targets for buttons', () => {
        render(
            <CoachHeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const saveButton = screen.getByRole('button', { name: /save/i });
        const cancelButton = screen.getByRole('button', { name: /cancel/i });

        expect(saveButton).toHaveClass('min-h-[44px]');
        expect(cancelButton).toHaveClass('min-h-[44px]');
    });

    it('handles Enter key on Save button', () => {
        render(
            <CoachHeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const saveButton = screen.getByRole('button', { name: /save/i });
        fireEvent.keyDown(saveButton, { key: 'Enter', code: 'Enter' });

        expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    it('handles Enter key on Cancel button', () => {
        render(
            <CoachHeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.keyDown(cancelButton, { key: 'Enter', code: 'Enter' });

        expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('does not call onSave on Enter key when isSaving is true', () => {
        render(
            <CoachHeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={true}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        const saveButton = screen.getByRole('button', { name: /saving/i });
        fireEvent.keyDown(saveButton, { key: 'Enter', code: 'Enter' });

        expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('marks required fields with asterisk', () => {
        render(
            <CoachHeroSectionEdit
                formData={mockFormData}
                setFormData={mockSetFormData}
                errors={mockErrors}
                isSaving={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        );

        // Check that required fields have asterisks in their labels
        const firstNameLabel = screen.getByText(/first name/i).closest('label');
        const lastNameLabel = screen.getByText(/last name/i).closest('label');
        const emailLabel = screen.getByText(/email/i).closest('label');

        expect(firstNameLabel?.textContent).toContain('*');
        expect(lastNameLabel?.textContent).toContain('*');
        expect(emailLabel?.textContent).toContain('*');
    });

    describe('Placeholder Text', () => {
        it('shows helpful placeholder for phone field', () => {
            const minimalFormData: CoachProfile = {
                id: '123',
                firstName: 'John',
                lastName: 'Smith',
                initials: 'JS',
                email: 'john.smith@university.edu',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            render(
                <CoachHeroSectionEdit
                    formData={minimalFormData}
                    setFormData={mockSetFormData}
                    errors={mockErrors}
                    isSaving={false}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const phoneInput = screen.getByLabelText(/phone/i);
            expect(phoneInput).toHaveAttribute('placeholder', 'e.g., +1-555-0123');
        });

        it('shows helpful placeholder for position field', () => {
            const minimalFormData: CoachProfile = {
                id: '123',
                firstName: 'John',
                lastName: 'Smith',
                initials: 'JS',
                email: 'john.smith@university.edu',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            render(
                <CoachHeroSectionEdit
                    formData={minimalFormData}
                    setFormData={mockSetFormData}
                    errors={mockErrors}
                    isSaving={false}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const positionInput = screen.getByLabelText(/position/i);
            expect(positionInput).toHaveAttribute('placeholder', 'e.g., Head Coach');
        });

        it('shows helpful placeholder for university field', () => {
            const minimalFormData: CoachProfile = {
                id: '123',
                firstName: 'John',
                lastName: 'Smith',
                initials: 'JS',
                email: 'john.smith@university.edu',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            render(
                <CoachHeroSectionEdit
                    formData={minimalFormData}
                    setFormData={mockSetFormData}
                    errors={mockErrors}
                    isSaving={false}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const universityInput = screen.getByLabelText(/university/i);
            expect(universityInput).toHaveAttribute('placeholder', 'e.g., State University');
        });

        it('shows helpful placeholder for sport field', () => {
            const minimalFormData: CoachProfile = {
                id: '123',
                firstName: 'John',
                lastName: 'Smith',
                initials: 'JS',
                email: 'john.smith@university.edu',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            render(
                <CoachHeroSectionEdit
                    formData={minimalFormData}
                    setFormData={mockSetFormData}
                    errors={mockErrors}
                    isSaving={false}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const sportInput = screen.getByLabelText(/sport/i);
            expect(sportInput).toHaveAttribute('placeholder', 'e.g., Basketball, Football, Soccer');
        });

        it('shows helpful placeholder for profile image URL field', () => {
            const minimalFormData: CoachProfile = {
                id: '123',
                firstName: 'John',
                lastName: 'Smith',
                initials: 'JS',
                email: 'john.smith@university.edu',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            render(
                <CoachHeroSectionEdit
                    formData={minimalFormData}
                    setFormData={mockSetFormData}
                    errors={mockErrors}
                    isSaving={false}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const profileImageInput = screen.getByLabelText(/profile image url/i);
            expect(profileImageInput).toHaveAttribute('placeholder', 'https://example.com/image.jpg');
        });

        it('shows helpful placeholder for team website URL field', () => {
            const minimalFormData: CoachProfile = {
                id: '123',
                firstName: 'John',
                lastName: 'Smith',
                initials: 'JS',
                email: 'john.smith@university.edu',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            render(
                <CoachHeroSectionEdit
                    formData={minimalFormData}
                    setFormData={mockSetFormData}
                    errors={mockErrors}
                    isSaving={false}
                    onSave={mockOnSave}
                    onCancel={mockOnCancel}
                />
            );

            const teamWebsiteInput = screen.getByLabelText(/team website url/i);
            expect(teamWebsiteInput).toHaveAttribute('placeholder', 'https://university.edu/basketball');
        });
    });
});
