// Player profile data structure
export interface PlayerProfileData {
    // Basic Information (from registration)
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    sex: string;
    sport: string;
    position: string;
    gpa: number;
    country: string;
    state?: string;
    region?: string;
    scholarshipAmount?: number;
    testScores?: string;

    // Physical Attributes
    height?: string; // e.g., "6'2\"" or "188 cm"
    weight?: string; // e.g., "180 lbs" or "82 kg"

    // Athletic Information
    clubTeam?: string;
    highSchool?: string;
    stats?: PlayerStats;

    // Academic Information
    graduationYear?: number;
    major?: string;
    intendedMajor?: string;
    classRank?: string;
    honors?: string[];

    // Athletic History
    previousTeams?: string[];
    championships?: string[];
    allStarSelections?: string[];

    // Recruitment Information
    availableDate?: string;
    preferredRegions?: string[];
    scholarshipNeeds?: string;
    recruitmentStatus?: 'open' | 'committed' | 'not-looking';

    // Contact Information
    phone?: string;
    parentGuardianName?: string;
    parentGuardianPhone?: string;
    parentGuardianEmail?: string;
    coachReferences?: CoachReference[];

    // Media
    videos?: VideoLink[];

    // Social Media
    socialMedia?: SocialMediaLinks;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

// Player statistics
export interface PlayerStats {
    pointsPerGame?: number;
    assistsPerGame?: number;
    reboundsPerGame?: number;
    fieldGoalPercentage?: number;
    threePointPercentage?: number;
    freeThrowPercentage?: number;
    // Add more sport-specific stats as needed
    customStats?: Record<string, string | number>;
}

// Video link structure
export interface VideoLink {
    id: string;
    url: string;
    title?: string;
    description?: string;
    isMain: boolean; // One video should be marked as main
    order: number; // For ordering videos (1-5)
}

// Social media links
export interface SocialMediaLinks {
    facebook?: string;
    instagram?: string;
    twitter?: string; // X (formerly Twitter)
    tiktok?: string;
    linkedin?: string;
    youtube?: string;
}

// Coach reference structure
export interface CoachReference {
    id: string;
    name: string;
    title?: string;
    organization?: string;
    phone?: string;
    email?: string;
}

// Props for PlayerProfile component
export interface PlayerProfileProps {
    playerId: string;
    playerData: PlayerProfileData;
}

// Form data for profile updates
export interface PlayerProfileFormData {
    firstName: string;
    lastName: string;
    email: string;
    sex: string;
    sport: string;
    position: string;
    gpa: string;
    country: string;
    state?: string;
    region?: string;
    scholarshipAmount?: string;
    testScores?: string;
    height?: string;
    weight?: string;
    clubTeam?: string;
    highSchool?: string;
    stats?: Partial<PlayerStats>;
    graduationYear?: string;
    major?: string;
    intendedMajor?: string;
    classRank?: string;
    honors?: string[];
    previousTeams?: string[];
    championships?: string[];
    allStarSelections?: string[];
    availableDate?: string;
    preferredRegions?: string[];
    scholarshipNeeds?: string;
    recruitmentStatus?: 'open' | 'committed' | 'not-looking';
    phone?: string;
    parentGuardianName?: string;
    parentGuardianPhone?: string;
    parentGuardianEmail?: string;
    coachReferences?: CoachReference[];
    videos?: VideoLink[];
    socialMedia?: SocialMediaLinks;
}

// Validation errors
export interface ProfileValidationErrors {
    [key: string]: string;
}

// ============================================
// Component Props Interfaces
// ============================================

// Input Component Props
export interface TextInputProps {
    label: string;
    name: string;
    type?: 'text' | 'number' | 'date' | 'tel';
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: string;
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
    min?: number;
    max?: number;
    step?: number;
}

export interface SelectInputProps {
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: string;
    options: ReadonlyArray<{ readonly value: string; readonly label: string }>;
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
}

export interface EmailInputProps {
    label?: string;
    name?: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
}

export interface SubmitButtonProps {
    loading?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit';
}

// ============================================
// View Component Props Interfaces
// ============================================

import type { MockPlayerData } from '../data/mockPlayerData';

// Re-export MockPlayerData for convenience
export type { MockPlayerData };

export interface HeroSectionProps {
    player: MockPlayerData;
    isOwner?: boolean;
    isEditing?: boolean;
    isAnyOtherSectionEditing?: boolean;
    onEdit?: () => void;
    onSave?: (updatedData: Partial<MockPlayerData>) => void;
    onCancel?: () => void;
}

export interface StatsShowcaseProps {
    stats: MockPlayerData['stats'];
    isOwner?: boolean;
    isEditing?: boolean;
    isAnyOtherSectionEditing?: boolean;
    onEdit?: () => void;
    onSave?: (updatedData: Partial<MockPlayerData>) => void;
    onCancel?: () => void;
}

export interface AthleticAchievementsSectionProps {
    achievements: MockPlayerData['achievements'];
    isOwner?: boolean;
    isEditing?: boolean;
    isAnyOtherSectionEditing?: boolean;
    onEdit?: () => void;
    onSave?: (updatedData: Partial<MockPlayerData>) => void;
    onCancel?: () => void;
}

export interface AcademicProfileSectionProps {
    academic: MockPlayerData['academic'];
    isOwner?: boolean;
    isEditing?: boolean;
    isAnyOtherSectionEditing?: boolean;
    onEdit?: () => void;
    onSave?: (updatedData: Partial<MockPlayerData>) => void;
    onCancel?: () => void;
}

export interface GameHighlightsSectionProps {
    videos: MockPlayerData['videos'];
    isOwner?: boolean;
    isEditing?: boolean;
    isAnyOtherSectionEditing?: boolean;
    onEdit?: () => void;
    onSave?: (updatedData: Partial<MockPlayerData>) => void;
    onCancel?: () => void;
}

export interface CoachesPerspectiveSectionProps {
    testimonials: MockPlayerData['coachTestimonials'];
    isOwner?: boolean;
    isEditing?: boolean;
    isAnyOtherSectionEditing?: boolean;
    onEdit?: () => void;
    onSave?: (updatedData: Partial<MockPlayerData>) => void;
    onCancel?: () => void;
}

export interface RecruitingContactSectionProps {
    contact: MockPlayerData['contact'];
    isOwner?: boolean;
    isEditing?: boolean;
    isAnyOtherSectionEditing?: boolean;
    onEdit?: () => void;
    onSave?: (updatedData: Partial<MockPlayerData>) => void;
    onCancel?: () => void;
}

// ============================================
// Inline Editing Type Definitions
// ============================================

// Validation errors type
export type ValidationErrors = Record<string, string>;

// Hero Section Data
export interface HeroData {
    firstName: string;
    lastName: string;
    position: string;
    school: string;
    location: string;
    classYear: string;
    height: string;
    weight: string;
}

// Academic Section Data
export interface AcademicData {
    gpa: number;
    gpaScale: string;
    satScore?: number;
    satMath?: number;
    satReading?: number;
    actScore?: number;
    classRank: string;
    classRankDetail: string;
    ncaaEligibilityCenter: string;
    ncaaQualifier: boolean;
    coursework: string[];
}

// Stats Section Data
export interface StatsData {
    stats: Record<string, number | string>;
}

// Videos Section Data
export interface VideosData {
    videos: Array<{
        id: string;
        title: string;
        url: string;
        thumbnail?: string;
    }>;
}

// Contact Section Data
export interface ContactData {
    email: string;
    phone: string;
    parentGuardianName?: string;
    parentGuardianPhone?: string;
    parentGuardianEmail?: string;
    socialMedia: {
        twitter?: string;
        instagram?: string;
        youtube?: string;
        tiktok?: string;
    };
    preferredContactMethod: string;
}

// Achievements Section Data
export interface AchievementsData {
    achievements: Array<{
        id: string;
        title: string;
        description: string;
        date: string;
    }>;
}

// Testimonials Section Data
export interface TestimonialsData {
    coachTestimonials: Array<{
        id: string;
        coachName: string;
        coachTitle: string;
        testimonial: string;
        date: string;
    }>;
}

// Union type for all section data types
export type SectionData =
    | HeroData
    | AcademicData
    | StatsData
    | VideosData
    | ContactData
    | AchievementsData
    | TestimonialsData;

// Editable Section Props
export interface EditableSectionProps<T = SectionData> {
    data: T;
    isOwner: boolean;
    isEditing: boolean;
    isAnyOtherSectionEditing: boolean;
    onEdit: () => void;
    onSave: (updatedData: T) => void;
    onCancel: () => void;
}

// Player Profile View Props
export interface PlayerProfileViewProps {
    playerId: string;
    currentUserId?: string;
    initialData: MockPlayerData;
    onDataUpdate?: (updatedData: Partial<MockPlayerData>) => void;
}
