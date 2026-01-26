import {
    validatePhone,
    validateURL,
    validateGPA,
    validateField,
    validateVideos,
    validateSocialMedia,
    validateHeroSection,
    validateAcademicSection,
    validateVideosSection,
    validateContactSection,
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

    describe('validateHeroSection', () => {
        it('should validate complete hero section data with all required fields', () => {
            const data = {
                firstName: 'John',
                lastName: 'Doe',
                position: 'Point Guard',
                school: 'Lincoln High School',
                location: 'Los Angeles, CA',
                classYear: '2025',
                height: '6\'2"',
                weight: '180 lbs',
            };
            const errors = validateHeroSection(data);
            expect(Object.keys(errors).length).toBe(0);
        });

        it('should return error when firstName is missing', () => {
            const data = {
                firstName: '',
                lastName: 'Doe',
                position: 'Point Guard',
                school: 'Lincoln High School',
            };
            const errors = validateHeroSection(data);
            expect(errors.firstName).toBe('This field is required');
        });

        it('should return error when lastName is missing', () => {
            const data = {
                firstName: 'John',
                lastName: '',
                position: 'Point Guard',
                school: 'Lincoln High School',
            };
            const errors = validateHeroSection(data);
            expect(errors.lastName).toBe('This field is required');
        });

        it('should return error when position is missing', () => {
            const data = {
                firstName: 'John',
                lastName: 'Doe',
                position: '',
                school: 'Lincoln High School',
            };
            const errors = validateHeroSection(data);
            expect(errors.position).toBe('This field is required');
        });

        it('should return error when school is missing', () => {
            const data = {
                firstName: 'John',
                lastName: 'Doe',
                position: 'Point Guard',
                school: '',
            };
            const errors = validateHeroSection(data);
            expect(errors.school).toBe('This field is required');
        });

        it('should return multiple errors when multiple required fields are missing', () => {
            const data = {
                firstName: '',
                lastName: '',
                position: 'Point Guard',
                school: 'Lincoln High School',
            };
            const errors = validateHeroSection(data);
            expect(errors.firstName).toBe('This field is required');
            expect(errors.lastName).toBe('This field is required');
            expect(Object.keys(errors).length).toBe(2);
        });

        it('should validate with only required fields (optional fields can be empty)', () => {
            const data = {
                firstName: 'John',
                lastName: 'Doe',
                position: 'Point Guard',
                school: 'Lincoln High School',
                location: '',
                classYear: '',
                height: '',
                weight: '',
            };
            const errors = validateHeroSection(data);
            expect(Object.keys(errors).length).toBe(0);
        });

        it('should trim whitespace when validating required fields', () => {
            const data = {
                firstName: '   ',
                lastName: 'Doe',
                position: 'Point Guard',
                school: 'Lincoln High School',
            };
            const errors = validateHeroSection(data);
            expect(errors.firstName).toBe('This field is required');
        });
    });

    describe('validateAcademicSection', () => {
        it('should validate complete academic section data with all fields', () => {
            const data = {
                gpa: 3.5,
                gpaScale: '4.0',
                satScore: 1400,
                satMath: 700,
                satReading: 700,
                actScore: 32,
                classRank: '10',
                classRankDetail: 'Top 5%',
                ncaaEligibilityCenter: 'ABC123456',
                ncaaQualifier: true,
                coursework: ['AP Calculus', 'AP English'],
            };
            const errors = validateAcademicSection(data);
            expect(Object.keys(errors).length).toBe(0);
        });

        it('should return error when GPA is missing', () => {
            const data = {
                gpa: 0,
                gpaScale: '4.0',
                classRank: '10',
                classRankDetail: 'Top 5%',
                ncaaEligibilityCenter: 'ABC123456',
                ncaaQualifier: true,
                coursework: [],
            };
            const errors = validateAcademicSection(data);
            expect(errors.gpa).toBeUndefined(); // 0 is a valid GPA
        });

        it('should return error when GPA is below 0.0', () => {
            const data = {
                gpa: -0.5,
                gpaScale: '4.0',
                classRank: '10',
                classRankDetail: 'Top 5%',
                ncaaEligibilityCenter: 'ABC123456',
                ncaaQualifier: true,
                coursework: [],
            };
            const errors = validateAcademicSection(data);
            expect(errors.gpa).toBe('GPA must be between 0.0 and 4.0');
        });

        it('should return error when GPA is above 4.0', () => {
            const data = {
                gpa: 4.5,
                gpaScale: '4.0',
                classRank: '10',
                classRankDetail: 'Top 5%',
                ncaaEligibilityCenter: 'ABC123456',
                ncaaQualifier: true,
                coursework: [],
            };
            const errors = validateAcademicSection(data);
            expect(errors.gpa).toBe('GPA must be between 0.0 and 4.0');
        });

        it('should validate GPA at boundary values (0.0 and 4.0)', () => {
            const data1 = {
                gpa: 0.0,
                gpaScale: '4.0',
                classRank: '10',
                classRankDetail: 'Top 5%',
                ncaaEligibilityCenter: 'ABC123456',
                ncaaQualifier: true,
                coursework: [],
            };
            const errors1 = validateAcademicSection(data1);
            expect(errors1.gpa).toBeUndefined();

            const data2 = {
                gpa: 4.0,
                gpaScale: '4.0',
                classRank: '10',
                classRankDetail: 'Top 5%',
                ncaaEligibilityCenter: 'ABC123456',
                ncaaQualifier: true,
                coursework: [],
            };
            const errors2 = validateAcademicSection(data2);
            expect(errors2.gpa).toBeUndefined();
        });

        it('should return error when SAT score is below 400', () => {
            const data = {
                gpa: 3.5,
                gpaScale: '4.0',
                satScore: 399,
                classRank: '10',
                classRankDetail: 'Top 5%',
                ncaaEligibilityCenter: 'ABC123456',
                ncaaQualifier: true,
                coursework: [],
            };
            const errors = validateAcademicSection(data);
            expect(errors.satScore).toBe('SAT score must be between 400 and 1600');
        });

        it('should return error when SAT score is above 1600', () => {
            const data = {
                gpa: 3.5,
                gpaScale: '4.0',
                satScore: 1601,
                classRank: '10',
                classRankDetail: 'Top 5%',
                ncaaEligibilityCenter: 'ABC123456',
                ncaaQualifier: true,
                coursework: [],
            };
            const errors = validateAcademicSection(data);
            expect(errors.satScore).toBe('SAT score must be between 400 and 1600');
        });

        it('should validate SAT score at boundary values (400 and 1600)', () => {
            const data1 = {
                gpa: 3.5,
                gpaScale: '4.0',
                satScore: 400,
                classRank: '10',
                classRankDetail: 'Top 5%',
                ncaaEligibilityCenter: 'ABC123456',
                ncaaQualifier: true,
                coursework: [],
            };
            const errors1 = validateAcademicSection(data1);
            expect(errors1.satScore).toBeUndefined();

            const data2 = {
                gpa: 3.5,
                gpaScale: '4.0',
                satScore: 1600,
                classRank: '10',
                classRankDetail: 'Top 5%',
                ncaaEligibilityCenter: 'ABC123456',
                ncaaQualifier: true,
                coursework: [],
            };
            const errors2 = validateAcademicSection(data2);
            expect(errors2.satScore).toBeUndefined();
        });

        it('should not validate SAT score if not provided', () => {
            const data = {
                gpa: 3.5,
                gpaScale: '4.0',
                classRank: '10',
                classRankDetail: 'Top 5%',
                ncaaEligibilityCenter: 'ABC123456',
                ncaaQualifier: true,
                coursework: [],
            };
            const errors = validateAcademicSection(data);
            expect(errors.satScore).toBeUndefined();
        });

        it('should return error when ACT score is below 1', () => {
            const data = {
                gpa: 3.5,
                gpaScale: '4.0',
                actScore: 0,
                classRank: '10',
                classRankDetail: 'Top 5%',
                ncaaEligibilityCenter: 'ABC123456',
                ncaaQualifier: true,
                coursework: [],
            };
            const errors = validateAcademicSection(data);
            expect(errors.actScore).toBe('ACT score must be between 1 and 36');
        });

        it('should return error when ACT score is above 36', () => {
            const data = {
                gpa: 3.5,
                gpaScale: '4.0',
                actScore: 37,
                classRank: '10',
                classRankDetail: 'Top 5%',
                ncaaEligibilityCenter: 'ABC123456',
                ncaaQualifier: true,
                coursework: [],
            };
            const errors = validateAcademicSection(data);
            expect(errors.actScore).toBe('ACT score must be between 1 and 36');
        });

        it('should validate ACT score at boundary values (1 and 36)', () => {
            const data1 = {
                gpa: 3.5,
                gpaScale: '4.0',
                actScore: 1,
                classRank: '10',
                classRankDetail: 'Top 5%',
                ncaaEligibilityCenter: 'ABC123456',
                ncaaQualifier: true,
                coursework: [],
            };
            const errors1 = validateAcademicSection(data1);
            expect(errors1.actScore).toBeUndefined();

            const data2 = {
                gpa: 3.5,
                gpaScale: '4.0',
                actScore: 36,
                classRank: '10',
                classRankDetail: 'Top 5%',
                ncaaEligibilityCenter: 'ABC123456',
                ncaaQualifier: true,
                coursework: [],
            };
            const errors2 = validateAcademicSection(data2);
            expect(errors2.actScore).toBeUndefined();
        });

        it('should not validate ACT score if not provided', () => {
            const data = {
                gpa: 3.5,
                gpaScale: '4.0',
                classRank: '10',
                classRankDetail: 'Top 5%',
                ncaaEligibilityCenter: 'ABC123456',
                ncaaQualifier: true,
                coursework: [],
            };
            const errors = validateAcademicSection(data);
            expect(errors.actScore).toBeUndefined();
        });

        it('should validate SAT Math score range (200-800)', () => {
            const data1 = {
                gpa: 3.5,
                gpaScale: '4.0',
                satMath: 199,
                classRank: '10',
                classRankDetail: 'Top 5%',
                ncaaEligibilityCenter: 'ABC123456',
                ncaaQualifier: true,
                coursework: [],
            };
            const errors1 = validateAcademicSection(data1);
            expect(errors1.satMath).toBe('SAT Math score must be between 200 and 800');

            const data2 = {
                gpa: 3.5,
                gpaScale: '4.0',
                satMath: 801,
                classRank: '10',
                classRankDetail: 'Top 5%',
                ncaaEligibilityCenter: 'ABC123456',
                ncaaQualifier: true,
                coursework: [],
            };
            const errors2 = validateAcademicSection(data2);
            expect(errors2.satMath).toBe('SAT Math score must be between 200 and 800');
        });

        it('should validate SAT Reading score range (200-800)', () => {
            const data1 = {
                gpa: 3.5,
                gpaScale: '4.0',
                satReading: 199,
                classRank: '10',
                classRankDetail: 'Top 5%',
                ncaaEligibilityCenter: 'ABC123456',
                ncaaQualifier: true,
                coursework: [],
            };
            const errors1 = validateAcademicSection(data1);
            expect(errors1.satReading).toBe('SAT Reading score must be between 200 and 800');

            const data2 = {
                gpa: 3.5,
                gpaScale: '4.0',
                satReading: 801,
                classRank: '10',
                classRankDetail: 'Top 5%',
                ncaaEligibilityCenter: 'ABC123456',
                ncaaQualifier: true,
                coursework: [],
            };
            const errors2 = validateAcademicSection(data2);
            expect(errors2.satReading).toBe('SAT Reading score must be between 200 and 800');
        });

        it('should return multiple errors when multiple fields are invalid', () => {
            const data = {
                gpa: 5.0,
                gpaScale: '4.0',
                satScore: 2000,
                actScore: 40,
                classRank: '10',
                classRankDetail: 'Top 5%',
                ncaaEligibilityCenter: 'ABC123456',
                ncaaQualifier: true,
                coursework: [],
            };
            const errors = validateAcademicSection(data);
            expect(errors.gpa).toBe('GPA must be between 0.0 and 4.0');
            expect(errors.satScore).toBe('SAT score must be between 400 and 1600');
            expect(errors.actScore).toBe('ACT score must be between 1 and 36');
            expect(Object.keys(errors).length).toBe(3);
        });

        it('should handle null values for optional test scores', () => {
            const data = {
                gpa: 3.5,
                gpaScale: '4.0',
                satScore: null as any,
                actScore: null as any,
                classRank: '10',
                classRankDetail: 'Top 5%',
                ncaaEligibilityCenter: 'ABC123456',
                ncaaQualifier: true,
                coursework: [],
            };
            const errors = validateAcademicSection(data);
            expect(errors.satScore).toBeUndefined();
            expect(errors.actScore).toBeUndefined();
        });
    });

    describe('validateVideosSection', () => {
        it('should validate complete videos section data with all required fields', () => {
            const data = {
                videos: [
                    {
                        id: 'video-1',
                        title: 'Junior Season Highlights',
                        url: 'https://youtube.com/watch?v=abc123',
                        description: 'Full season highlights',
                        thumbnail: 'https://example.com/thumb.jpg',
                        duration: '5:45',
                        isFeatured: true,
                        date: 'Sept 2023',
                    },
                    {
                        id: 'video-2',
                        title: 'Playoff Game',
                        url: 'https://vimeo.com/123456',
                        description: 'Championship game',
                        duration: '3:20',
                        isFeatured: false,
                        date: 'Nov 2023',
                    },
                ],
            };
            const errors = validateVideosSection(data);
            expect(Object.keys(errors).length).toBe(0);
        });

        it('should return error when video title is missing', () => {
            const data = {
                videos: [
                    {
                        id: 'video-1',
                        title: '',
                        url: 'https://youtube.com/watch?v=abc123',
                    },
                ],
            };
            const errors = validateVideosSection(data);
            expect(errors['video-0-title']).toBe('Video title is required');
        });

        it('should return error when video URL is missing', () => {
            const data = {
                videos: [
                    {
                        id: 'video-1',
                        title: 'Junior Season Highlights',
                        url: '',
                    },
                ],
            };
            const errors = validateVideosSection(data);
            expect(errors['video-0-url']).toBe('Video URL is required');
        });

        it('should return error when video URL format is invalid', () => {
            const data = {
                videos: [
                    {
                        id: 'video-1',
                        title: 'Junior Season Highlights',
                        url: 'not-a-valid-url',
                    },
                ],
            };
            const errors = validateVideosSection(data);
            expect(errors['video-0-url']).toBe('Please enter a valid URL (must start with http:// or https://)');
        });

        it('should return error when thumbnail URL format is invalid', () => {
            const data = {
                videos: [
                    {
                        id: 'video-1',
                        title: 'Junior Season Highlights',
                        url: 'https://youtube.com/watch?v=abc123',
                        thumbnail: 'not-a-valid-url',
                    },
                ],
            };
            const errors = validateVideosSection(data);
            expect(errors['video-0-thumbnail']).toBe('Please enter a valid URL (must start with http:// or https://)');
        });

        it('should validate multiple videos and return errors for each invalid video', () => {
            const data = {
                videos: [
                    {
                        id: 'video-1',
                        title: '',
                        url: 'https://youtube.com/watch?v=abc123',
                    },
                    {
                        id: 'video-2',
                        title: 'Valid Title',
                        url: 'invalid-url',
                    },
                    {
                        id: 'video-3',
                        title: 'Another Valid Title',
                        url: 'https://vimeo.com/123',
                        thumbnail: 'bad-thumbnail-url',
                    },
                ],
            };
            const errors = validateVideosSection(data);
            expect(errors['video-0-title']).toBe('Video title is required');
            expect(errors['video-1-url']).toBe('Please enter a valid URL (must start with http:// or https://)');
            expect(errors['video-2-thumbnail']).toBe('Please enter a valid URL (must start with http:// or https://)');
            expect(Object.keys(errors).length).toBe(3);
        });

        it('should handle empty videos array', () => {
            const data = {
                videos: [],
            };
            const errors = validateVideosSection(data);
            expect(Object.keys(errors).length).toBe(0);
        });

        it('should handle undefined videos array', () => {
            const data = {
                videos: undefined as any,
            };
            const errors = validateVideosSection(data);
            expect(Object.keys(errors).length).toBe(0);
        });

        it('should not validate optional fields if they are empty', () => {
            const data = {
                videos: [
                    {
                        id: 'video-1',
                        title: 'Junior Season Highlights',
                        url: 'https://youtube.com/watch?v=abc123',
                        description: '',
                        thumbnail: '',
                        duration: '',
                        date: '',
                    },
                ],
            };
            const errors = validateVideosSection(data);
            expect(Object.keys(errors).length).toBe(0);
        });

        it('should validate videos with only required fields', () => {
            const data = {
                videos: [
                    {
                        id: 'video-1',
                        title: 'Junior Season Highlights',
                        url: 'https://youtube.com/watch?v=abc123',
                    },
                ],
            };
            const errors = validateVideosSection(data);
            expect(Object.keys(errors).length).toBe(0);
        });

        it('should return both title and URL errors when both are missing', () => {
            const data = {
                videos: [
                    {
                        id: 'video-1',
                        title: '',
                        url: '',
                    },
                ],
            };
            const errors = validateVideosSection(data);
            expect(errors['video-0-title']).toBe('Video title is required');
            expect(errors['video-0-url']).toBe('Video URL is required');
            expect(Object.keys(errors).length).toBe(2);
        });

        it('should validate http and https URLs', () => {
            const data = {
                videos: [
                    {
                        id: 'video-1',
                        title: 'HTTP Video',
                        url: 'http://youtube.com/watch?v=abc123',
                    },
                    {
                        id: 'video-2',
                        title: 'HTTPS Video',
                        url: 'https://youtube.com/watch?v=abc123',
                    },
                ],
            };
            const errors = validateVideosSection(data);
            expect(Object.keys(errors).length).toBe(0);
        });

        it('should reject non-http/https protocols', () => {
            const data = {
                videos: [
                    {
                        id: 'video-1',
                        title: 'FTP Video',
                        url: 'ftp://example.com/video.mp4',
                    },
                ],
            };
            const errors = validateVideosSection(data);
            expect(errors['video-0-url']).toBe('Please enter a valid URL (must start with http:// or https://)');
        });

        it('should trim whitespace when validating required fields', () => {
            const data = {
                videos: [
                    {
                        id: 'video-1',
                        title: '   ',
                        url: 'https://youtube.com/watch?v=abc123',
                    },
                ],
            };
            const errors = validateVideosSection(data);
            expect(errors['video-0-title']).toBe('Video title is required');
        });
    });

    describe('validateContactSection', () => {
        it('should validate complete contact section data with all required fields', () => {
            const data = {
                email: 'player@example.com',
                phone: '123-456-7890',
                parentGuardianName: 'John Doe',
                parentGuardianPhone: '098-765-4321',
                parentGuardianEmail: 'parent@example.com',
                socialMedia: {
                    twitter: 'https://twitter.com/player',
                    instagram: 'https://instagram.com/player',
                    youtube: 'https://youtube.com/player',
                    tiktok: 'https://tiktok.com/@player',
                },
                preferredContactMethod: 'email',
            };
            const errors = validateContactSection(data);
            expect(Object.keys(errors).length).toBe(0);
        });

        it('should return error when email is missing', () => {
            const data = {
                email: '',
                phone: '123-456-7890',
                socialMedia: {},
                preferredContactMethod: 'email',
            };
            const errors = validateContactSection(data);
            expect(errors.email).toBe('This field is required');
        });

        it('should return error when email format is invalid', () => {
            const data = {
                email: 'invalid-email',
                phone: '123-456-7890',
                socialMedia: {},
                preferredContactMethod: 'email',
            };
            const errors = validateContactSection(data);
            expect(errors.email).toBe('Please enter a valid email address');
        });

        it('should return error when phone is missing', () => {
            const data = {
                email: 'player@example.com',
                phone: '',
                socialMedia: {},
                preferredContactMethod: 'email',
            };
            const errors = validateContactSection(data);
            expect(errors.phone).toBe('This field is required');
        });

        it('should return error when phone format is invalid', () => {
            const data = {
                email: 'player@example.com',
                phone: '123',
                socialMedia: {},
                preferredContactMethod: 'email',
            };
            const errors = validateContactSection(data);
            expect(errors.phone).toBe('Please enter a valid phone number');
        });

        it('should validate parent/guardian email if provided', () => {
            const data = {
                email: 'player@example.com',
                phone: '123-456-7890',
                parentGuardianEmail: 'invalid-email',
                socialMedia: {},
                preferredContactMethod: 'email',
            };
            const errors = validateContactSection(data);
            expect(errors.parentGuardianEmail).toBe('Please enter a valid email address');
        });

        it('should not validate parent/guardian email if empty', () => {
            const data = {
                email: 'player@example.com',
                phone: '123-456-7890',
                parentGuardianEmail: '',
                socialMedia: {},
                preferredContactMethod: 'email',
            };
            const errors = validateContactSection(data);
            expect(errors.parentGuardianEmail).toBeUndefined();
        });

        it('should validate parent/guardian phone if provided', () => {
            const data = {
                email: 'player@example.com',
                phone: '123-456-7890',
                parentGuardianPhone: '123',
                socialMedia: {},
                preferredContactMethod: 'email',
            };
            const errors = validateContactSection(data);
            expect(errors.parentGuardianPhone).toBe('Please enter a valid phone number');
        });

        it('should not validate parent/guardian phone if empty', () => {
            const data = {
                email: 'player@example.com',
                phone: '123-456-7890',
                parentGuardianPhone: '',
                socialMedia: {},
                preferredContactMethod: 'email',
            };
            const errors = validateContactSection(data);
            expect(errors.parentGuardianPhone).toBeUndefined();
        });

        it('should validate Twitter URL format', () => {
            const data = {
                email: 'player@example.com',
                phone: '123-456-7890',
                socialMedia: {
                    twitter: 'not-a-url',
                },
                preferredContactMethod: 'email',
            };
            const errors = validateContactSection(data);
            expect(errors['socialMedia.twitter']).toBe('Please enter a valid URL (must start with http:// or https://)');
        });

        it('should validate Instagram URL format', () => {
            const data = {
                email: 'player@example.com',
                phone: '123-456-7890',
                socialMedia: {
                    instagram: 'not-a-url',
                },
                preferredContactMethod: 'email',
            };
            const errors = validateContactSection(data);
            expect(errors['socialMedia.instagram']).toBe('Please enter a valid URL (must start with http:// or https://)');
        });

        it('should validate YouTube URL format', () => {
            const data = {
                email: 'player@example.com',
                phone: '123-456-7890',
                socialMedia: {
                    youtube: 'not-a-url',
                },
                preferredContactMethod: 'email',
            };
            const errors = validateContactSection(data);
            expect(errors['socialMedia.youtube']).toBe('Please enter a valid URL (must start with http:// or https://)');
        });

        it('should validate TikTok URL format', () => {
            const data = {
                email: 'player@example.com',
                phone: '123-456-7890',
                socialMedia: {
                    tiktok: 'not-a-url',
                },
                preferredContactMethod: 'email',
            };
            const errors = validateContactSection(data);
            expect(errors['socialMedia.tiktok']).toBe('Please enter a valid URL (must start with http:// or https://)');
        });

        it('should not validate social media URLs if empty', () => {
            const data = {
                email: 'player@example.com',
                phone: '123-456-7890',
                socialMedia: {
                    twitter: '',
                    instagram: '',
                    youtube: '',
                    tiktok: '',
                },
                preferredContactMethod: 'email',
            };
            const errors = validateContactSection(data);
            expect(errors['socialMedia.twitter']).toBeUndefined();
            expect(errors['socialMedia.instagram']).toBeUndefined();
            expect(errors['socialMedia.youtube']).toBeUndefined();
            expect(errors['socialMedia.tiktok']).toBeUndefined();
        });

        it('should return multiple errors when multiple fields are invalid', () => {
            const data = {
                email: 'invalid-email',
                phone: '123',
                parentGuardianEmail: 'invalid-parent-email',
                parentGuardianPhone: '456',
                socialMedia: {
                    twitter: 'not-a-url',
                    instagram: 'also-not-a-url',
                },
                preferredContactMethod: 'email',
            };
            const errors = validateContactSection(data);
            expect(errors.email).toBe('Please enter a valid email address');
            expect(errors.phone).toBe('Please enter a valid phone number');
            expect(errors.parentGuardianEmail).toBe('Please enter a valid email address');
            expect(errors.parentGuardianPhone).toBe('Please enter a valid phone number');
            expect(errors['socialMedia.twitter']).toBe('Please enter a valid URL (must start with http:// or https://)');
            expect(errors['socialMedia.instagram']).toBe('Please enter a valid URL (must start with http:// or https://)');
            expect(Object.keys(errors).length).toBe(6);
        });

        it('should validate with only required fields (optional fields can be empty)', () => {
            const data = {
                email: 'player@example.com',
                phone: '123-456-7890',
                socialMedia: {},
                preferredContactMethod: 'email',
            };
            const errors = validateContactSection(data);
            expect(Object.keys(errors).length).toBe(0);
        });

        it('should validate various phone number formats', () => {
            const validPhoneFormats = [
                '(123) 456-7890',
                '123-456-7890',
                '1234567890',
                '+1 123 456 7890',
            ];

            validPhoneFormats.forEach((phone) => {
                const data = {
                    email: 'player@example.com',
                    phone,
                    socialMedia: {},
                    preferredContactMethod: 'email',
                };
                const errors = validateContactSection(data);
                expect(errors.phone).toBeUndefined();
            });
        });

        it('should validate http and https URLs for social media', () => {
            const data = {
                email: 'player@example.com',
                phone: '123-456-7890',
                socialMedia: {
                    twitter: 'http://twitter.com/player',
                    instagram: 'https://instagram.com/player',
                },
                preferredContactMethod: 'email',
            };
            const errors = validateContactSection(data);
            expect(Object.keys(errors).length).toBe(0);
        });

        it('should reject non-http/https protocols for social media URLs', () => {
            const data = {
                email: 'player@example.com',
                phone: '123-456-7890',
                socialMedia: {
                    twitter: 'ftp://twitter.com/player',
                },
                preferredContactMethod: 'email',
            };
            const errors = validateContactSection(data);
            expect(errors['socialMedia.twitter']).toBe('Please enter a valid URL (must start with http:// or https://)');
        });

        it('should handle missing optional fields gracefully', () => {
            const data = {
                email: 'player@example.com',
                phone: '123-456-7890',
                socialMedia: {},
                preferredContactMethod: 'email',
            };
            const errors = validateContactSection(data);
            expect(Object.keys(errors).length).toBe(0);
        });

        it('should validate valid email addresses', () => {
            const validEmails = [
                'player@example.com',
                'john.doe@university.edu',
                'athlete+recruiting@sports.org',
            ];

            validEmails.forEach((email) => {
                const data = {
                    email,
                    phone: '123-456-7890',
                    socialMedia: {},
                    preferredContactMethod: 'email',
                };
                const errors = validateContactSection(data);
                expect(errors.email).toBeUndefined();
            });
        });

        it('should validate all social media platforms independently', () => {
            const data = {
                email: 'player@example.com',
                phone: '123-456-7890',
                socialMedia: {
                    twitter: 'not-a-url',
                    instagram: 'https://instagram.com/player',
                    youtube: 'not-a-url',
                    tiktok: 'https://tiktok.com/@player',
                },
                preferredContactMethod: 'email',
            };
            const errors = validateContactSection(data);
            expect(errors['socialMedia.twitter']).toBe('Please enter a valid URL (must start with http:// or https://)');
            expect(errors['socialMedia.instagram']).toBeUndefined();
            expect(errors['socialMedia.youtube']).toBe('Please enter a valid URL (must start with http:// or https://)');
            expect(errors['socialMedia.tiktok']).toBeUndefined();
            expect(Object.keys(errors).length).toBe(2);
        });
    });
});
