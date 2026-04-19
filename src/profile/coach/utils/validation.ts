/**
 * Validation utilities for coach profile forms
 */

import {
    validateRequired,
    validateEmail,
    getRequiredFieldError,
    getEmailError,
} from '@/authentication/utils/validation';

/**
 * Validates if a phone number is properly formatted
 * Accepts various formats: (123) 456-7890, 123-456-7890, 1234567890, +1 123 456 7890
 */
export const validatePhone = (phone: string): boolean => {
    if (!phone || phone.trim().length === 0) {
        return true; // Phone is optional, so empty is valid
    }

    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');

    // Check if it has at least 10 digits (US format)
    const digitCount = cleaned.replace(/\+/g, '').length;
    return digitCount >= 10 && digitCount <= 15;
};

/**
 * Validates if a URL is properly formatted
 */
export const validateURL = (url: string): boolean => {
    if (!url || url.trim().length === 0) {
        return true; // URL is optional, so empty is valid
    }

    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
        return false;
    }
};

/**
 * Gets a user-friendly error message for phone validation
 */
export const getPhoneError = (): string => {
    return 'Please enter a valid phone number';
};

/**
 * Gets a user-friendly error message for URL validation
 */
export const getURLError = (): string => {
    return 'Please enter a valid URL (must start with http:// or https://)';
};

/**
 * Validates a single field based on field name and value
 */
export const validateField = (
    fieldName: string,
    value: string | undefined | null
): string | undefined => {
    const requiredFields = ['firstName', 'lastName', 'email'];

    // Check required fields
    if (requiredFields.includes(fieldName)) {
        if (!validateRequired(value)) {
            return getRequiredFieldError();
        }
    }

    // Field-specific validation
    switch (fieldName) {
        case 'email':
            if (value && !validateEmail(value)) {
                return getEmailError();
            }
            break;

        case 'phone':
            if (value && !validatePhone(value)) {
                return getPhoneError();
            }
            break;

        case 'profileImage':
        case 'teamWebsiteUrl':
            if (value && !validateURL(value)) {
                return getURLError();
            }
            break;

        default:
            break;
    }

    return undefined;
};

/**
 * Validates coach profile data
 * Returns an object with field names as keys and error messages as values
 */
export const validateCoachProfile = (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    university?: string;
    position?: string;
    sport?: string;
    yearsExperience?: number;
    profileImage?: string;
    teamWebsiteUrl?: string;
    universityLogoUrl?: string;
    conference?: string;
    division?: string;
    teamName?: string;
    officeLocation?: string;
    officeHours?: string;
    achievements?: string[];
}): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Validate required fields
    if (!validateRequired(data.firstName)) {
        errors.firstName = getRequiredFieldError();
    }

    if (!validateRequired(data.lastName)) {
        errors.lastName = getRequiredFieldError();
    }

    if (!validateRequired(data.email)) {
        errors.email = getRequiredFieldError();
    } else if (!validateEmail(data.email)) {
        errors.email = getEmailError();
    }

    // Validate optional phone
    if (data.phone && !validatePhone(data.phone)) {
        errors.phone = getPhoneError();
    }

    // Validate optional profile image URL
    if (data.profileImage && !validateURL(data.profileImage)) {
        errors.profileImage = getURLError();
    }

    // Validate optional team website URL
    if (data.teamWebsiteUrl && !validateURL(data.teamWebsiteUrl)) {
        errors.teamWebsiteUrl = getURLError();
    }

    return errors;
};

// Re-export common validation utilities
export { validateRequired, validateEmail, getRequiredFieldError, getEmailError };
