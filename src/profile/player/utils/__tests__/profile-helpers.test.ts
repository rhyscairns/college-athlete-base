/**
 * Tests for profile helper utilities
 */

import { hasSectionData, getEmptyProfile, mergeWithDefaults } from '../profile-helpers';
import type { Academic, Stats, Video, Achievement, Testimonial, Contact } from '../../types';
import type { MockPlayerData } from '../../data/mockPlayerData';

describe('profile-helpers', () => {
    describe('hasSectionData', () => {
        describe('academic section', () => {
            it('should return false for null/undefined', () => {
                expect(hasSectionData(null, 'academic')).toBe(false);
                expect(hasSectionData(undefined, 'academic')).toBe(false);
            });

            it('should return false for empty academic data', () => {
                const emptyAcademic: Academic = {
                    gpa: 0,
                    gpaScale: '4.0 Scale',
                    coursework: [],
                };
                expect(hasSectionData(emptyAcademic, 'academic')).toBe(false);
            });

            it('should return true when GPA is set', () => {
                const academic: Academic = {
                    gpa: 3.5,
                    gpaScale: '4.0 Scale',
                    coursework: [],
                };
                expect(hasSectionData(academic, 'academic')).toBe(true);
            });

            it('should return true when SAT score is set', () => {
                const academic: Academic = {
                    gpa: 0,
                    gpaScale: '4.0 Scale',
                    coursework: [],
                    satScore: 1200,
                };
                expect(hasSectionData(academic, 'academic')).toBe(true);
            });

            it('should return true when ACT score is set', () => {
                const academic: Academic = {
                    gpa: 0,
                    gpaScale: '4.0 Scale',
                    coursework: [],
                    actScore: 28,
                };
                expect(hasSectionData(academic, 'academic')).toBe(true);
            });

            it('should return true when coursework has items', () => {
                const academic: Academic = {
                    gpa: 0,
                    gpaScale: '4.0 Scale',
                    coursework: ['AP Calculus'],
                };
                expect(hasSectionData(academic, 'academic')).toBe(true);
            });

            it('should return true when NCAA eligibility is set', () => {
                const academic: Academic = {
                    gpa: 0,
                    gpaScale: '4.0 Scale',
                    coursework: [],
                    ncaaEligibilityCenter: '#123456',
                };
                expect(hasSectionData(academic, 'academic')).toBe(true);
            });

            it('should return true when class rank is set', () => {
                const academic: Academic = {
                    gpa: 0,
                    gpaScale: '4.0 Scale',
                    coursework: [],
                    classRank: 'Top 10%',
                };
                expect(hasSectionData(academic, 'academic')).toBe(true);
            });
        });

        describe('stats section', () => {
            it('should return false for null/undefined', () => {
                expect(hasSectionData(null, 'stats')).toBe(false);
                expect(hasSectionData(undefined, 'stats')).toBe(false);
            });

            it('should return false for empty stats object', () => {
                const emptyStats: Stats = {};
                expect(hasSectionData(emptyStats, 'stats')).toBe(false);
            });

            it('should return false for stats with only empty values', () => {
                const stats: Stats = {
                    'Receiving Yards': '',
                    'Touchdowns': null,
                };
                expect(hasSectionData(stats, 'stats')).toBe(false);
            });

            it('should return true when stats have values', () => {
                const stats: Stats = {
                    'Receiving Yards': '1250',
                    'Touchdowns': 12,
                };
                expect(hasSectionData(stats, 'stats')).toBe(true);
            });

            it('should return true when at least one stat has a value', () => {
                const stats: Stats = {
                    'Receiving Yards': '',
                    'Touchdowns': 12,
                };
                expect(hasSectionData(stats, 'stats')).toBe(true);
            });
        });

        describe('videos section', () => {
            it('should return false for null/undefined', () => {
                expect(hasSectionData(null, 'videos')).toBe(false);
                expect(hasSectionData(undefined, 'videos')).toBe(false);
            });

            it('should return false for empty array', () => {
                expect(hasSectionData([], 'videos')).toBe(false);
            });

            it('should return true for non-empty array', () => {
                const videos: Video[] = [
                    {
                        id: 'video-1',
                        title: 'Highlights',
                        url: 'https://youtube.com/watch?v=example',
                    },
                ];
                expect(hasSectionData(videos, 'videos')).toBe(true);
            });
        });

        describe('achievements section', () => {
            it('should return false for null/undefined', () => {
                expect(hasSectionData(null, 'achievements')).toBe(false);
                expect(hasSectionData(undefined, 'achievements')).toBe(false);
            });

            it('should return false for empty array', () => {
                expect(hasSectionData([], 'achievements')).toBe(false);
            });

            it('should return true for non-empty array', () => {
                const achievements: Achievement[] = [
                    {
                        id: 'achievement-1',
                        icon: 'trophy',
                        title: 'All-State',
                        description: '1st Team',
                        color: 'gold',
                    },
                ];
                expect(hasSectionData(achievements, 'achievements')).toBe(true);
            });
        });

        describe('testimonials section', () => {
            it('should return false for null/undefined', () => {
                expect(hasSectionData(null, 'testimonials')).toBe(false);
                expect(hasSectionData(undefined, 'testimonials')).toBe(false);
            });

            it('should return false for empty array', () => {
                expect(hasSectionData([], 'testimonials')).toBe(false);
            });

            it('should return true for non-empty array', () => {
                const testimonials: Testimonial[] = [
                    {
                        id: 'testimonial-1',
                        quote: 'Great player',
                        coachName: 'Coach Smith',
                        coachTitle: 'Head Coach',
                        coachOrganization: 'High School',
                    },
                ];
                expect(hasSectionData(testimonials, 'testimonials')).toBe(true);
            });
        });

        describe('contact section', () => {
            it('should return false for null/undefined', () => {
                expect(hasSectionData(null, 'contact')).toBe(false);
                expect(hasSectionData(undefined, 'contact')).toBe(false);
            });

            it('should return false for contact with only email', () => {
                const contact: Contact = {
                    email: 'test@example.com',
                    phone: '',
                    socialMedia: {},
                    headCoach: {
                        name: '',
                        email: '',
                        phone: '',
                    },
                };
                expect(hasSectionData(contact, 'contact')).toBe(false);
            });

            it('should return true when phone is set', () => {
                const contact: Contact = {
                    email: 'test@example.com',
                    phone: '555-1234',
                    socialMedia: {},
                    headCoach: {
                        name: '',
                        email: '',
                        phone: '',
                    },
                };
                expect(hasSectionData(contact, 'contact')).toBe(true);
            });

            it('should return true when parent guardian info is set', () => {
                const contact: Contact = {
                    email: 'test@example.com',
                    phone: '',
                    parentGuardianName: 'John Doe',
                    socialMedia: {},
                    headCoach: {
                        name: '',
                        email: '',
                        phone: '',
                    },
                };
                expect(hasSectionData(contact, 'contact')).toBe(true);
            });

            it('should return true when social media is set', () => {
                const contact: Contact = {
                    email: 'test@example.com',
                    phone: '',
                    socialMedia: {
                        twitter: 'https://twitter.com/user',
                    },
                    headCoach: {
                        name: '',
                        email: '',
                        phone: '',
                    },
                };
                expect(hasSectionData(contact, 'contact')).toBe(true);
            });

            it('should return true when head coach info is set', () => {
                const contact: Contact = {
                    email: 'test@example.com',
                    phone: '',
                    socialMedia: {},
                    headCoach: {
                        name: 'Coach Smith',
                        email: 'coach@school.edu',
                        phone: '555-5678',
                    },
                };
                expect(hasSectionData(contact, 'contact')).toBe(true);
            });
        });
    });

    describe('getEmptyProfile', () => {
        it('should return a partial profile with empty values', () => {
            const emptyProfile = getEmptyProfile();

            expect(emptyProfile.id).toBe('');
            expect(emptyProfile.firstName).toBe('');
            expect(emptyProfile.lastName).toBe('');
            expect(emptyProfile.initials).toBe('');
            expect(emptyProfile.classYear).toBe('');
            expect(emptyProfile.position).toBe('');
            expect(emptyProfile.school).toBe('');
            expect(emptyProfile.location).toBe('');
            expect(emptyProfile.height).toBe('');
            expect(emptyProfile.weight).toBe('');
        });

        it('should return empty arrays for collection fields', () => {
            const emptyProfile = getEmptyProfile();

            expect(emptyProfile.performanceMetrics).toEqual([]);
            expect(emptyProfile.videos).toEqual([]);
            expect(emptyProfile.achievements).toEqual([]);
            expect(emptyProfile.coachTestimonials).toEqual([]);
        });

        it('should return empty academic structure', () => {
            const emptyProfile = getEmptyProfile();

            expect(emptyProfile.academic).toEqual({
                gpa: 0,
                gpaScale: '4.0 Scale',
                coursework: [],
                ncaaEligibilityCenter: '',
                ncaaQualifier: false,
                satScore: 0,
                satMath: 0,
                satReading: 0,
                actScore: undefined,
                classRank: '',
                classRankDetail: '',
            });
        });

        it('should return empty stats object', () => {
            const emptyProfile = getEmptyProfile();

            expect(emptyProfile.stats).toEqual({
                'Receiving Yards': '',
                'Touchdowns': '',
                'Receptions': '',
                'Yards Per Catch': '',
                'Longest Reception': '',
            });
        });

        it('should return empty contact structure', () => {
            const emptyProfile = getEmptyProfile();

            expect(emptyProfile.contact).toEqual({
                email: '',
                phone: '',
                socialMedia: {
                    twitter: '',
                    instagram: '',
                    youtube: '',
                    tiktok: '',
                },
                headCoach: {
                    name: '',
                    email: '',
                    phone: '',
                },
                parentGuardianName: '',
                parentGuardianPhone: '',
                parentGuardianEmail: '',
                preferredContactMethod: '',
            });
        });
    });

    describe('mergeWithDefaults', () => {
        it('should fill in missing required fields with defaults', () => {
            const partialData: Partial<MockPlayerData> = {
                id: 'player-123',
                firstName: 'John',
            };

            const merged = mergeWithDefaults(partialData);

            expect(merged.id).toBe('player-123');
            expect(merged.firstName).toBe('John');
            expect(merged.lastName).toBe('');
            expect(merged.initials).toBe('');
            expect(merged.classYear).toBe('');
        });

        it('should preserve provided values', () => {
            const partialData: Partial<MockPlayerData> = {
                id: 'player-123',
                firstName: 'John',
                lastName: 'Doe',
                initials: 'JD',
                classYear: '2025',
                position: 'QB',
                school: 'Test High',
                location: 'City, ST',
                height: '6\'2"',
                weight: '200 lbs',
            };

            const merged = mergeWithDefaults(partialData);

            expect(merged.id).toBe('player-123');
            expect(merged.firstName).toBe('John');
            expect(merged.lastName).toBe('Doe');
            expect(merged.initials).toBe('JD');
            expect(merged.classYear).toBe('2025');
            expect(merged.position).toBe('QB');
            expect(merged.school).toBe('Test High');
            expect(merged.location).toBe('City, ST');
            expect(merged.height).toBe('6\'2"');
            expect(merged.weight).toBe('200 lbs');
        });

        it('should merge academic data with defaults', () => {
            const partialData: Partial<MockPlayerData> = {
                id: 'player-123',
                firstName: 'John',
                lastName: 'Doe',
                academic: {
                    gpa: 3.5,
                    gpaScale: '4.0 Scale',
                    coursework: ['AP Calculus'],
                    satScore: 1200,
                },
            };

            const merged = mergeWithDefaults(partialData);

            expect(merged.academic.gpa).toBe(3.5);
            expect(merged.academic.gpaScale).toBe('4.0 Scale');
            expect(merged.academic.coursework).toEqual(['AP Calculus']);
            expect(merged.academic.satScore).toBe(1200);
            expect(merged.academic.actScore).toBeUndefined();
        });

        it('should use empty arrays when collections are not provided', () => {
            const partialData: Partial<MockPlayerData> = {
                id: 'player-123',
                firstName: 'John',
                lastName: 'Doe',
            };

            const merged = mergeWithDefaults(partialData);

            expect(merged.videos).toEqual([]);
            expect(merged.achievements).toEqual([]);
            expect(merged.coachTestimonials).toEqual([]);
            expect(merged.performanceMetrics).toEqual([]);
        });

        it('should preserve provided arrays', () => {
            const partialData: Partial<MockPlayerData> = {
                id: 'player-123',
                firstName: 'John',
                lastName: 'Doe',
                videos: [
                    {
                        id: 'video-1',
                        title: 'Highlights',
                        url: 'https://youtube.com/watch?v=example',
                    },
                ],
                achievements: [
                    {
                        id: 'achievement-1',
                        icon: 'trophy',
                        title: 'All-State',
                        description: '1st Team',
                        color: 'gold',
                    },
                ],
            };

            const merged = mergeWithDefaults(partialData);

            expect(merged.videos).toHaveLength(1);
            expect(merged.videos[0].id).toBe('video-1');
            expect(merged.achievements).toHaveLength(1);
            expect(merged.achievements[0].id).toBe('achievement-1');
        });

        it('should merge contact data with defaults', () => {
            const partialData: Partial<MockPlayerData> = {
                id: 'player-123',
                firstName: 'John',
                lastName: 'Doe',
                contact: {
                    email: 'john@example.com',
                    phone: '555-1234',
                    socialMedia: {
                        twitter: 'https://twitter.com/john',
                    },
                    headCoach: {
                        name: 'Coach Smith',
                        email: 'coach@school.edu',
                        phone: '555-5678',
                    },
                },
            };

            const merged = mergeWithDefaults(partialData);

            expect(merged.contact.email).toBe('john@example.com');
            expect(merged.contact.phone).toBe('555-1234');
            expect(merged.contact.socialMedia.twitter).toBe('https://twitter.com/john');
            expect(merged.contact.headCoach.name).toBe('Coach Smith');
        });

        it('should handle completely empty data', () => {
            const partialData: Partial<MockPlayerData> = {};

            const merged = mergeWithDefaults(partialData);

            expect(merged.id).toBe('');
            expect(merged.firstName).toBe('');
            expect(merged.videos).toEqual([]);
            expect(merged.stats).toEqual({
                'Receiving Yards': '',
                'Touchdowns': '',
                'Receptions': '',
                'Yards Per Catch': '',
                'Longest Reception': '',
            });
            expect(merged.academic.gpa).toBe(0);
        });

        it('should preserve stats object', () => {
            const partialData: Partial<MockPlayerData> = {
                id: 'player-123',
                firstName: 'John',
                lastName: 'Doe',
                stats: {
                    'Receiving Yards': '1250',
                    'Touchdowns': 12,
                },
            };

            const merged = mergeWithDefaults(partialData);

            expect(merged.stats).toEqual({
                'Receiving Yards': '1250',
                'Touchdowns': 12,
            });
        });

        it('should handle undefined optional fields correctly', () => {
            const partialData: Partial<MockPlayerData> = {
                id: 'player-123',
                firstName: 'John',
                lastName: 'Doe',
                age: undefined,
                profileImage: undefined,
            };

            const merged = mergeWithDefaults(partialData);

            expect(merged.age).toBeUndefined();
            expect(merged.profileImage).toBeUndefined();
        });
    });
});
