/**
 * Validation utilities for player profile forms
 */

import {
    validateRequired,
    validateEmail,
    validateGPA as validateGPABase,
    getRequiredFieldError,
    getEmailError,
    getGPAError,
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
 * Validates GPA (wrapper for consistency)
 */
export const validateGPA = validateGPABase;

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
    const requiredFields = [
        'firstName',
        'lastName',
        'email',
        'sex',
        'sport',
        'position',
        'gpa',
        'country',
    ];

    // Check required fields
    if (requiredFields.includes(fieldName)) {
        if (!validateRequired(value)) {
            return getRequiredFieldError();
        }
    }

    // Field-specific validation
    switch (fieldName) {
        case 'email':
        case 'parentGuardianEmail':
            if (value && !validateEmail(value)) {
                return getEmailError();
            }
            break;

        case 'gpa':
            if (value && !validateGPA(value)) {
                return getGPAError();
            }
            break;

        case 'phone':
        case 'parentGuardianPhone':
            if (value && !validatePhone(value)) {
                return getPhoneError();
            }
            break;

        default:
            break;
    }

    return undefined;
};

/**
 * Validates video URLs in the videos array
 */
export const validateVideos = (
    videos: Array<{ id: string; title?: string; url: string; description?: string; isMain: boolean; order: number }> | undefined
): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!videos || videos.length === 0) {
        return errors;
    }

    videos.forEach((video, index) => {
        if (video.url && !validateURL(video.url)) {
            errors[`video_${index}_url`] = getURLError();
        }
    });

    return errors;
};

/**
 * Validates social media URLs
 */
export const validateSocialMedia = (
    socialMedia:
        | {
            twitter?: string;
            instagram?: string;
            youtube?: string;
            tiktok?: string;
            facebook?: string;
            linkedin?: string;
        }
        | undefined
): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!socialMedia) {
        return errors;
    }

    Object.entries(socialMedia).forEach(([platform, url]) => {
        if (url && !validateURL(url)) {
            errors[`socialMedia_${platform}`] = getURLError();
        }
    });

    return errors;
};

// Re-export common validation utilities
export { validateRequired, validateEmail, getRequiredFieldError, getEmailError, getGPAError };
