/**
 * Tests for registration validation utilities
 */

import {
    validatePlayerRegistration,
    normalizeEmail,
    type ValidationResult,
    type PlayerRegistrationData
} from '@/authentication/utils/registerValidation';
import {
    generatePlayerRegistration,
    generateDateOfBirth
} from '@/__tests__/utils/test-data-generators';

describe('registerValidation', () => {
    describe('normalizeEmail', () => {
        it('should convert email to lowercase', () => {
            expect(normalizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
            expect(normalizeEmail('Test@Example.Com')).toBe('test@example.com');
        });

        it('should trim whitespace from email', () => {
            expect(normalizeEmail('  test@example.com  ')).toBe('test@example.com');
            expect(normalizeEmail('\ttest@example.com\n')).toBe('test@example.com');
        });

        it('should handle both lowercase and trim together', () => {
            expect(normalizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com');
        });
    });

    describe('validatePlayerRegistration', () => {
        describe('valid registration data', () => {
            it('should validate complete registration data with all required fields', () => {
                const data = generatePlayerRegistration();
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(true);
                expect(result.errors).toHaveLength(0);
            });

            it('should validate registration with USA country and state', () => {
                const data = generatePlayerRegistration({
                    country: 'USA',
                    state: 'California'
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(true);
                expect(result.errors).toHaveLength(0);
            });

            it('should validate registration with non-USA country and region', () => {
                const data = generatePlayerRegistration({
                    country: 'Canada',
                    region: 'Ontario',
                    state: undefined
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(true);
                expect(result.errors).toHaveLength(0);
            });

            it('should validate registration with optional scholarship amount', () => {
                const data = generatePlayerRegistration({
                    scholarshipAmount: 50000
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(true);
                expect(result.errors).toHaveLength(0);
            });

            it('should validate registration with optional test scores', () => {
                const data = generatePlayerRegistration({
                    testScores: 'SAT: 1400, ACT: 32'
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(true);
                expect(result.errors).toHaveLength(0);
            });
        });

        describe('firstName validation', () => {
            it('should reject missing firstName', () => {
                const data = generatePlayerRegistration({ firstName: '' });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'firstName',
                    message: 'First name is required'
                });
            });

            it('should reject firstName shorter than 2 characters', () => {
                const data = generatePlayerRegistration({ firstName: 'A' });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'firstName',
                    message: 'First name must be between 2 and 50 characters'
                });
            });

            it('should reject firstName longer than 50 characters', () => {
                const data = generatePlayerRegistration({
                    firstName: 'A'.repeat(51)
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'firstName',
                    message: 'First name must be between 2 and 50 characters'
                });
            });

            it('should accept firstName with exactly 2 characters', () => {
                const data = generatePlayerRegistration({ firstName: 'Jo' });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(true);
            });

            it('should accept firstName with exactly 50 characters', () => {
                const data = generatePlayerRegistration({
                    firstName: 'A'.repeat(50)
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(true);
            });
        });

        describe('lastName validation', () => {
            it('should reject missing lastName', () => {
                const data = generatePlayerRegistration({ lastName: '' });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'lastName',
                    message: 'Last name is required'
                });
            });

            it('should reject lastName shorter than 2 characters', () => {
                const data = generatePlayerRegistration({ lastName: 'B' });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'lastName',
                    message: 'Last name must be between 2 and 50 characters'
                });
            });

            it('should reject lastName longer than 50 characters', () => {
                const data = generatePlayerRegistration({
                    lastName: 'B'.repeat(51)
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'lastName',
                    message: 'Last name must be between 2 and 50 characters'
                });
            });
        });

        describe('dateOfBirth validation', () => {
            it('should reject missing dateOfBirth', () => {
                const data = generatePlayerRegistration({ dateOfBirth: '' });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'dateOfBirth',
                    message: 'Date of birth is required'
                });
            });

            it('should reject invalid date format', () => {
                const data = generatePlayerRegistration({
                    dateOfBirth: 'invalid-date'
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'dateOfBirth',
                    message: 'Invalid date format'
                });
            });

            it('should reject age younger than 13 years old', () => {
                const data = generatePlayerRegistration({
                    dateOfBirth: generateDateOfBirth(12)
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'dateOfBirth',
                    message: 'You must be at least 13 years old to register'
                });
            });

            it('should accept age exactly 13 years old', () => {
                // Create a date that is exactly 13 years ago minus 1 day to ensure they're over 13
                const today = new Date();
                const thirteenYearsAgo = new Date(
                    today.getFullYear() - 13,
                    today.getMonth(),
                    today.getDate() - 1
                );
                const dateOfBirth = thirteenYearsAgo.toISOString().split('T')[0];

                const data = generatePlayerRegistration({ dateOfBirth });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(true);
            });

            it('should accept age 14 years old', () => {
                const data = generatePlayerRegistration({
                    dateOfBirth: generateDateOfBirth(14)
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(true);
            });

            it('should accept age 18 years old', () => {
                const data = generatePlayerRegistration({
                    dateOfBirth: generateDateOfBirth(18)
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(true);
            });

            it('should accept age 22 years old', () => {
                const data = generatePlayerRegistration({
                    dateOfBirth: generateDateOfBirth(22)
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(true);
            });

            it('should reject date in the future', () => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const futureDate = tomorrow.toISOString().split('T')[0];

                const data = generatePlayerRegistration({
                    dateOfBirth: futureDate
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'dateOfBirth',
                    message: 'Date of birth cannot be in the future'
                });
            });

            it('should reject date more than 100 years ago', () => {
                const data = generatePlayerRegistration({
                    dateOfBirth: generateDateOfBirth(101)
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'dateOfBirth',
                    message: 'Please enter a valid date of birth'
                });
            });
        });

        describe('email validation', () => {
            it('should reject missing email', () => {
                const data = generatePlayerRegistration({ email: '' });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'email',
                    message: 'Email is required'
                });
            });

            it('should reject invalid email format - missing @', () => {
                const data = generatePlayerRegistration({
                    email: 'invalidemail.com'
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'email',
                    message: 'Please enter a valid email address'
                });
            });

            it('should reject invalid email format - missing domain', () => {
                const data = generatePlayerRegistration({ email: 'test@' });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'email',
                    message: 'Please enter a valid email address'
                });
            });

            it('should reject invalid email format - missing local part', () => {
                const data = generatePlayerRegistration({
                    email: '@example.com'
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'email',
                    message: 'Please enter a valid email address'
                });
            });

            it('should accept valid email formats', () => {
                const validEmails = [
                    'test@example.com',
                    'user.name@example.com',
                    'user+tag@example.co.uk',
                    'test123@test-domain.com'
                ];

                validEmails.forEach(email => {
                    const data = generatePlayerRegistration({ email });
                    const result = validatePlayerRegistration(data);
                    expect(result.isValid).toBe(true);
                });
            });
        });

        describe('password validation', () => {
            it('should reject missing password', () => {
                const data = generatePlayerRegistration({ password: '' });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'password',
                    message: 'Password is required'
                });
            });

            it('should reject password shorter than 8 characters', () => {
                const data = generatePlayerRegistration({ password: 'Pass1!' });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'password',
                    message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
                });
            });

            it('should reject password without uppercase letter', () => {
                const data = generatePlayerRegistration({
                    password: 'password123!'
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'password',
                    message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
                });
            });

            it('should reject password without lowercase letter', () => {
                const data = generatePlayerRegistration({
                    password: 'PASSWORD123!'
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'password',
                    message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
                });
            });

            it('should reject password without number', () => {
                const data = generatePlayerRegistration({
                    password: 'Password!'
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'password',
                    message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
                });
            });

            it('should reject password without special character', () => {
                const data = generatePlayerRegistration({
                    password: 'Password123'
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'password',
                    message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
                });
            });

            it('should accept password with all requirements', () => {
                const validPasswords = [
                    'SecurePass123!',
                    'MyP@ssw0rd',
                    'Test#1234Pass',
                    'Abcd1234!@#$'
                ];

                validPasswords.forEach(password => {
                    const data = generatePlayerRegistration({ password });
                    const result = validatePlayerRegistration(data);
                    expect(result.isValid).toBe(true);
                });
            });
        });

        describe('sex validation', () => {
            it('should reject missing sex', () => {
                const data = generatePlayerRegistration({ sex: '' });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'sex',
                    message: 'Sex is required'
                });
            });

            it('should reject invalid sex value', () => {
                const data = generatePlayerRegistration({ sex: 'other' });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'sex',
                    message: 'Sex must be either "male" or "female"'
                });
            });

            it('should accept "male" (lowercase)', () => {
                const data = generatePlayerRegistration({ sex: 'male' });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(true);
            });

            it('should accept "female" (lowercase)', () => {
                const data = generatePlayerRegistration({ sex: 'female' });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(true);
            });

            it('should accept "Male" (capitalized)', () => {
                const data = generatePlayerRegistration({ sex: 'Male' });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(true);
            });

            it('should accept "FEMALE" (uppercase)', () => {
                const data = generatePlayerRegistration({ sex: 'FEMALE' });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(true);
            });
        });

        describe('sport validation', () => {
            it('should reject missing sport', () => {
                const data = generatePlayerRegistration({ sport: '' });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'sport',
                    message: 'Sport is required'
                });
            });

            it('should accept any non-empty sport value', () => {
                const sports = ['basketball', 'football', 'soccer', 'baseball'];

                sports.forEach(sport => {
                    const data = generatePlayerRegistration({ sport });
                    const result = validatePlayerRegistration(data);
                    expect(result.isValid).toBe(true);
                });
            });
        });

        describe('position validation', () => {
            it('should accept missing position (position is optional)', () => {
                const data = generatePlayerRegistration({ position: '' });
                const result = validatePlayerRegistration(data);
                expect(result.isValid).toBe(true);
                expect(result.errors.some((e) => e.field === 'position')).toBe(false);
            });

            it('should reject position shorter than 2 characters', () => {
                const data = generatePlayerRegistration({ position: 'G' });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'position',
                    message: 'Position must be at least 2 characters'
                });
            });

            it('should accept valid canonical positions for the selected sport', () => {
                // Basketball (the default sport in generatePlayerRegistration) canonical positions
                const positions = ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'];

                positions.forEach(position => {
                    const data = generatePlayerRegistration({ position });
                    const result = validatePlayerRegistration(data);
                    expect(result.isValid).toBe(true);
                });
            });

            it('should accept Soccer with a valid canonical position (Goalkeeper)', () => {
                const data = generatePlayerRegistration({ sport: 'Soccer', position: 'Goalkeeper' });
                const result = validatePlayerRegistration(data);
                expect(result.isValid).toBe(true);
                expect(result.errors.some((e) => e.field === 'position')).toBe(false);
            });

            it('should reject a position that is not in the canonical list for the selected sport', () => {
                const data = generatePlayerRegistration({ sport: 'Soccer', position: 'randomtext' });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'position',
                    message: 'Invalid position for the selected sport',
                });
            });

            it('should accept any non-empty position for a sport with no defined positions', () => {
                // Cross Country has no positions, only events — free-text fallback applies
                const data = generatePlayerRegistration({ sport: 'Cross Country', position: 'Distance Runner' });
                const result = validatePlayerRegistration(data);
                expect(result.isValid).toBe(true);
            });
        });

        describe('event validation', () => {
            it('should accept missing event (event is optional)', () => {
                const data = generatePlayerRegistration({ sport: 'Cross Country', position: '', event: '' } as any);
                const result = validatePlayerRegistration(data);
                expect(result.isValid).toBe(true);
                expect(result.errors.some((e) => e.field === 'event')).toBe(false);
            });

            it('should reject event shorter than 2 characters', () => {
                const data = generatePlayerRegistration({ sport: 'Cross Country', position: '', event: 'X' } as any);
                const result = validatePlayerRegistration(data);
                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'event',
                    message: 'Event must be at least 2 characters',
                });
            });

            it('should accept a valid canonical event for the selected sport', () => {
                const data = generatePlayerRegistration({ sport: 'Cross Country', position: '', event: '5K' } as any);
                const result = validatePlayerRegistration(data);
                expect(result.isValid).toBe(true);
            });

            it('should reject an event not in the canonical list for the selected sport', () => {
                const data = generatePlayerRegistration({ sport: 'Cross Country', position: '', event: 'Marathon' } as any);
                const result = validatePlayerRegistration(data);
                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'event',
                    message: 'Invalid event for the selected sport',
                });
            });

            it('should accept "Other" as a valid event', () => {
                const data = generatePlayerRegistration({ sport: 'Cross Country', position: '', event: 'Other' } as any);
                const result = validatePlayerRegistration(data);
                expect(result.isValid).toBe(true);
            });
        });

        describe('GPA validation', () => {
            it('should reject missing GPA', () => {
                const data = generatePlayerRegistration({ gpa: undefined as any });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'gpa',
                    message: 'GPA is required'
                });
            });

            it('should reject null GPA', () => {
                const data = generatePlayerRegistration({ gpa: null as any });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'gpa',
                    message: 'GPA is required'
                });
            });

            it('should reject empty string GPA', () => {
                const data = generatePlayerRegistration({ gpa: '' as any });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'gpa',
                    message: 'GPA is required'
                });
            });

            it('should reject GPA below 0.0', () => {
                const data = generatePlayerRegistration({ gpa: -0.1 });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'gpa',
                    message: 'GPA must be between 0.0 and 4.0'
                });
            });

            it('should reject GPA above 4.0', () => {
                const data = generatePlayerRegistration({ gpa: 4.1 });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'gpa',
                    message: 'GPA must be between 0.0 and 4.0'
                });
            });

            it('should accept GPA of 0.0', () => {
                const data = generatePlayerRegistration({ gpa: 0.0 });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(true);
            });

            it('should accept GPA of 4.0', () => {
                const data = generatePlayerRegistration({ gpa: 4.0 });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(true);
            });

            it('should accept GPA values between 0.0 and 4.0', () => {
                const gpas = [0.5, 1.0, 2.5, 3.0, 3.5, 3.75, 3.99];

                gpas.forEach(gpa => {
                    const data = generatePlayerRegistration({ gpa });
                    const result = validatePlayerRegistration(data);
                    expect(result.isValid).toBe(true);
                });
            });
        });

        describe('country validation', () => {
            it('should reject missing country', () => {
                const data = generatePlayerRegistration({ country: '' });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'country',
                    message: 'Country is required'
                });
            });

            it('should accept any non-empty country value', () => {
                const countries = ['USA', 'Canada', 'Mexico', 'United Kingdom'];

                countries.forEach(country => {
                    const data = generatePlayerRegistration({
                        country,
                        state: country === 'USA' ? 'California' : undefined,
                        region: country !== 'USA' ? 'Test Region' : undefined
                    });
                    const result = validatePlayerRegistration(data);
                    expect(result.isValid).toBe(true);
                });
            });
        });

        describe('state/region conditional validation', () => {
            it('should require state when country is USA', () => {
                const data = generatePlayerRegistration({
                    country: 'USA',
                    state: '',
                    region: undefined
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'state',
                    message: 'State is required when country is USA'
                });
            });

            it('should accept state when country is USA (case insensitive)', () => {
                const data = generatePlayerRegistration({
                    country: 'usa',
                    state: 'California'
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(true);
            });

            it('should require region when country is not USA', () => {
                const data = generatePlayerRegistration({
                    country: 'Canada',
                    state: undefined,
                    region: ''
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'region',
                    message: 'Region is required when country is not USA'
                });
            });

            it('should accept region when country is not USA', () => {
                const data = generatePlayerRegistration({
                    country: 'Canada',
                    state: undefined,
                    region: 'Ontario'
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(true);
            });
        });

        describe('optional scholarshipAmount validation', () => {
            it('should accept missing scholarshipAmount', () => {
                const data = generatePlayerRegistration({
                    scholarshipAmount: undefined
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(true);
            });

            it('should reject negative scholarshipAmount', () => {
                const data = generatePlayerRegistration({
                    scholarshipAmount: -1000
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'scholarshipAmount',
                    message: 'Scholarship amount must be a positive number'
                });
            });

            it('should accept zero scholarshipAmount', () => {
                const data = generatePlayerRegistration({
                    scholarshipAmount: 0
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(true);
            });

            it('should accept positive scholarshipAmount', () => {
                const amounts = [1000, 25000, 50000, 100000];

                amounts.forEach(scholarshipAmount => {
                    const data = generatePlayerRegistration({ scholarshipAmount });
                    const result = validatePlayerRegistration(data);
                    expect(result.isValid).toBe(true);
                });
            });

            it('should reject invalid scholarshipAmount string', () => {
                const data = generatePlayerRegistration({
                    scholarshipAmount: 'invalid' as any
                });
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors).toContainEqual({
                    field: 'scholarshipAmount',
                    message: 'Scholarship amount must be a positive number'
                });
            });
        });

        describe('multiple validation errors', () => {
            it('should return all validation errors when multiple fields are invalid', () => {
                const data = {
                    firstName: '',
                    lastName: 'A',
                    dateOfBirth: generateDateOfBirth(12),
                    email: 'invalid-email',
                    password: 'weak',
                    sex: '',
                    sport: '',
                    position: 'G',
                    gpa: 5.0,
                    country: ''
                };
                const result = validatePlayerRegistration(data);

                expect(result.isValid).toBe(false);
                expect(result.errors.length).toBeGreaterThan(5);

                // Check that errors for different fields are present
                const errorFields = result.errors.map(e => e.field);
                expect(errorFields).toContain('firstName');
                expect(errorFields).toContain('lastName');
                expect(errorFields).toContain('dateOfBirth');
                expect(errorFields).toContain('email');
                expect(errorFields).toContain('password');
            });
        });
    });
});
