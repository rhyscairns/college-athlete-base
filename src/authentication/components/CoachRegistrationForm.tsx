'use client';

import { useState, FormEvent } from 'react';
import { TextInput } from './TextInput';
import { SelectInput } from './SelectInput';
import { EmailInput } from './EmailInput';
import { PasswordInput } from './PasswordInput';
import { SubmitButton } from './SubmitButton';
import { ErrorMessage } from './ErrorMessage';
import { SPORTS_LIST } from '../constants';
import {
    validateRequired,
    validateEduEmail,
    validatePassword,
    getRequiredFieldError,
    getEduEmailError,
    getPasswordError,
} from '../utils/validation';
import type { CoachRegistrationData, CoachRegistrationFormProps } from '../types';

export function CoachRegistrationForm({ onSubmit, onCancel }: CoachRegistrationFormProps) {
    // Form state for all fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [coachingCategory, setCoachingCategory] = useState('');
    const [primarySport, setPrimarySport] = useState('');
    const [secondarySport, setSecondarySport] = useState('');
    const [university, setUniversity] = useState('');

    // Error state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState<string | null>(null);

    // Loading state
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Coaching category options
    const COACHING_CATEGORY_OPTIONS = [
        { value: 'mens', label: "Men's" },
        { value: 'womens', label: "Women's" },
    ];

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
                if (!validateEduEmail(value)) {
                    return getEduEmailError();
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

            case 'coachingCategory':
            case 'primarySport':
                if (!validateRequired(value)) {
                    return getRequiredFieldError();
                }
                break;

            case 'secondarySport':
                // Secondary sport is optional, but if selected, it can't be the same as primary
                if (value && value === primarySport) {
                    return 'Secondary sport must be different from primary sport';
                }
                break;

            case 'university':
                if (!validateRequired(value)) {
                    return getRequiredFieldError();
                }
                if (value.length < 2) {
                    return 'Must be at least 2 characters';
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

        const coachingCategoryError = validateField('coachingCategory', coachingCategory);
        if (coachingCategoryError) newErrors.coachingCategory = coachingCategoryError;

        const primarySportError = validateField('primarySport', primarySport);
        if (primarySportError) newErrors.primarySport = primarySportError;

        const secondarySportError = validateField('secondarySport', secondarySport);
        if (secondarySportError) newErrors.secondarySport = secondarySportError;

        const universityError = validateField('university', university);
        if (universityError) newErrors.university = universityError;

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
            // Build sports array - include secondary sport only if selected
            const sports = secondarySport
                ? [primarySport, secondarySport]
                : [primarySport];

            const registrationData: CoachRegistrationData = {
                firstName,
                lastName,
                email,
                password,
                coachingCategory,
                sports,
                university,
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
        coachingCategory.length > 0 &&
        primarySport.length > 0 &&
        university.length > 0;

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

                {/* Coaching Category */}
                <SelectInput
                    label="Coaching Category"
                    name="coachingCategory"
                    value={coachingCategory}
                    onChange={setCoachingCategory}
                    onBlur={() => handleBlur('coachingCategory', coachingCategory)}
                    options={COACHING_CATEGORY_OPTIONS}
                    error={errors.coachingCategory}
                    required
                    disabled={isSubmitting}
                />

                {/* Sport Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectInput
                        label="Primary Sport"
                        name="primarySport"
                        value={primarySport}
                        onChange={(value) => {
                            setPrimarySport(value);
                            // Re-validate secondary sport if it's the same as new primary
                            if (secondarySport === value) {
                                handleBlur('secondarySport', value);
                            }
                        }}
                        onBlur={() => handleBlur('primarySport', primarySport)}
                        options={SPORTS_LIST}
                        error={errors.primarySport}
                        required
                        disabled={isSubmitting}
                    />
                    <SelectInput
                        label="Secondary Sport"
                        name="secondarySport"
                        value={secondarySport}
                        onChange={setSecondarySport}
                        onBlur={() => handleBlur('secondarySport', secondarySport)}
                        options={SPORTS_LIST}
                        error={errors.secondarySport}
                        placeholder="Optional"
                        disabled={isSubmitting}
                    />
                </div>

                {/* University */}
                <TextInput
                    label="University"
                    name="university"
                    value={university}
                    onChange={setUniversity}
                    onBlur={() => handleBlur('university', university)}
                    error={errors.university}
                    required
                    disabled={isSubmitting}
                />
            </div>

            <div className="mt-8 space-y-4">
                <SubmitButton loading={isSubmitting} disabled={!isFormValid || isSubmitting}>
                    Create Coach Account
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
