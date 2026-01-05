'use client';

import { useState, FormEvent } from 'react';
import { TextInput } from './TextInput';
import { SelectInput } from './SelectInput';
import { EmailInput } from './EmailInput';
import { PasswordInput } from './PasswordInput';
import { SubmitButton } from './SubmitButton';
import { ErrorMessage } from './ErrorMessage';
import {
    SPORTS_LIST,
    COUNTRIES_LIST,
    US_STATES_LIST,
    SEX_OPTIONS,
} from '../constants';
import {
    validateRequired,
    validateEmail,
    validatePassword,
    validateGPA,
    getRequiredFieldError,
    getEmailError,
    getPasswordError,
    getGPAError,
} from '../utils/validation';
import type { PlayerRegistrationData, PlayerRegistrationFormProps } from '../types';

export function PlayerRegistrationForm({ onSubmit, onCancel }: PlayerRegistrationFormProps) {
    // Form state for all fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [gender, setGender] = useState('');
    const [sport, setSport] = useState('');
    const [position, setPosition] = useState('');
    const [gpa, setGpa] = useState('');
    const [country, setCountry] = useState('');
    const [state, setState] = useState('');
    const [region, setRegion] = useState('');
    const [scholarshipAmount, setScholarshipAmount] = useState('');
    const [testScores, setTestScores] = useState('');

    // Error state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState<string | null>(null);

    // Loading state
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validation functions
    const validateField = (fieldName: string, value: string): string | undefined => {
        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (!validateRequired(value)) {
                    return getRequiredFieldError();
                }
                if (value.length < 2) {
                    return 'Must be at least 2 characters';
                }
                if (value.length > 50) {
                    return 'Must be 50 characters or less';
                }
                break;

            case 'email':
                if (!validateRequired(value)) {
                    return getRequiredFieldError();
                }
                if (!validateEmail(value)) {
                    return getEmailError();
                }
                break;

            case 'password':
                if (!validateRequired(value)) {
                    return getRequiredFieldError();
                }
                if (!validatePassword(value)) {
                    return getPasswordError();
                }
                break;

            case 'gender':
            case 'sport':
            case 'country':
                if (!validateRequired(value)) {
                    return getRequiredFieldError();
                }
                break;

            case 'position':
                if (!validateRequired(value)) {
                    return getRequiredFieldError();
                }
                if (value.length < 2) {
                    return 'Must be at least 2 characters';
                }
                break;

            case 'gpa':
                if (!validateRequired(value)) {
                    return getRequiredFieldError();
                }
                if (!validateGPA(value)) {
                    return getGPAError();
                }
                break;

            case 'state':
                if (country === 'USA' && !validateRequired(value)) {
                    return getRequiredFieldError();
                }
                break;

            case 'region':
                if (country !== 'USA' && country && !validateRequired(value)) {
                    return getRequiredFieldError();
                }
                break;

            case 'scholarshipAmount':
                if (value && parseFloat(value) < 0) {
                    return 'Must be a positive number';
                }
                break;
        }

        return undefined;
    };

    const handleBlur = (fieldName: string, value: string) => {
        const error = validateField(fieldName, value);
        setErrors((prev) => {
            const newErrors = { ...prev };
            if (error) {
                newErrors[fieldName] = error;
            } else {
                delete newErrors[fieldName];
            }
            return newErrors;
        });
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validate all required fields
        const firstNameError = validateField('firstName', firstName);
        if (firstNameError) newErrors.firstName = firstNameError;

        const lastNameError = validateField('lastName', lastName);
        if (lastNameError) newErrors.lastName = lastNameError;

        const emailError = validateField('email', email);
        if (emailError) newErrors.email = emailError;

        const passwordError = validateField('password', password);
        if (passwordError) newErrors.password = passwordError;

        const genderError = validateField('gender', gender);
        if (genderError) newErrors.gender = genderError;

        const sportError = validateField('sport', sport);
        if (sportError) newErrors.sport = sportError;

        const positionError = validateField('position', position);
        if (positionError) newErrors.position = positionError;

        const gpaError = validateField('gpa', gpa);
        if (gpaError) newErrors.gpa = gpaError;

        const countryError = validateField('country', country);
        if (countryError) newErrors.country = countryError;

        // Conditional validation for state/region
        if (country === 'USA') {
            const stateError = validateField('state', state);
            if (stateError) newErrors.state = stateError;
        } else if (country) {
            const regionError = validateField('region', region);
            if (regionError) newErrors.region = regionError;
        }

        // Optional field validation
        if (scholarshipAmount) {
            const scholarshipError = validateField('scholarshipAmount', scholarshipAmount);
            if (scholarshipError) newErrors.scholarshipAmount = scholarshipError;
        }

        setErrors(newErrors);

        // Focus first error field
        if (Object.keys(newErrors).length > 0) {
            const firstErrorField = Object.keys(newErrors)[0];
            const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
            if (element) {
                element.focus();
            }
        }

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setGeneralError(null);

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const registrationData: PlayerRegistrationData = {
                firstName,
                lastName,
                email,
                password,
                gender,
                sport,
                position,
                gpa: parseFloat(gpa),
                country,
                ...(country === 'USA' ? { state } : { region }),
                ...(scholarshipAmount && { scholarshipAmount: parseFloat(scholarshipAmount) }),
                ...(testScores && { testScores }),
            };

            await onSubmit(registrationData);
        } catch (error) {
            setGeneralError('An error occurred during registration. Please try again.');
            console.error('Registration error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid =
        firstName.length > 0 &&
        lastName.length > 0 &&
        email.length > 0 &&
        password.length > 0 &&
        gender.length > 0 &&
        sport.length > 0 &&
        position.length > 0 &&
        gpa.length > 0 &&
        country.length > 0 &&
        (country === 'USA' ? state.length > 0 : region.length > 0);

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto p-8 sm:p-12 bg-white/90 rounded-3xl shadow-2xl border border-white/50 max-h-[85vh] overflow-y-auto">
            {generalError && (
                <div className="mb-6">
                    <ErrorMessage message={generalError} className="text-center" />
                </div>
            )}

            <div className="space-y-4">
                {/* Name fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                        label="First Name"
                        name="firstName"
                        value={firstName}
                        onChange={setFirstName}
                        onBlur={() => handleBlur('firstName', firstName)}
                        error={errors.firstName}
                        required
                        disabled={isSubmitting}
                    />
                    <TextInput
                        label="Last Name"
                        name="lastName"
                        value={lastName}
                        onChange={setLastName}
                        onBlur={() => handleBlur('lastName', lastName)}
                        error={errors.lastName}
                        required
                        disabled={isSubmitting}
                    />
                </div>

                {/* Email and Password */}
                <EmailInput
                    value={email}
                    onChange={setEmail}
                    onBlur={() => handleBlur('email', email)}
                    error={errors.email}
                    disabled={isSubmitting}
                />
                <PasswordInput
                    value={password}
                    onChange={setPassword}
                    onBlur={() => handleBlur('password', password)}
                    error={errors.password}
                    disabled={isSubmitting}
                />

                {/* Sex and Sport */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectInput
                        label="Sex"
                        name="gender"
                        value={gender}
                        onChange={setGender}
                        onBlur={() => handleBlur('gender', gender)}
                        options={SEX_OPTIONS}
                        error={errors.gender}
                        required
                        disabled={isSubmitting}
                    />
                    <SelectInput
                        label="Sport"
                        name="sport"
                        value={sport}
                        onChange={setSport}
                        onBlur={() => handleBlur('sport', sport)}
                        options={SPORTS_LIST}
                        error={errors.sport}
                        required
                        disabled={isSubmitting}
                    />
                </div>

                {/* Position and GPA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextInput
                        label="Position"
                        name="position"
                        value={position}
                        onChange={setPosition}
                        onBlur={() => handleBlur('position', position)}
                        error={errors.position}
                        required
                        disabled={isSubmitting}
                    />
                    <TextInput
                        label="GPA"
                        name="gpa"
                        type="number"
                        value={gpa}
                        onChange={setGpa}
                        onBlur={() => handleBlur('gpa', gpa)}
                        error={errors.gpa}
                        min={0}
                        max={4}
                        step={0.01}
                        required
                        disabled={isSubmitting}
                    />
                </div>

                {/* Country */}
                <SelectInput
                    label="Country"
                    name="country"
                    value={country}
                    onChange={(value) => {
                        setCountry(value);
                        setState('');
                        setRegion('');
                    }}
                    onBlur={() => handleBlur('country', country)}
                    options={COUNTRIES_LIST}
                    error={errors.country}
                    required
                    disabled={isSubmitting}
                />

                {/* Conditional State/Region */}
                {country === 'USA' && (
                    <SelectInput
                        label="State"
                        name="state"
                        value={state}
                        onChange={setState}
                        onBlur={() => handleBlur('state', state)}
                        options={US_STATES_LIST}
                        error={errors.state}
                        required
                        disabled={isSubmitting}
                    />
                )}

                {country && country !== 'USA' && (
                    <TextInput
                        label="Region/County"
                        name="region"
                        value={region}
                        onChange={setRegion}
                        onBlur={() => handleBlur('region', region)}
                        error={errors.region}
                        required
                        disabled={isSubmitting}
                    />
                )}

                {/* Optional fields */}
                <TextInput
                    label="Scholarship Amount Needed"
                    name="scholarshipAmount"
                    type="number"
                    value={scholarshipAmount}
                    onChange={setScholarshipAmount}
                    onBlur={() => handleBlur('scholarshipAmount', scholarshipAmount)}
                    error={errors.scholarshipAmount}
                    min={0}
                    step={100}
                    disabled={isSubmitting}
                    placeholder="Optional"
                />

                <TextInput
                    label="SAT/ACT Results"
                    name="testScores"
                    value={testScores}
                    onChange={setTestScores}
                    disabled={isSubmitting}
                    placeholder="Optional"
                />
            </div>

            <div className="mt-8 space-y-4">
                <SubmitButton loading={isSubmitting} disabled={!isFormValid || isSubmitting}>
                    Create Player Account
                </SubmitButton>

                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="w-full h-12 text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}
