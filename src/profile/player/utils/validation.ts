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

/**
 * Validates HeroSection data
 * Validates required fields: firstName, lastName, position, school
 */
export const validateHeroSection = (data: {
    firstName: string;
    lastName: string;
    position: string;
    school: string;
    location?: string;
    classYear?: string;
    height?: string;
    weight?: string;
}): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Validate required fields
    if (!validateRequired(data.firstName)) {
        errors.firstName = getRequiredFieldError();
    }

    if (!validateRequired(data.lastName)) {
        errors.lastName = getRequiredFieldError();
    }

    if (!validateRequired(data.position)) {
        errors.position = getRequiredFieldError();
    }

    if (!validateRequired(data.school)) {
        errors.school = getRequiredFieldError();
    }

    return errors;
};

/**
 * Validates AcademicSection data
 * Validates GPA range (0.0 - 4.0), SAT score range (400 - 1600), ACT score range (1 - 36)
 */
export const validateAcademicSection = (data: {
    gpa: number;
    gpaScale: string;
    satScore?: number;
    satMath?: number;
    satReading?: number;
    actScore?: number;
    classRank: string;
    classRankDetail: string;
    ncaaEligibilityCenter: string;
    ncaaQualifier: boolean;
    coursework: string[];
}): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Validate GPA
    if (data.gpa === undefined || data.gpa === null) {
        errors.gpa = 'GPA is required';
    } else if (data.gpa < 0 || data.gpa > 4.0) {
        errors.gpa = 'GPA must be between 0.0 and 4.0';
    }

    // Validate SAT score if provided
    if (data.satScore !== undefined && data.satScore !== null) {
        if (data.satScore < 400 || data.satScore > 1600) {
            errors.satScore = 'SAT score must be between 400 and 1600';
        }
    }

    // Validate SAT Math if provided
    if (data.satMath !== undefined && data.satMath !== null) {
        if (data.satMath < 200 || data.satMath > 800) {
            errors.satMath = 'SAT Math score must be between 200 and 800';
        }
    }

    // Validate SAT Reading if provided
    if (data.satReading !== undefined && data.satReading !== null) {
        if (data.satReading < 200 || data.satReading > 800) {
            errors.satReading = 'SAT Reading score must be between 200 and 800';
        }
    }

    // Validate ACT score if provided
    if (data.actScore !== undefined && data.actScore !== null) {
        if (data.actScore < 1 || data.actScore > 36) {
            errors.actScore = 'ACT score must be between 1 and 36';
        }
    }

    return errors;
};

/**
 * Validates VideosSection data
 * Validates URL format for each video and required title for each video
 */
export const validateVideosSection = (data: {
    videos: Array<{
        id: string;
        title: string;
        url: string;
        description?: string;
        thumbnail?: string;
        duration?: string;
        isFeatured?: boolean;
        date?: string;
    }>;
}): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.videos || data.videos.length === 0) {
        return errors;
    }

    data.videos.forEach((video, index) => {
        // Validate required title
        if (!validateRequired(video.title)) {
            errors[`video-${index}-title`] = 'Video title is required';
        }

        // Validate required URL
        if (!validateRequired(video.url)) {
            errors[`video-${index}-url`] = 'Video URL is required';
        } else if (!validateURL(video.url)) {
            // Validate URL format if URL is provided
            errors[`video-${index}-url`] = getURLError();
        }

        // Validate thumbnail URL format if provided
        if (video.thumbnail && !validateURL(video.thumbnail)) {
            errors[`video-${index}-thumbnail`] = getURLError();
        }
    });

    return errors;
};

/**
 * Validates ContactSection data
 * Validates email format, phone format, and URL format for social media links
 */
export const validateContactSection = (data: {
    email: string;
    phone: string;
    parentGuardianName?: string;
    parentGuardianPhone?: string;
    parentGuardianEmail?: string;
    socialMedia: {
        twitter?: string;
        instagram?: string;
        youtube?: string;
        tiktok?: string;
    };
    preferredContactMethod: string;
}): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Validate required email
    if (!validateRequired(data.email)) {
        errors.email = getRequiredFieldError();
    } else if (!validateEmail(data.email)) {
        errors.email = getEmailError();
    }

    // Validate required phone
    if (!validateRequired(data.phone)) {
        errors.phone = getRequiredFieldError();
    } else if (!validatePhone(data.phone)) {
        errors.phone = getPhoneError();
    }

    // Validate parent/guardian email if provided
    if (data.parentGuardianEmail && !validateEmail(data.parentGuardianEmail)) {
        errors.parentGuardianEmail = getEmailError();
    }

    // Validate parent/guardian phone if provided
    if (data.parentGuardianPhone && !validatePhone(data.parentGuardianPhone)) {
        errors.parentGuardianPhone = getPhoneError();
    }

    // Validate social media URLs
    if (data.socialMedia) {
        if (data.socialMedia.twitter && !validateURL(data.socialMedia.twitter)) {
            errors['socialMedia.twitter'] = getURLError();
        }
        if (data.socialMedia.instagram && !validateURL(data.socialMedia.instagram)) {
            errors['socialMedia.instagram'] = getURLError();
        }
        if (data.socialMedia.youtube && !validateURL(data.socialMedia.youtube)) {
            errors['socialMedia.youtube'] = getURLError();
        }
        if (data.socialMedia.tiktok && !validateURL(data.socialMedia.tiktok)) {
            errors['socialMedia.tiktok'] = getURLError();
        }
    }

    return errors;
};

// Re-export common validation utilities
export { validateRequired, validateEmail, getRequiredFieldError, getEmailError, getGPAError };
