/**
 * Registration validation utilities for player registration API
 */

import { validateEmail, validatePassword, validateGPA, validateRequired } from './validation';

/**
 * Validation error for a specific field
 */
export interface ValidationError {
    field: string;
    message: string;
}

/**
 * Validation result containing validity status and errors
 */
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

/**
 * Player registration data structure
 */
export interface PlayerRegistrationData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    sex: string;
    sport: string;
    position: string;
    gpa: number;
    country: string;
    state?: string;
    region?: string;
    scholarshipAmount?: number;
    testScores?: string;
}

/**
 * Normalizes an email address by converting to lowercase and trimming whitespace
 * @param email - The email address to normalize
 * @returns The normalized email address
 */
export function normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
}

/**
 * Validates player registration data
 * @param data - The registration data to validate
 * @returns ValidationResult with isValid flag and array of errors
 */
export function validatePlayerRegistration(data: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Validate firstName
    if (!validateRequired(data.firstName)) {
        errors.push({
            field: 'firstName',
            message: 'First name is required',
        });
    } else if (data.firstName.trim().length < 2 || data.firstName.trim().length > 50) {
        errors.push({
            field: 'firstName',
            message: 'First name must be between 2 and 50 characters',
        });
    }

    // Validate lastName
    if (!validateRequired(data.lastName)) {
        errors.push({
            field: 'lastName',
            message: 'Last name is required',
        });
    } else if (data.lastName.trim().length < 2 || data.lastName.trim().length > 50) {
        errors.push({
            field: 'lastName',
            message: 'Last name must be between 2 and 50 characters',
        });
    }

    // Validate email
    if (!validateRequired(data.email)) {
        errors.push({
            field: 'email',
            message: 'Email is required',
        });
    } else if (!validateEmail(data.email)) {
        errors.push({
            field: 'email',
            message: 'Please enter a valid email address',
        });
    }

    // Validate password
    if (!validateRequired(data.password)) {
        errors.push({
            field: 'password',
            message: 'Password is required',
        });
    } else if (!validatePassword(data.password)) {
        errors.push({
            field: 'password',
            message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
        });
    }

    // Validate sex
    if (!validateRequired(data.sex)) {
        errors.push({
            field: 'sex',
            message: 'Sex is required',
        });
    } else if (!['male', 'female'].includes(data.sex.toLowerCase())) {
        errors.push({
            field: 'sex',
            message: 'Sex must be either "male" or "female"',
        });
    }

    // Validate sport
    if (!validateRequired(data.sport)) {
        errors.push({
            field: 'sport',
            message: 'Sport is required',
        });
    }

    // Validate position
    if (!validateRequired(data.position)) {
        errors.push({
            field: 'position',
            message: 'Position is required',
        });
    } else if (data.position.trim().length < 2) {
        errors.push({
            field: 'position',
            message: 'Position must be at least 2 characters',
        });
    }

    // Validate GPA
    if (data.gpa === undefined || data.gpa === null || data.gpa === '') {
        errors.push({
            field: 'gpa',
            message: 'GPA is required',
        });
    } else if (!validateGPA(data.gpa)) {
        errors.push({
            field: 'gpa',
            message: 'GPA must be between 0.0 and 4.0',
        });
    }

    // Validate country
    if (!validateRequired(data.country)) {
        errors.push({
            field: 'country',
            message: 'Country is required',
        });
    }

    // Validate conditional fields: state (required if country is USA)
    if (data.country && data.country.toUpperCase() === 'USA') {
        if (!validateRequired(data.state)) {
            errors.push({
                field: 'state',
                message: 'State is required when country is USA',
            });
        }
    }

    // Validate conditional fields: region (required if country is not USA)
    if (data.country && data.country.toUpperCase() !== 'USA') {
        if (!validateRequired(data.region)) {
            errors.push({
                field: 'region',
                message: 'Region is required when country is not USA',
            });
        }
    }

    // Validate optional scholarshipAmount (if provided)
    if (data.scholarshipAmount !== undefined && data.scholarshipAmount !== null && data.scholarshipAmount !== '') {
        const amount = typeof data.scholarshipAmount === 'string'
            ? parseFloat(data.scholarshipAmount)
            : data.scholarshipAmount;

        if (isNaN(amount) || amount < 0) {
            errors.push({
                field: 'scholarshipAmount',
                message: 'Scholarship amount must be a positive number',
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
