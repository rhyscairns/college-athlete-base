import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactInformationSection } from '../ContactInformationSection';
import type { PlayerProfileFormData, ProfileValidationErrors } from '../../../types';

describe('ContactInformationSection', () => {
    const mockSetFormData = jest.fn();
    const mockHandleBlur = jest.fn();

    const defaultFormData: PlayerProfileFormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        sex: 'male',
        sport: 'basketball',
        position: 'Point Guard',
        gpa: '3.5',
        country: 'USA',
        phone: '555-123-4567',
        parentGuardianName: 'Jane Doe',
        parentGuardianPhone: '555-987-6543',
        parentGuardianEmail: 'jane.doe@example.com',
        coachReferences: JSON.stringify([
            { name: 'Coach Smith', email: 'smith@example.com', phone: '555-111-2222' }
        ]),
    };

    beforeEach(() => {
        mockSetFormData.mockClear();
        mockHandleBlur.mockClear();
    });

    describe('Component Rendering', () => {
        it('renders with correct initial values', () => {
            render(
                <ContactInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByDisplayValue('555-123-4567')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
            expect(screen.getByDisplayValue('555-987-6543')).toBeInTheDocument();
            expect(screen.getByDisplayValue('jane.doe@example.com')).toBeInTheDocument();
        });

        it('renders section heading', () => {
            render(
                <ContactInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByRole('heading', { name: 'Contact Information' })).toBeInTheDocument();
        });

        it('renders all contact fields', () => {
            render(
                <ContactInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/^Phone Number/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Parent\/Guardian Name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Parent\/Guardian Phone/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Parent\/Guardian Email/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Coach References/i)).toBeInTheDocument();
        });

        it('renders with empty values when not provided', () => {
            const emptyFormData = {
                ...defaultFormData,
                phone: undefined,
                parentGuardianName: undefined,
                parentGuardianPhone: undefined,
                parentGuardianEmail: undefined,
                coachReferences: undefined,
            };

            render(
                <ContactInformationSection
                    formData={emptyFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const phoneInput = screen.getByLabelText(/^Phone Number/i) as HTMLInputElement;
            const parentNameInput = screen.getByLabelText(/Parent\/Guardian Name/i) as HTMLInputElement;

            expect(phoneInput.value).toBe('');
            expect(parentNameInput.value).toBe('');
        });

        it('renders optional placeholder for fields', () => {
            render(
                <ContactInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/^Phone Number/i)).toHaveAttribute('placeholder', 'Optional');
            expect(screen.getByLabelText(/Parent\/Guardian Name/i)).toHaveAttribute('placeholder', 'Optional');
            expect(screen.getByLabelText(/Parent\/Guardian Phone/i)).toHaveAttribute('placeholder', 'Optional');
            expect(screen.getByLabelText(/Parent\/Guardian Email/i)).toHaveAttribute('placeholder', 'Optional');
            expect(screen.getByLabelText(/Coach References/i)).toHaveAttribute('placeholder', 'Optional');
        });
    });

    describe('Field Updates and State Changes', () => {
        it('triggers state change when phone is updated', async () => {
            const user = userEvent.setup();
            render(
                <ContactInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const phoneInput = screen.getByLabelText(/^Phone Number/i);
            await user.clear(phoneInput);
            await user.type(phoneInput, '555-999-8888');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when parent/guardian name is updated', async () => {
            const user = userEvent.setup();
            render(
                <ContactInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const parentNameInput = screen.getByLabelText(/Parent\/Guardian Name/i);
            await user.clear(parentNameInput);
            await user.type(parentNameInput, 'John Smith');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when parent/guardian phone is updated', async () => {
            const user = userEvent.setup();
            render(
                <ContactInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const parentPhoneInput = screen.getByLabelText(/Parent\/Guardian Phone/i);
            await user.clear(parentPhoneInput);
            await user.type(parentPhoneInput, '555-777-6666');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when parent/guardian email is updated', async () => {
            const user = userEvent.setup();
            render(
                <ContactInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const parentEmailInput = screen.getByLabelText(/Parent\/Guardian Email/i);
            await user.clear(parentEmailInput);
            await user.type(parentEmailInput, 'parent@example.com');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when coach references is updated', async () => {
            const user = userEvent.setup();
            render(
                <ContactInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const coachReferencesInput = screen.getByLabelText(/Coach References/i);
            await user.clear(coachReferencesInput);
            await user.type(coachReferencesInput, 'Coach Johnson');

            expect(mockSetFormData).toHaveBeenCalled();
        });
    });

    describe('Validation on Blur', () => {
        it('calls handleBlur when phone field loses focus', async () => {
            const user = userEvent.setup();
            render(
                <ContactInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    handleBlur={mockHandleBlur}
                    isEditing={true}
                />
            );

            const phoneInput = screen.getByLabelText(/^Phone Number/i);
            await user.click(phoneInput);
            await user.tab();

            expect(mockHandleBlur).toHaveBeenCalledWith('phone', '555-123-4567');
        });

        it('calls handleBlur when parent/guardian phone field loses focus', async () => {
            const user = userEvent.setup();
            render(
                <ContactInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    handleBlur={mockHandleBlur}
                    isEditing={true}
                />
            );

            const parentPhoneInput = screen.getByLabelText(/Parent\/Guardian Phone/i);
            await user.click(parentPhoneInput);
            await user.tab();

            expect(mockHandleBlur).toHaveBeenCalledWith('parentGuardianPhone', '555-987-6543');
        });

        it('calls handleBlur when parent/guardian email field loses focus', async () => {
            const user = userEvent.setup();
            render(
                <ContactInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    handleBlur={mockHandleBlur}
                    isEditing={true}
                />
            );

            const parentEmailInput = screen.getByLabelText(/Parent\/Guardian Email/i);
            await user.click(parentEmailInput);
            await user.tab();

            expect(mockHandleBlur).toHaveBeenCalledWith('parentGuardianEmail', 'jane.doe@example.com');
        });

        it('does not call handleBlur when handleBlur prop is not provided', async () => {
            const user = userEvent.setup();
            render(
                <ContactInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const phoneInput = screen.getByLabelText(/^Phone Number/i);
            await user.click(phoneInput);
            await user.tab();

            expect(mockHandleBlur).not.toHaveBeenCalled();
        });
    });

    describe('Error Messages Display', () => {
        it('displays error message for phone when error is provided', () => {
            const errors: ProfileValidationErrors = {
                phone: 'Invalid phone format',
            };

            render(
                <ContactInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    errors={errors}
                    isEditing={true}
                />
            );

            expect(screen.getByText('Invalid phone format')).toBeInTheDocument();
        });

        it('displays error message for parent/guardian phone when error is provided', () => {
            const errors: ProfileValidationErrors = {
                parentGuardianPhone: 'Invalid phone format',
            };

            render(
                <ContactInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    errors={errors}
                    isEditing={true}
                />
            );

            expect(screen.getByText('Invalid phone format')).toBeInTheDocument();
        });

        it('displays error message for parent/guardian email when error is provided', () => {
            const errors: ProfileValidationErrors = {
                parentGuardianEmail: 'Invalid email format',
            };

            render(
                <ContactInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    errors={errors}
                    isEditing={true}
                />
            );

            expect(screen.getByText('Invalid email format')).toBeInTheDocument();
        });

        it('displays multiple error messages simultaneously', () => {
            const errors: ProfileValidationErrors = {
                phone: 'Invalid phone format',
                parentGuardianEmail: 'Invalid email format',
            };

            render(
                <ContactInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    errors={errors}
                    isEditing={true}
                />
            );

            const errorMessages = screen.getAllByText(/Invalid (phone|email) format/i);
            expect(errorMessages.length).toBe(2);
        });
    });

    describe('Field Attributes', () => {
        it('has correct type for phone fields', () => {
            render(
                <ContactInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/^Phone Number/i)).toHaveAttribute('type', 'tel');
            expect(screen.getByLabelText(/Parent\/Guardian Phone/i)).toHaveAttribute('type', 'tel');
        });

        it('uses textarea for coach references', () => {
            render(
                <ContactInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const coachReferencesInput = screen.getByLabelText(/Coach References/i);
            expect(coachReferencesInput.tagName).toBe('TEXTAREA');
        });
    });

    describe('Disabled State', () => {
        it('disables all fields when isEditing is false', () => {
            render(
                <ContactInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={false}
                />
            );

            expect(screen.getByLabelText(/^Phone Number/i)).toBeDisabled();
            expect(screen.getByLabelText(/Parent\/Guardian Name/i)).toBeDisabled();
            expect(screen.getByLabelText(/Parent\/Guardian Phone/i)).toBeDisabled();
            expect(screen.getByLabelText(/Parent\/Guardian Email/i)).toBeDisabled();
            expect(screen.getByLabelText(/Coach References/i)).toBeDisabled();
        });

        it('enables all fields when isEditing is true', () => {
            render(
                <ContactInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/^Phone Number/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/Parent\/Guardian Name/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/Parent\/Guardian Phone/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/Parent\/Guardian Email/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/Coach References/i)).not.toBeDisabled();
        });
    });

    describe('Layout', () => {
        it('uses two-column grid layout for parent/guardian phone and email', () => {
            const { container } = render(
                <ContactInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const gridContainer = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
            expect(gridContainer).toBeInTheDocument();
        });
    });
});
