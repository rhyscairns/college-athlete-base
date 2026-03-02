import {
    validatePhone,
    validateURL,
    validateField,
    validateCoachProfile,
    getPhoneError,
    getURLError,
    validateRequired,
    validateEmail,
    getRequiredFieldError,
    getEmailError,
} from '../validation';

describe('Coach Profile Validation Utils', () => {
    describe('validatePhone', () => {
        it('should validate correct phone numbers', () => {
            expect(validatePhone('(123) 456-7890')).toBe(true);
            expect(validatePhone('123-456-7890')).toBe(true);
            expect(validatePhone('1234567890')).toBe(true);
            expect(validatePhone('+1 123 456 7890')).toBe(true);
            expect(validatePhone('+44 20 1234 5678')).toBe(true);
        });

        it('should reject invalid phone numbers', () => {
            expect(validatePhone('123')).toBe(false);
            expect(validatePhone('abc-def-ghij')).toBe(false);
            expect(validatePhone('12345')).toBe(false);
        });

        it('should accept empty phone numbers (optional field)', () => {
            expect(validatePhone('')).toBe(true);
            expect(validatePhone('   ')).toBe(true);
        });

        it('should handle phone numbers with various formats', () => {
            expect(validatePhone('555.123.4567')).toBe(true);
            expect(validatePhone('555 123 4567')).toBe(true);
            expect(validatePhone('+1-555-123-4567')).toBe(true);
        });

        it('should reject phone numbers that are too long', () => {
            expect(validatePhone('12345678901234567890')).toBe(false);
        });
    });

    describe('validateURL', () => {
        it('should validate correct URLs', () => {
            expect(validateURL('https://example.com')).toBe(true);
            expect(validateURL('http://example.com')).toBe(true);
            expect(validateURL('https://www.university.edu/basketball')).toBe(true);
            expect(validateURL('https://example.com/path/to/page?query=value')).toBe(true);
        });

        it('should reject invalid URLs', () => {
            expect(validateURL('not-a-url')).toBe(false);
            expect(validateURL('ftp://example.com')).toBe(false);
            expect(validateURL('javascript:alert(1)')).toBe(false);
        });

        it('should accept empty URLs (optional field)', () => {
            expect(validateURL('')).toBe(true);
            expect(validateURL('   ')).toBe(true);
        });

        it('should validate URLs with different protocols', () => {
            expect(validateURL('http://example.com')).toBe(true);
            expect(validateURL('https://example.com')).toBe(true);
        });

        it('should reject URLs without protocol', () => {
            expect(validateURL('example.com')).toBe(false);
            expect(validateURL('www.example.com')).toBe(false);
        });
    });

    describe('validateField', () => {
        describe('required fields', () => {
            it('should validate firstName as required', () => {
                expect(validateField('firstName', 'John')).toBeUndefined();
                expect(validateField('firstName', '')).toBe('This field is required');
                expect(validateField('firstName', null)).toBe('This field is required');
                expect(validateField('firstName', undefined)).toBe('This field is required');
                expect(validateField('firstName', '   ')).toBe('This field is required');
            });

            it('should validate lastName as required', () => {
                expect(validateField('lastName', 'Doe')).toBeUndefined();
                expect(validateField('lastName', '')).toBe('This field is required');
                expect(validateField('lastName', null)).toBe('This field is required');
                expect(validateField('lastName', undefined)).toBe('This field is required');
            });

            it('should validate email as required', () => {
                expect(validateField('email', 'coach@university.edu')).toBeUndefined();
                expect(validateField('email', '')).toBe('This field is required');
                expect(validateField('email', null)).toBe('This field is required');
                expect(validateField('email', undefined)).toBe('This field is required');
            });
        });

        describe('email validation', () => {
            it('should validate correct email format', () => {
                expect(validateField('email', 'coach@university.edu')).toBeUndefined();
                expect(validateField('email', 'john.smith@example.com')).toBeUndefined();
                expect(validateField('email', 'coach+tag@university.edu')).toBeUndefined();
            });

            it('should reject invalid email format', () => {
                expect(validateField('email', 'invalid-email')).toBe('Please enter a valid email address');
                expect(validateField('email', '@example.com')).toBe('Please enter a valid email address');
                expect(validateField('email', 'coach@')).toBe('Please enter a valid email address');
                expect(validateField('email', 'coach')).toBe('Please enter a valid email address');
            });
        });

        describe('phone validation', () => {
            it('should validate correct phone format', () => {
                expect(validateField('phone', '123-456-7890')).toBeUndefined();
                expect(validateField('phone', '(555) 123-4567')).toBeUndefined();
                expect(validateField('phone', '+1 555 123 4567')).toBeUndefined();
            });

            it('should reject invalid phone format', () => {
                expect(validateField('phone', '123')).toBe('Please enter a valid phone number');
                expect(validateField('phone', 'abc-def-ghij')).toBe('Please enter a valid phone number');
            });

            it('should allow empty phone (optional field)', () => {
                expect(validateField('phone', '')).toBeUndefined();
                expect(validateField('phone', null)).toBeUndefined();
                expect(validateField('phone', undefined)).toBeUndefined();
            });
        });

        describe('URL validation', () => {
            it('should validate profileImage URL', () => {
                expect(validateField('profileImage', 'https://example.com/image.jpg')).toBeUndefined();
                expect(validateField('profileImage', 'http://example.com/photo.png')).toBeUndefined();
            });

            it('should validate teamWebsiteUrl URL', () => {
                expect(validateField('teamWebsiteUrl', 'https://university.edu/basketball')).toBeUndefined();
                expect(validateField('teamWebsiteUrl', 'http://sports.university.edu')).toBeUndefined();
            });

            it('should reject invalid URLs', () => {
                expect(validateField('profileImage', 'not-a-url')).toBe('Please enter a valid URL (must start with http:// or https://)');
                expect(validateField('teamWebsiteUrl', 'ftp://example.com')).toBe('Please enter a valid URL (must start with http:// or https://)');
            });

            it('should allow empty URLs (optional fields)', () => {
                expect(validateField('profileImage', '')).toBeUndefined();
                expect(validateField('profileImage', null)).toBeUndefined();
                expect(validateField('teamWebsiteUrl', '')).toBeUndefined();
                expect(validateField('teamWebsiteUrl', null)).toBeUndefined();
            });
        });

        describe('optional fields', () => {
            it('should not validate optional fields when empty', () => {
                expect(validateField('university', '')).toBeUndefined();
                expect(validateField('position', '')).toBeUndefined();
                expect(validateField('sport', '')).toBeUndefined();
            });

            it('should accept any value for optional text fields', () => {
                expect(validateField('university', 'State University')).toBeUndefined();
                expect(validateField('position', 'Head Coach')).toBeUndefined();
                expect(validateField('sport', 'Basketball')).toBeUndefined();
            });
        });
    });

    describe('validateCoachProfile', () => {
        const validProfile = {
            firstName: 'John',
            lastName: 'Smith',
            email: 'john.smith@university.edu',
            phone: '555-123-4567',
            university: 'State University',
            position: 'Head Coach',
            sport: 'Basketball',
            profileImage: 'https://example.com/photo.jpg',
            teamWebsiteUrl: 'https://university.edu/basketball',
        };

        it('should validate complete profile with all fields', () => {
            const errors = validateCoachProfile(validProfile);
            expect(Object.keys(errors).length).toBe(0);
        });

        it('should validate profile with only required fields', () => {
            const minimalProfile = {
                firstName: 'John',
                lastName: 'Smith',
                email: 'john.smith@university.edu',
            };
            const errors = validateCoachProfile(minimalProfile);
            expect(Object.keys(errors).length).toBe(0);
        });

        describe('required field validation', () => {
            it('should return error when firstName is missing', () => {
                const profile = { ...validProfile, firstName: '' };
                const errors = validateCoachProfile(profile);
                expect(errors.firstName).toBe('This field is required');
            });

            it('should return error when lastName is missing', () => {
                const profile = { ...validProfile, lastName: '' };
                const errors = validateCoachProfile(profile);
                expect(errors.lastName).toBe('This field is required');
            });

            it('should return error when email is missing', () => {
                const profile = { ...validProfile, email: '' };
                const errors = validateCoachProfile(profile);
                expect(errors.email).toBe('This field is required');
            });

            it('should return multiple errors when multiple required fields are missing', () => {
                const profile = {
                    firstName: '',
                    lastName: '',
                    email: '',
                };
                const errors = validateCoachProfile(profile);
                expect(errors.firstName).toBe('This field is required');
                expect(errors.lastName).toBe('This field is required');
                expect(errors.email).toBe('This field is required');
                expect(Object.keys(errors).length).toBe(3);
            });

            it('should trim whitespace when validating required fields', () => {
                const profile = {
                    firstName: '   ',
                    lastName: 'Smith',
                    email: 'john@example.com',
                };
                const errors = validateCoachProfile(profile);
                expect(errors.firstName).toBe('This field is required');
            });
        });

        describe('email validation', () => {
            it('should return error for invalid email format', () => {
                const profile = { ...validProfile, email: 'invalid-email' };
                const errors = validateCoachProfile(profile);
                expect(errors.email).toBe('Please enter a valid email address');
            });

            it('should validate various email formats', () => {
                const emails = [
                    'coach@university.edu',
                    'john.smith@example.com',
                    'coach+tag@university.edu',
                    'first.last@sub.domain.com',
                ];

                emails.forEach(email => {
                    const profile = { ...validProfile, email };
                    const errors = validateCoachProfile(profile);
                    expect(errors.email).toBeUndefined();
                });
            });

            it('should reject invalid email formats', () => {
                const invalidEmails = [
                    'invalid',
                    '@example.com',
                    'coach@',
                    'coach',
                    'coach@.com',
                ];

                invalidEmails.forEach(email => {
                    const profile = { ...validProfile, email };
                    const errors = validateCoachProfile(profile);
                    expect(errors.email).toBe('Please enter a valid email address');
                });
            });
        });

        describe('phone validation', () => {
            it('should validate various phone formats', () => {
                const phones = [
                    '555-123-4567',
                    '(555) 123-4567',
                    '5551234567',
                    '+1 555 123 4567',
                    '+44 20 1234 5678',
                ];

                phones.forEach(phone => {
                    const profile = { ...validProfile, phone };
                    const errors = validateCoachProfile(profile);
                    expect(errors.phone).toBeUndefined();
                });
            });

            it('should return error for invalid phone format', () => {
                const profile = { ...validProfile, phone: '123' };
                const errors = validateCoachProfile(profile);
                expect(errors.phone).toBe('Please enter a valid phone number');
            });

            it('should allow empty phone (optional field)', () => {
                const profile = { ...validProfile, phone: '' };
                const errors = validateCoachProfile(profile);
                expect(errors.phone).toBeUndefined();
            });

            it('should allow undefined phone', () => {
                const profile = { ...validProfile, phone: undefined };
                const errors = validateCoachProfile(profile);
                expect(errors.phone).toBeUndefined();
            });
        });

        describe('profileImage URL validation', () => {
            it('should validate correct image URLs', () => {
                const urls = [
                    'https://example.com/photo.jpg',
                    'http://example.com/image.png',
                    'https://cdn.example.com/images/coach.jpg',
                ];

                urls.forEach(profileImage => {
                    const profile = { ...validProfile, profileImage };
                    const errors = validateCoachProfile(profile);
                    expect(errors.profileImage).toBeUndefined();
                });
            });

            it('should return error for invalid image URL', () => {
                const profile = { ...validProfile, profileImage: 'not-a-url' };
                const errors = validateCoachProfile(profile);
                expect(errors.profileImage).toBe('Please enter a valid URL (must start with http:// or https://)');
            });

            it('should reject non-http/https protocols', () => {
                const profile = { ...validProfile, profileImage: 'ftp://example.com/photo.jpg' };
                const errors = validateCoachProfile(profile);
                expect(errors.profileImage).toBe('Please enter a valid URL (must start with http:// or https://)');
            });

            it('should allow empty profileImage (optional field)', () => {
                const profile = { ...validProfile, profileImage: '' };
                const errors = validateCoachProfile(profile);
                expect(errors.profileImage).toBeUndefined();
            });

            it('should allow undefined profileImage', () => {
                const profile = { ...validProfile, profileImage: undefined };
                const errors = validateCoachProfile(profile);
                expect(errors.profileImage).toBeUndefined();
            });
        });

        describe('teamWebsiteUrl validation', () => {
            it('should validate correct website URLs', () => {
                const urls = [
                    'https://university.edu/basketball',
                    'http://sports.university.edu',
                    'https://www.university.edu/athletics/basketball',
                ];

                urls.forEach(teamWebsiteUrl => {
                    const profile = { ...validProfile, teamWebsiteUrl };
                    const errors = validateCoachProfile(profile);
                    expect(errors.teamWebsiteUrl).toBeUndefined();
                });
            });

            it('should return error for invalid website URL', () => {
                const profile = { ...validProfile, teamWebsiteUrl: 'not-a-url' };
                const errors = validateCoachProfile(profile);
                expect(errors.teamWebsiteUrl).toBe('Please enter a valid URL (must start with http:// or https://)');
            });

            it('should reject non-http/https protocols', () => {
                const profile = { ...validProfile, teamWebsiteUrl: 'ftp://university.edu' };
                const errors = validateCoachProfile(profile);
                expect(errors.teamWebsiteUrl).toBe('Please enter a valid URL (must start with http:// or https://)');
            });

            it('should allow empty teamWebsiteUrl (optional field)', () => {
                const profile = { ...validProfile, teamWebsiteUrl: '' };
                const errors = validateCoachProfile(profile);
                expect(errors.teamWebsiteUrl).toBeUndefined();
            });

            it('should allow undefined teamWebsiteUrl', () => {
                const profile = { ...validProfile, teamWebsiteUrl: undefined };
                const errors = validateCoachProfile(profile);
                expect(errors.teamWebsiteUrl).toBeUndefined();
            });
        });

        describe('optional text fields', () => {
            it('should allow empty optional fields', () => {
                const profile = {
                    firstName: 'John',
                    lastName: 'Smith',
                    email: 'john@example.com',
                    university: '',
                    position: '',
                    sport: '',
                };
                const errors = validateCoachProfile(profile);
                expect(Object.keys(errors).length).toBe(0);
            });

            it('should allow undefined optional fields', () => {
                const profile = {
                    firstName: 'John',
                    lastName: 'Smith',
                    email: 'john@example.com',
                    university: undefined,
                    position: undefined,
                    sport: undefined,
                };
                const errors = validateCoachProfile(profile);
                expect(Object.keys(errors).length).toBe(0);
            });
        });

        describe('multiple validation errors', () => {
            it('should return all validation errors at once', () => {
                const profile = {
                    firstName: '',
                    lastName: '',
                    email: 'invalid-email',
                    phone: '123',
                    profileImage: 'not-a-url',
                    teamWebsiteUrl: 'ftp://example.com',
                };
                const errors = validateCoachProfile(profile);
                expect(errors.firstName).toBe('This field is required');
                expect(errors.lastName).toBe('This field is required');
                expect(errors.email).toBe('Please enter a valid email address');
                expect(errors.phone).toBe('Please enter a valid phone number');
                expect(errors.profileImage).toBe('Please enter a valid URL (must start with http:// or https://)');
                expect(errors.teamWebsiteUrl).toBe('Please enter a valid URL (must start with http:// or https://)');
                expect(Object.keys(errors).length).toBe(6);
            });
        });
    });

    describe('error message functions', () => {
        it('should return correct phone error message', () => {
            expect(getPhoneError()).toBe('Please enter a valid phone number');
        });

        it('should return correct URL error message', () => {
            expect(getURLError()).toBe('Please enter a valid URL (must start with http:// or https://)');
        });

        it('should return correct required field error message', () => {
            expect(getRequiredFieldError()).toBe('This field is required');
        });

        it('should return correct email error message', () => {
            expect(getEmailError()).toBe('Please enter a valid email address');
        });
    });

    describe('re-exported validation functions', () => {
        it('should re-export validateRequired', () => {
            expect(validateRequired('value')).toBe(true);
            expect(validateRequired('')).toBe(false);
            expect(validateRequired(null)).toBe(false);
            expect(validateRequired(undefined)).toBe(false);
        });

        it('should re-export validateEmail', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('invalid')).toBe(false);
        });
    });
});
