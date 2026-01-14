import {
    validatePhone,
    validateURL,
    validateGPA,
    validateField,
    validateVideos,
    validateSocialMedia,
} from '../validation';

describe('Profile Validation Utils', () => {
    describe('validatePhone', () => {
        it('should validate correct phone numbers', () => {
            expect(validatePhone('(123) 456-7890')).toBe(true);
            expect(validatePhone('123-456-7890')).toBe(true);
            expect(validatePhone('1234567890')).toBe(true);
            expect(validatePhone('+1 123 456 7890')).toBe(true);
        });

        it('should reject invalid phone numbers', () => {
            expect(validatePhone('123')).toBe(false);
            expect(validatePhone('abc-def-ghij')).toBe(false);
        });

        it('should accept empty phone numbers (optional field)', () => {
            expect(validatePhone('')).toBe(true);
        });
    });

    describe('validateURL', () => {
        it('should validate correct URLs', () => {
            expect(validateURL('https://example.com')).toBe(true);
            expect(validateURL('http://example.com')).toBe(true);
            expect(validateURL('https://www.youtube.com/watch?v=123')).toBe(true);
        });

        it('should reject invalid URLs', () => {
            expect(validateURL('not-a-url')).toBe(false);
            expect(validateURL('ftp://example.com')).toBe(false);
        });

        it('should accept empty URLs (optional field)', () => {
            expect(validateURL('')).toBe(true);
        });
    });

    describe('validateGPA', () => {
        it('should validate correct GPA values', () => {
            expect(validateGPA('3.5')).toBe(true);
            expect(validateGPA('4.0')).toBe(true);
            expect(validateGPA('0.0')).toBe(true);
            expect(validateGPA(3.5)).toBe(true);
        });

        it('should reject invalid GPA values', () => {
            expect(validateGPA('5.0')).toBe(false);
            expect(validateGPA('-1.0')).toBe(false);
            expect(validateGPA('abc')).toBe(false);
        });
    });

    describe('validateField', () => {
        it('should validate required fields', () => {
            expect(validateField('firstName', 'John')).toBeUndefined();
            expect(validateField('firstName', '')).toBe('This field is required');
            expect(validateField('firstName', null)).toBe('This field is required');
            expect(validateField('firstName', undefined)).toBe('This field is required');
        });

        it('should validate email format', () => {
            expect(validateField('email', 'test@example.com')).toBeUndefined();
            expect(validateField('email', 'invalid-email')).toBe('Please enter a valid email address');
            expect(validateField('email', '')).toBe('This field is required');
        });

        it('should validate GPA range', () => {
            expect(validateField('gpa', '3.5')).toBeUndefined();
            expect(validateField('gpa', '5.0')).toBe('GPA must be between 0.0 and 4.0');
        });

        it('should validate phone format', () => {
            expect(validateField('phone', '123-456-7890')).toBeUndefined();
            expect(validateField('phone', '123')).toBe('Please enter a valid phone number');
            expect(validateField('phone', '')).toBeUndefined(); // Optional field
        });

        it('should validate parent guardian email', () => {
            expect(validateField('parentGuardianEmail', 'parent@example.com')).toBeUndefined();
            expect(validateField('parentGuardianEmail', 'invalid')).toBe('Please enter a valid email address');
            expect(validateField('parentGuardianEmail', '')).toBeUndefined(); // Optional field
        });
    });

    describe('validateVideos', () => {
        it('should validate video URLs', () => {
            const videos = [
                { id: '1', title: 'Video 1', url: 'https://youtube.com/watch?v=123', isMain: true, order: 1 },
                { id: '2', title: 'Video 2', url: 'https://vimeo.com/123', isMain: false, order: 2 },
            ];
            const errors = validateVideos(videos);
            expect(Object.keys(errors).length).toBe(0);
        });

        it('should return errors for invalid video URLs', () => {
            const videos = [
                { id: '1', title: 'Video 1', url: 'not-a-url', isMain: true, order: 1 },
                { id: '2', title: 'Video 2', url: 'https://youtube.com/watch?v=123', isMain: false, order: 2 },
            ];
            const errors = validateVideos(videos);
            expect(errors.video_0_url).toBe('Please enter a valid URL (must start with http:// or https://)');
            expect(errors.video_1_url).toBeUndefined();
        });

        it('should handle empty videos array', () => {
            const errors = validateVideos([]);
            expect(Object.keys(errors).length).toBe(0);
        });

        it('should handle undefined videos', () => {
            const errors = validateVideos(undefined);
            expect(Object.keys(errors).length).toBe(0);
        });
    });

    describe('validateSocialMedia', () => {
        it('should validate social media URLs', () => {
            const socialMedia = {
                twitter: 'https://twitter.com/user',
                instagram: 'https://instagram.com/user',
            };
            const errors = validateSocialMedia(socialMedia);
            expect(Object.keys(errors).length).toBe(0);
        });

        it('should return errors for invalid social media URLs', () => {
            const socialMedia = {
                twitter: 'not-a-url',
                instagram: 'https://instagram.com/user',
            };
            const errors = validateSocialMedia(socialMedia);
            expect(errors.socialMedia_twitter).toBe('Please enter a valid URL (must start with http:// or https://)');
            expect(errors.socialMedia_instagram).toBeUndefined();
        });

        it('should handle undefined social media', () => {
            const errors = validateSocialMedia(undefined);
            expect(Object.keys(errors).length).toBe(0);
        });

        it('should handle empty social media object', () => {
            const errors = validateSocialMedia({});
            expect(Object.keys(errors).length).toBe(0);
        });
    });
});
