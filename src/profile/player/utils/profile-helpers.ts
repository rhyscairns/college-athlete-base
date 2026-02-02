/**
 * Profile Helper Utilities
 * 
 * Utilities for handling empty profile states and data validation
 */

import type { PlayerProfile } from '../types';
import type {
    Academic,
    Stats,
    Video,
    Achievement,
    Testimonial,
    Contact
} from '../types';

/**
 * Check if a section has meaningful data
 * 
 * @param section - The section data to check
 * @param sectionType - The type of section being checked
 * @returns true if the section has data, false if empty
 */
export function hasSectionData(
    section: any,
    sectionType: 'academic' | 'stats' | 'videos' | 'achievements' | 'testimonials' | 'contact'
): boolean {
    if (!section) {
        return false;
    }

    switch (sectionType) {
        case 'academic':
            return hasAcademicData(section as Academic);

        case 'stats':
            return hasStatsData(section as Stats);

        case 'videos':
            return Array.isArray(section) && section.length > 0;

        case 'achievements':
            return Array.isArray(section) && section.length > 0;

        case 'testimonials':
            return Array.isArray(section) && section.length > 0;

        case 'contact':
            return hasContactData(section as Contact);

        default:
            return false;
    }
}

/**
 * Check if academic section has meaningful data
 */
function hasAcademicData(academic: Academic): boolean {
    if (!academic) return false;

    // Check if any optional fields have values
    const hasOptionalData =
        academic.gpa > 0 ||
        (academic.satScore && academic.satScore > 0) ||
        (academic.actScore && academic.actScore > 0) ||
        (academic.coursework && academic.coursework.length > 0) ||
        !!academic.ncaaEligibilityCenter ||
        !!academic.classRank;

    return hasOptionalData;
}

/**
 * Check if stats section has meaningful data
 */
function hasStatsData(stats: Stats): boolean {
    if (!stats || typeof stats !== 'object') return false;

    const keys = Object.keys(stats);
    if (keys.length === 0) return false;

    // Check if any stat has a non-empty value
    return keys.some(key => {
        const value = stats[key];
        return value !== null && value !== undefined && value !== '';
    });
}

/**
 * Check if contact section has meaningful data beyond required fields
 */
function hasContactData(contact: Contact): boolean {
    if (!contact) return false;

    // Email is required, so check for additional optional fields
    const hasOptionalData =
        !!contact.phone ||
        !!contact.parentGuardianName ||
        !!contact.parentGuardianPhone ||
        !!contact.parentGuardianEmail ||
        !!contact.preferredContactMethod ||
        hasSocialMediaData(contact.socialMedia) ||
        (contact.headCoach && hasHeadCoachData(contact.headCoach));

    return hasOptionalData;
}

/**
 * Check if social media has any links
 */
function hasSocialMediaData(socialMedia: any): boolean {
    if (!socialMedia || typeof socialMedia !== 'object') return false;

    return !!(
        socialMedia.twitter ||
        socialMedia.instagram ||
        socialMedia.youtube ||
        socialMedia.tiktok
    );
}

/**
 * Check if head coach data is present
 */
function hasHeadCoachData(headCoach: any): boolean {
    if (!headCoach || typeof headCoach !== 'object') return false;

    return !!(
        headCoach.name ||
        headCoach.email ||
        headCoach.phone
    );
}

/**
 * Get an empty profile structure with default values
 * 
 * @returns A partial profile with empty/default values
 */
export function getEmptyProfile(): Partial<PlayerProfile> {
    const emptyAcademic: Academic = {
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
        classRankDetail: ''
    };

    const emptyStats: Stats = {
        'Receiving Yards': '',
        'Touchdowns': '',
        'Receptions': '',
        'Yards Per Catch': '',
        'Longest Reception': ''
    };

    const emptyContact: Contact = {
        email: '',
        phone: '',
        socialMedia: {
            twitter: '',
            instagram: '',
            youtube: '',
            tiktok: ''
        },
        headCoach: {
            name: '',
            email: '',
            phone: '',
        },
        parentGuardianName: '',
        parentGuardianPhone: '',
        parentGuardianEmail: '',
        preferredContactMethod: ''
    };

    return {
        id: '',
        firstName: '',
        lastName: '',
        initials: '',
        classYear: '',
        position: '',
        school: '',
        location: '',
        height: '',
        weight: '',
        age: undefined,
        profileImage: undefined,
        performanceMetrics: [],
        academic: emptyAcademic,
        stats: emptyStats,
        videos: [],
        achievements: [],
        coachTestimonials: [],
        contact: emptyContact,
    };
}

/**
 * Merge partial profile data with default values
 * 
 * @param data - Partial profile data from API or database
 * @returns Complete profile with defaults filled in for missing fields
 */
export function mergeWithDefaults(data: Partial<PlayerProfile>): PlayerProfile {
    const defaults = getEmptyProfile();

    const merged: any = {
        // Basic Info (required fields)
        id: data.id || defaults.id || '',
        firstName: data.firstName || defaults.firstName || '',
        lastName: data.lastName || defaults.lastName || '',
        initials: data.initials || defaults.initials || '',
        classYear: data.classYear || defaults.classYear || '',
        position: data.position || defaults.position || '',
        school: data.school || defaults.school || '',
        location: data.location || defaults.location || '',
        height: data.height || defaults.height || '',
        weight: data.weight || defaults.weight || '',

        // Optional basic fields
        performanceMetrics: data.performanceMetrics || defaults.performanceMetrics || [],

        // Academic (merge with defaults)
        academic: {
            gpa: data.academic?.gpa ?? defaults.academic?.gpa ?? 0,
            gpaScale: data.academic?.gpaScale || defaults.academic?.gpaScale || '4.0 Scale',
            coursework: data.academic?.coursework || defaults.academic?.coursework || [],
            ncaaEligibilityCenter: data.academic?.ncaaEligibilityCenter,
            ncaaQualifier: data.academic?.ncaaQualifier,
            satScore: data.academic?.satScore,
            satMath: data.academic?.satMath,
            satReading: data.academic?.satReading,
            actScore: data.academic?.actScore,
            classRank: data.academic?.classRank,
            classRankDetail: data.academic?.classRankDetail,
        },

        // Stats
        stats: (data.stats || defaults.stats || {}) as PlayerProfile['stats'],

        // Arrays (use provided or empty)
        videos: data.videos || defaults.videos || [],
        achievements: data.achievements || defaults.achievements || [],
        coachTestimonials: data.coachTestimonials || defaults.coachTestimonials || [],

        // Contact (merge with defaults)
        contact: {
            email: data.contact?.email || defaults.contact?.email || '',
            phone: data.contact?.phone || defaults.contact?.phone || '',
            parentGuardianName: data.contact?.parentGuardianName,
            parentGuardianPhone: data.contact?.parentGuardianPhone,
            parentGuardianEmail: data.contact?.parentGuardianEmail,
            preferredContactMethod: data.contact?.preferredContactMethod,
            socialMedia: {
                twitter: data.contact?.socialMedia?.twitter,
                instagram: data.contact?.socialMedia?.instagram,
                youtube: data.contact?.socialMedia?.youtube,
                tiktok: data.contact?.socialMedia?.tiktok,
            },
            headCoach: {
                name: data.contact?.headCoach?.name || defaults.contact?.headCoach?.name || '',
                email: data.contact?.headCoach?.email || defaults.contact?.headCoach?.email || '',
                phone: data.contact?.headCoach?.phone || defaults.contact?.headCoach?.phone || '',
            },
        },
    };

    // Add optional fields only if they have values
    if (data.age !== undefined) {
        merged.age = data.age;
    }
    if (data.profileImage !== undefined) {
        merged.profileImage = data.profileImage;
    }

    return merged as PlayerProfile;
}
