/**
 * Validation utilities for authentication and registration forms
 */

/**
 * Validates if a field has a value (not empty, null, or undefined)
 */
export const validateRequired = (value: string | undefined | null): boolean => {
    return value !== undefined && value !== null && value.trim().length > 0;
};

/**
 * Validates if an email address is properly formatted
 */
export const validateEmail = (email: string): boolean => {
    if (!validateRequired(email)) {
        return false;
    }

    // RFC 5322 compliant email regex (simplified but robust)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

/**
 * Validates if an email address ends with .edu domain
 */
export const validateEduEmail = (email: string): boolean => {
    if (!validateEmail(email)) {
        return false;
    }

    return email.trim().toLowerCase().endsWith('.edu');
};

/**
 * Validates password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const validatePassword = (password: string): boolean => {
    if (!validateRequired(password)) {
        return false;
    }

    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    return (
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar
    );
};

/**
 * Validates GPA is within valid range (0.0 to 4.0)
 */
export const validateGPA = (gpa: string | number): boolean => {
    const gpaNumber = typeof gpa === 'string' ? parseFloat(gpa) : gpa;

    if (isNaN(gpaNumber)) {
        return false;
    }

    return gpaNumber >= 0.0 && gpaNumber <= 4.0;
};

/**
 * Gets a user-friendly error message for required field validation
 */
export const getRequiredFieldError = (): string => {
    return 'This field is required';
};

/**
 * Gets a user-friendly error message for email validation
 */
export const getEmailError = (): string => {
    return 'Please enter a valid email address';
};

/**
 * Gets a user-friendly error message for .edu email validation
 */
export const getEduEmailError = (): string => {
    return 'Please enter a valid .edu email address';
};

/**
 * Gets a user-friendly error message for password validation
 */
export const getPasswordError = (): string => {
    return 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character';
};

/**
 * Gets a user-friendly error message for GPA validation
 */
export const getGPAError = (): string => {
    return 'GPA must be between 0.0 and 4.0';
};
