import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BasicInformationSection } from '../BasicInformationSection';
import type { PlayerProfileFormData, ProfileValidationErrors } from '../../../types';

describe('BasicInformationSection', () => {
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
        state: 'California',
    };

    beforeEach(() => {
        mockSetFormData.mockClear();
        mockHandleBlur.mockClear();
    });

    describe('Component Rendering', () => {
        it('renders with correct initial values', () => {
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByDisplayValue('John')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
            expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
            // Check that the select fields have the correct values
            const sexSelect = screen.getByLabelText(/Sex/i) as HTMLSelectElement;
            expect(sexSelect.value).toBe('male');
            const sportSelect = screen.getByLabelText(/Sport/i) as HTMLSelectElement;
            expect(sportSelect.value).toBe('basketball');
            expect(screen.getByDisplayValue('Point Guard')).toBeInTheDocument();
            expect(screen.getByDisplayValue('3.5')).toBeInTheDocument();
            const countrySelect = screen.getByLabelText(/Country/i) as HTMLSelectElement;
            expect(countrySelect.value).toBe('USA');
        });

        it('renders section heading', () => {
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByRole('heading', { name: 'Basic Information' })).toBeInTheDocument();
        });

        it('renders all required fields', () => {
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Sex/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Sport/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Position/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/GPA/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Country/i)).toBeInTheDocument();
        });

        it('renders state field when country is USA', () => {
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/State/i)).toBeInTheDocument();
        });

        it('renders region field when country is not USA', () => {
            const formDataWithCanada = {
                ...defaultFormData,
                country: 'CAN',
                region: 'Ontario',
            };

            render(
                <BasicInformationSection
                    formData={formDataWithCanada}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/Region/i)).toBeInTheDocument();
            expect(screen.queryByLabelText(/State/i)).not.toBeInTheDocument();
        });

        it('renders scholarship amount field with optional placeholder', () => {
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const scholarshipField = screen.getByLabelText(/Scholarship Amount/i);
            expect(scholarshipField).toBeInTheDocument();
            expect(scholarshipField).toHaveAttribute('placeholder', 'Optional');
        });
    });

    describe('Required Field Indicators', () => {
        it('displays required indicators for all required fields', () => {
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            // Check for asterisks on required fields
            const requiredLabels = [
                'First Name',
                'Last Name',
                'Email',
                'Sex',
                'Sport',
                'Position',
                'GPA',
                'Country',
            ];

            requiredLabels.forEach((label) => {
                const labelElement = screen.getByText(label);
                expect(labelElement.parentElement).toHaveTextContent('*');
            });
        });

        it('does not display required indicator for optional scholarship amount field', () => {
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const scholarshipLabel = screen.getByText('Scholarship Amount');
            expect(scholarshipLabel.parentElement).not.toHaveTextContent('*');
        });
    });

    describe('Field Updates and State Changes', () => {
        it('triggers state change when first name is updated', async () => {
            const user = userEvent.setup();
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const firstNameInput = screen.getByLabelText(/First Name/i);
            await user.clear(firstNameInput);
            await user.type(firstNameInput, 'Jane');

            // Verify that setFormData was called multiple times (once per character)
            expect(mockSetFormData).toHaveBeenCalled();
            expect(mockSetFormData.mock.calls.length).toBeGreaterThan(0);
        });

        it('triggers state change when last name is updated', async () => {
            const user = userEvent.setup();
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const lastNameInput = screen.getByLabelText(/Last Name/i);
            await user.clear(lastNameInput);
            await user.type(lastNameInput, 'Smith');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when email is updated', async () => {
            const user = userEvent.setup();
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const emailInput = screen.getByLabelText(/Email/i);
            await user.clear(emailInput);
            await user.type(emailInput, 'jane@example.com');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when sex is updated', async () => {
            const user = userEvent.setup();
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const sexSelect = screen.getByLabelText(/Sex/i);
            await user.selectOptions(sexSelect, 'female');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when sport is updated', async () => {
            const user = userEvent.setup();
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const sportSelect = screen.getByLabelText(/Sport/i);
            await user.selectOptions(sportSelect, 'soccer');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when position is updated', async () => {
            const user = userEvent.setup();
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const positionInput = screen.getByLabelText(/Position/i);
            await user.clear(positionInput);
            await user.type(positionInput, 'Center');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when GPA is updated', async () => {
            const user = userEvent.setup();
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const gpaInput = screen.getByLabelText(/GPA/i);
            await user.clear(gpaInput);
            await user.type(gpaInput, '4.0');

            expect(mockSetFormData).toHaveBeenCalled();
        });

        it('triggers state change when country is updated', async () => {
            const user = userEvent.setup();
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const countrySelect = screen.getByLabelText(/Country/i);
            await user.selectOptions(countrySelect, 'CAN');

            expect(mockSetFormData).toHaveBeenCalled();
        });
    });

    describe('Validation on Blur', () => {
        it('calls handleBlur when first name field loses focus', async () => {
            const user = userEvent.setup();
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    handleBlur={mockHandleBlur}
                    isEditing={true}
                />
            );

            const firstNameInput = screen.getByLabelText(/First Name/i);
            await user.click(firstNameInput);
            await user.tab();

            expect(mockHandleBlur).toHaveBeenCalledWith('firstName', 'John');
        });

        it('calls handleBlur when last name field loses focus', async () => {
            const user = userEvent.setup();
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    handleBlur={mockHandleBlur}
                    isEditing={true}
                />
            );

            const lastNameInput = screen.getByLabelText(/Last Name/i);
            await user.click(lastNameInput);
            await user.tab();

            expect(mockHandleBlur).toHaveBeenCalledWith('lastName', 'Doe');
        });

        it('calls handleBlur when email field loses focus', async () => {
            const user = userEvent.setup();
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    handleBlur={mockHandleBlur}
                    isEditing={true}
                />
            );

            const emailInput = screen.getByLabelText(/Email/i);
            await user.click(emailInput);
            await user.tab();

            expect(mockHandleBlur).toHaveBeenCalledWith('email', 'john.doe@example.com');
        });

        it('calls handleBlur when sex field loses focus', async () => {
            const user = userEvent.setup();
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    handleBlur={mockHandleBlur}
                    isEditing={true}
                />
            );

            const sexSelect = screen.getByLabelText(/Sex/i);
            await user.click(sexSelect);
            await user.tab();

            expect(mockHandleBlur).toHaveBeenCalledWith('sex', 'male');
        });

        it('calls handleBlur when GPA field loses focus', async () => {
            const user = userEvent.setup();
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    handleBlur={mockHandleBlur}
                    isEditing={true}
                />
            );

            const gpaInput = screen.getByLabelText(/GPA/i);
            await user.click(gpaInput);
            await user.tab();

            expect(mockHandleBlur).toHaveBeenCalledWith('gpa', '3.5');
        });

        it('does not call handleBlur when handleBlur prop is not provided', async () => {
            const user = userEvent.setup();
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const firstNameInput = screen.getByLabelText(/First Name/i);
            await user.click(firstNameInput);
            await user.tab();

            // Should not throw error
            expect(mockHandleBlur).not.toHaveBeenCalled();
        });
    });

    describe('Error Messages Display', () => {
        it('displays error message for first name when error is provided', () => {
            const errors: ProfileValidationErrors = {
                firstName: 'First name is required',
            };

            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    errors={errors}
                    isEditing={true}
                />
            );

            expect(screen.getByText('First name is required')).toBeInTheDocument();
        });

        it('displays error message for last name when error is provided', () => {
            const errors: ProfileValidationErrors = {
                lastName: 'Last name is required',
            };

            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    errors={errors}
                    isEditing={true}
                />
            );

            expect(screen.getByText('Last name is required')).toBeInTheDocument();
        });

        it('displays error message for email when error is provided', () => {
            const errors: ProfileValidationErrors = {
                email: 'Invalid email format',
            };

            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    errors={errors}
                    isEditing={true}
                />
            );

            expect(screen.getByText('Invalid email format')).toBeInTheDocument();
        });

        it('displays error message for sex when error is provided', () => {
            const errors: ProfileValidationErrors = {
                sex: 'Sex is required',
            };

            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    errors={errors}
                    isEditing={true}
                />
            );

            expect(screen.getByText('Sex is required')).toBeInTheDocument();
        });

        it('displays error message for sport when error is provided', () => {
            const errors: ProfileValidationErrors = {
                sport: 'Sport is required',
            };

            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    errors={errors}
                    isEditing={true}
                />
            );

            expect(screen.getByText('Sport is required')).toBeInTheDocument();
        });

        it('displays error message for position when error is provided', () => {
            const errors: ProfileValidationErrors = {
                position: 'Position is required',
            };

            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    errors={errors}
                    isEditing={true}
                />
            );

            expect(screen.getByText('Position is required')).toBeInTheDocument();
        });

        it('displays error message for GPA when error is provided', () => {
            const errors: ProfileValidationErrors = {
                gpa: 'GPA must be between 0.0 and 4.0',
            };

            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    errors={errors}
                    isEditing={true}
                />
            );

            expect(screen.getByText('GPA must be between 0.0 and 4.0')).toBeInTheDocument();
        });

        it('displays error message for country when error is provided', () => {
            const errors: ProfileValidationErrors = {
                country: 'Country is required',
            };

            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    errors={errors}
                    isEditing={true}
                />
            );

            expect(screen.getByText('Country is required')).toBeInTheDocument();
        });

        it('displays multiple error messages simultaneously', () => {
            const errors: ProfileValidationErrors = {
                firstName: 'First name is required',
                email: 'Invalid email format',
                gpa: 'GPA must be between 0.0 and 4.0',
            };

            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    errors={errors}
                    isEditing={true}
                />
            );

            expect(screen.getByText('First name is required')).toBeInTheDocument();
            expect(screen.getByText('Invalid email format')).toBeInTheDocument();
            expect(screen.getByText('GPA must be between 0.0 and 4.0')).toBeInTheDocument();
        });

        it('does not display error messages when errors object is not provided', () => {
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    describe('Disabled State', () => {
        it('disables all fields when isEditing is false', () => {
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={false}
                />
            );

            expect(screen.getByLabelText(/First Name/i)).toBeDisabled();
            expect(screen.getByLabelText(/Last Name/i)).toBeDisabled();
            expect(screen.getByLabelText(/Email/i)).toBeDisabled();
            expect(screen.getByLabelText(/Sex/i)).toBeDisabled();
            expect(screen.getByLabelText(/Sport/i)).toBeDisabled();
            expect(screen.getByLabelText(/Position/i)).toBeDisabled();
            expect(screen.getByLabelText(/GPA/i)).toBeDisabled();
            expect(screen.getByLabelText(/Country/i)).toBeDisabled();
        });

        it('enables all fields when isEditing is true', () => {
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            expect(screen.getByLabelText(/First Name/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/Last Name/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/Email/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/Sex/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/Sport/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/Position/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/GPA/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/Country/i)).not.toBeDisabled();
        });
    });

    describe('GPA Field Attributes', () => {
        it('has correct type and constraints for GPA field', () => {
            render(
                <BasicInformationSection
                    formData={defaultFormData}
                    setFormData={mockSetFormData}
                    isEditing={true}
                />
            );

            const gpaInput = screen.getByLabelText(/GPA/i);
            expect(gpaInput).toHaveAttribute('type', 'number');
            expect(gpaInput).toHaveAttribute('min', '0');
            expect(gpaInput).toHaveAttribute('max', '4');
            expect(gpaInput).toHaveAttribute('step', '0.01');
        });
    });
});
