/**
 * Tests for registration validation utilities
 */

import {
    normalizeEmail,
    validatePlayerRegistration,
    ValidationResult,
    PlayerRegistrationData,
} from '@/authentication/utils/registerValidation';

describe('normalizeEmail', () => {
    it('should convert email to lowercase', () => {
        expect(normalizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
        expect(normalizeEmail('Test@Example.Com')).toBe('test@example.com');
    });

    it('should trim whitespace from email', () => {
        expect(normalizeEmail('  test@example.com  ')).toBe('test@example.com');
        expect(normalizeEmail('\ttest@example.com\n')).toBe('test@example.com');
    });

    it('should handle email with both uppercase and whitespace', () => {
        expect(normalizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com');
    });

    it('should handle already normalized email', () => {
        expect(normalizeEmail('test@example.com')).toBe('test@example.com');
    });
});

describe('validatePlayerRegistration', () => {
    const validPlayerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        sex: 'male',
        sport: 'basketball',
        position: 'Guard',
        gpa: 3.5,
        country: 'USA',
        state: 'California',
    };

    describe('successful validation', () => {
        it('should validate complete valid player data with USA address', () => {
            const result = validatePlayerRegistration(validPlayerData);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate complete valid player data with non-USA address', () => {
            const nonUSAData = {
                ...validPlayerData,
                country: 'Canada',
                state: undefined,
                region: 'Ontario',
            };
            const result = validatePlayerRegistration(nonUSAData);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate with optional fields included', () => {
            const dataWithOptionals = {
                ...validPlayerData,
                scholarshipAmount: 50000,
                testScores: 'SAT: 1400, ACT: 32',
            };
            const result = validatePlayerRegistration(dataWithOptionals);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate with female sex', () => {
            const femaleData = {
                ...validPlayerData,
                sex: 'female',
            };
            const result = validatePlayerRegistration(femaleData);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('firstName validation', () => {
        it('should fail when firstName is missing', () => {
            const data = { ...validPlayerData, firstName: '' };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'firstName',
                message: 'First name is required',
            });
        });

        it('should fail when firstName is too short', () => {
            const data = { ...validPlayerData, firstName: 'J' };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'firstName',
                message: 'First name must be between 2 and 50 characters',
            });
        });

        it('should fail when firstName is too long', () => {
            const data = { ...validPlayerData, firstName: 'A'.repeat(51) };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'firstName',
                message: 'First name must be between 2 and 50 characters',
            });
        });
    });

    describe('lastName validation', () => {
        it('should fail when lastName is missing', () => {
            const data = { ...validPlayerData, lastName: '' };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'lastName',
                message: 'Last name is required',
            });
        });

        it('should fail when lastName is too short', () => {
            const data = { ...validPlayerData, lastName: 'D' };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'lastName',
                message: 'Last name must be between 2 and 50 characters',
            });
        });

        it('should fail when lastName is too long', () => {
            const data = { ...validPlayerData, lastName: 'A'.repeat(51) };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'lastName',
                message: 'Last name must be between 2 and 50 characters',
            });
        });
    });

    describe('email validation', () => {
        it('should fail when email is missing', () => {
            const data = { ...validPlayerData, email: '' };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'email',
                message: 'Email is required',
            });
        });

        it('should fail when email format is invalid', () => {
            const data = { ...validPlayerData, email: 'invalid-email' };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'email',
                message: 'Please enter a valid email address',
            });
        });

        it('should accept valid email formats', () => {
            const validEmails = [
                'test@example.com',
                'user.name@example.co.uk',
                'user+tag@example.com',
                'user_name@example.com',
            ];

            validEmails.forEach((email) => {
                const data = { ...validPlayerData, email };
                const result = validatePlayerRegistration(data);
                expect(result.isValid).toBe(true);
            });
        });
    });

    describe('password validation', () => {
        it('should fail when password is missing', () => {
            const data = { ...validPlayerData, password: '' };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'password',
                message: 'Password is required',
            });
        });

        it('should fail when password is too short', () => {
            const data = { ...validPlayerData, password: 'Pass1!' };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'password',
                message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
            });
        });

        it('should fail when password lacks uppercase', () => {
            const data = { ...validPlayerData, password: 'password123!' };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'password',
                message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
            });
        });

        it('should fail when password lacks lowercase', () => {
            const data = { ...validPlayerData, password: 'PASSWORD123!' };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'password',
                message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
            });
        });

        it('should fail when password lacks number', () => {
            const data = { ...validPlayerData, password: 'Password!' };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'password',
                message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
            });
        });

        it('should fail when password lacks special character', () => {
            const data = { ...validPlayerData, password: 'Password123' };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'password',
                message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character',
            });
        });
    });

    describe('sex validation', () => {
        it('should fail when sex is missing', () => {
            const data = { ...validPlayerData, sex: '' };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'sex',
                message: 'Sex is required',
            });
        });

        it('should fail when sex is invalid', () => {
            const data = { ...validPlayerData, sex: 'other' };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'sex',
                message: 'Sex must be either "male" or "female"',
            });
        });

        it('should accept case-insensitive sex values', () => {
            const validSexValues = ['male', 'Male', 'MALE', 'female', 'Female', 'FEMALE'];

            validSexValues.forEach((sex) => {
                const data = { ...validPlayerData, sex };
                const result = validatePlayerRegistration(data);
                expect(result.isValid).toBe(true);
            });
        });
    });

    describe('sport validation', () => {
        it('should fail when sport is missing', () => {
            const data = { ...validPlayerData, sport: '' };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'sport',
                message: 'Sport is required',
            });
        });

        it('should accept any non-empty sport value', () => {
            const sports = ['basketball', 'football', 'soccer', 'tennis'];

            sports.forEach((sport) => {
                const data = { ...validPlayerData, sport };
                const result = validatePlayerRegistration(data);
                expect(result.isValid).toBe(true);
            });
        });
    });

    describe('position validation', () => {
        it('should fail when position is missing', () => {
            const data = { ...validPlayerData, position: '' };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'position',
                message: 'Position is required',
            });
        });

        it('should fail when position is too short', () => {
            const data = { ...validPlayerData, position: 'G' };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'position',
                message: 'Position must be at least 2 characters',
            });
        });
    });

    describe('GPA validation', () => {
        it('should fail when GPA is missing', () => {
            const data = { ...validPlayerData, gpa: undefined };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'gpa',
                message: 'GPA is required',
            });
        });

        it('should fail when GPA is null', () => {
            const data = { ...validPlayerData, gpa: null as any };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'gpa',
                message: 'GPA is required',
            });
        });

        it('should fail when GPA is empty string', () => {
            const data = { ...validPlayerData, gpa: '' as any };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'gpa',
                message: 'GPA is required',
            });
        });

        it('should fail when GPA is below 0.0', () => {
            const data = { ...validPlayerData, gpa: -0.1 };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'gpa',
                message: 'GPA must be between 0.0 and 4.0',
            });
        });

        it('should fail when GPA is above 4.0', () => {
            const data = { ...validPlayerData, gpa: 4.1 };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'gpa',
                message: 'GPA must be between 0.0 and 4.0',
            });
        });

        it('should accept valid GPA values', () => {
            const validGPAs = [0.0, 2.5, 3.5, 4.0];

            validGPAs.forEach((gpa) => {
                const data = { ...validPlayerData, gpa };
                const result = validatePlayerRegistration(data);
                expect(result.isValid).toBe(true);
            });
        });
    });

    describe('country validation', () => {
        it('should fail when country is missing', () => {
            const data = { ...validPlayerData, country: '' };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'country',
                message: 'Country is required',
            });
        });
    });

    describe('conditional field validation - state/region', () => {
        it('should require state when country is USA', () => {
            const data = {
                ...validPlayerData,
                country: 'USA',
                state: '',
                region: undefined,
            };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'state',
                message: 'State is required when country is USA',
            });
        });

        it('should require state when country is usa (lowercase)', () => {
            const data = {
                ...validPlayerData,
                country: 'usa',
                state: '',
                region: undefined,
            };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'state',
                message: 'State is required when country is USA',
            });
        });

        it('should require region when country is not USA', () => {
            const data = {
                ...validPlayerData,
                country: 'Canada',
                state: undefined,
                region: '',
            };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'region',
                message: 'Region is required when country is not USA',
            });
        });

        it('should accept state for USA and ignore region', () => {
            const data = {
                ...validPlayerData,
                country: 'USA',
                state: 'California',
                region: undefined,
            };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should accept region for non-USA and ignore state', () => {
            const data = {
                ...validPlayerData,
                country: 'Canada',
                state: undefined,
                region: 'Ontario',
            };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('optional field validation - scholarshipAmount', () => {
        it('should accept missing scholarshipAmount', () => {
            const data = {
                ...validPlayerData,
                scholarshipAmount: undefined,
            };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should accept valid scholarshipAmount', () => {
            const data = {
                ...validPlayerData,
                scholarshipAmount: 50000,
            };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail when scholarshipAmount is negative', () => {
            const data = {
                ...validPlayerData,
                scholarshipAmount: -1000,
            };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'scholarshipAmount',
                message: 'Scholarship amount must be a positive number',
            });
        });

        it('should fail when scholarshipAmount is not a number', () => {
            const data = {
                ...validPlayerData,
                scholarshipAmount: 'invalid' as any,
            };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'scholarshipAmount',
                message: 'Scholarship amount must be a positive number',
            });
        });

        it('should accept zero scholarshipAmount', () => {
            const data = {
                ...validPlayerData,
                scholarshipAmount: 0,
            };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('optional field validation - testScores', () => {
        it('should accept missing testScores', () => {
            const data = {
                ...validPlayerData,
                testScores: undefined,
            };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should accept any string testScores', () => {
            const data = {
                ...validPlayerData,
                testScores: 'SAT: 1400, ACT: 32',
            };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('multiple validation errors', () => {
        it('should return all validation errors', () => {
            const data = {
                firstName: '',
                lastName: 'D',
                email: 'invalid',
                password: 'weak',
                sex: 'other',
                sport: '',
                position: 'G',
                gpa: 5.0,
                country: '',
            };
            const result = validatePlayerRegistration(data);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(5);
        });
    });
});
