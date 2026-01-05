import {
    validateRequired,
    validateEmail,
    validateEduEmail,
    validatePassword,
    validateGPA,
    getRequiredFieldError,
    getEmailError,
    getEduEmailError,
    getPasswordError,
    getGPAError,
} from '@/authentication/utils/validation';

describe('Validation Utilities', () => {
    describe('validateRequired', () => {
        it('should return true for non-empty strings', () => {
            expect(validateRequired('test')).toBe(true);
            expect(validateRequired('a')).toBe(true);
            expect(validateRequired('  text  ')).toBe(true);
        });

        it('should return false for empty strings', () => {
            expect(validateRequired('')).toBe(false);
            expect(validateRequired('   ')).toBe(false);
        });

        it('should return false for null or undefined', () => {
            expect(validateRequired(null)).toBe(false);
            expect(validateRequired(undefined)).toBe(false);
        });
    });

    describe('validateEmail', () => {
        it('should return true for valid email addresses', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('user.name@domain.co.uk')).toBe(true);
            expect(validateEmail('first+last@test.org')).toBe(true);
            expect(validateEmail('email@subdomain.example.com')).toBe(true);
        });

        it('should return false for invalid email addresses', () => {
            expect(validateEmail('notanemail')).toBe(false);
            expect(validateEmail('@example.com')).toBe(false);
            expect(validateEmail('user@')).toBe(false);
            expect(validateEmail('user@domain')).toBe(false);
            expect(validateEmail('user name@example.com')).toBe(false);
            expect(validateEmail('')).toBe(false);
        });

        it('should handle emails with whitespace', () => {
            expect(validateEmail('  test@example.com  ')).toBe(true);
            expect(validateEmail('test @example.com')).toBe(false);
        });
    });

    describe('validateEduEmail', () => {
        it('should return true for valid .edu email addresses', () => {
            expect(validateEduEmail('student@university.edu')).toBe(true);
            expect(validateEduEmail('professor@college.edu')).toBe(true);
            expect(validateEduEmail('admin@school.EDU')).toBe(true);
        });

        it('should return false for non-.edu email addresses', () => {
            expect(validateEduEmail('user@example.com')).toBe(false);
            expect(validateEduEmail('student@university.org')).toBe(false);
            expect(validateEduEmail('test@school.edu.fake.com')).toBe(false);
        });

        it('should return false for invalid email formats', () => {
            expect(validateEduEmail('notanemail.edu')).toBe(false);
            expect(validateEduEmail('@university.edu')).toBe(false);
            expect(validateEduEmail('')).toBe(false);
        });

        it('should handle case insensitivity for .edu domain', () => {
            expect(validateEduEmail('test@UNIVERSITY.EDU')).toBe(true);
            expect(validateEduEmail('test@University.Edu')).toBe(true);
        });
    });

    describe('validatePassword', () => {
        it('should return true for valid passwords', () => {
            expect(validatePassword('Password1!')).toBe(true);
            expect(validatePassword('Str0ng@Pass')).toBe(true);
            expect(validatePassword('MyP@ssw0rd')).toBe(true);
            expect(validatePassword('C0mpl3x#Pass')).toBe(true);
        });

        it('should return false for passwords without uppercase', () => {
            expect(validatePassword('password1!')).toBe(false);
        });

        it('should return false for passwords without lowercase', () => {
            expect(validatePassword('PASSWORD1!')).toBe(false);
        });

        it('should return false for passwords without numbers', () => {
            expect(validatePassword('Password!')).toBe(false);
        });

        it('should return false for passwords without special characters', () => {
            expect(validatePassword('Password1')).toBe(false);
        });

        it('should return false for passwords shorter than 8 characters', () => {
            expect(validatePassword('Pass1!')).toBe(false);
            expect(validatePassword('Pw1!')).toBe(false);
        });

        it('should return false for empty passwords', () => {
            expect(validatePassword('')).toBe(false);
        });

        it('should accept various special characters', () => {
            expect(validatePassword('Password1!')).toBe(true);
            expect(validatePassword('Password1@')).toBe(true);
            expect(validatePassword('Password1#')).toBe(true);
            expect(validatePassword('Password1$')).toBe(true);
            expect(validatePassword('Password1%')).toBe(true);
            expect(validatePassword('Password1^')).toBe(true);
            expect(validatePassword('Password1&')).toBe(true);
            expect(validatePassword('Password1*')).toBe(true);
        });
    });

    describe('validateGPA', () => {
        it('should return true for valid GPA values as numbers', () => {
            expect(validateGPA(0.0)).toBe(true);
            expect(validateGPA(2.5)).toBe(true);
            expect(validateGPA(3.7)).toBe(true);
            expect(validateGPA(4.0)).toBe(true);
        });

        it('should return true for valid GPA values as strings', () => {
            expect(validateGPA('0.0')).toBe(true);
            expect(validateGPA('2.5')).toBe(true);
            expect(validateGPA('3.7')).toBe(true);
            expect(validateGPA('4.0')).toBe(true);
        });

        it('should return false for GPA values below 0.0', () => {
            expect(validateGPA(-0.1)).toBe(false);
            expect(validateGPA(-1.0)).toBe(false);
            expect(validateGPA('-0.5')).toBe(false);
        });

        it('should return false for GPA values above 4.0', () => {
            expect(validateGPA(4.1)).toBe(false);
            expect(validateGPA(5.0)).toBe(false);
            expect(validateGPA('4.5')).toBe(false);
        });

        it('should return false for non-numeric strings', () => {
            expect(validateGPA('abc')).toBe(false);
            expect(validateGPA('not a number')).toBe(false);
            expect(validateGPA('')).toBe(false);
        });

        it('should handle edge cases', () => {
            expect(validateGPA(0)).toBe(true);
            expect(validateGPA(4)).toBe(true);
            expect(validateGPA('0')).toBe(true);
            expect(validateGPA('4')).toBe(true);
        });
    });

    describe('Error message functions', () => {
        it('should return correct error message for required fields', () => {
            expect(getRequiredFieldError()).toBe('This field is required');
        });

        it('should return correct error message for email validation', () => {
            expect(getEmailError()).toBe('Please enter a valid email address');
        });

        it('should return correct error message for .edu email validation', () => {
            expect(getEduEmailError()).toBe('Please enter a valid .edu email address');
        });

        it('should return correct error message for password validation', () => {
            expect(getPasswordError()).toBe(
                'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
            );
        });

        it('should return correct error message for GPA validation', () => {
            expect(getGPAError()).toBe('GPA must be between 0.0 and 4.0');
        });
    });
});
