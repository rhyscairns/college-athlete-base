/**
 * Shared types for player profile view and edit components
 * These types are used by both view and edit components to ensure consistency
 */

// ============================================
// Core Data Types (used by both view and edit)
// ============================================

export interface SocialMedia {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
}

export interface HeadCoach {
    name: string;
    email: string;
    phone: string;
}

export interface Contact {
    email: string;
    phone: string;
    parentGuardianName?: string;
    parentGuardianPhone?: string;
    parentGuardianEmail?: string;
    socialMedia: SocialMedia;
    preferredContactMethod?: string;
    headCoach: HeadCoach;
}

export interface Video {
    id: string;
    title: string;
    description?: string;
    url: string;
    thumbnail?: string;
    duration?: string;
    isFeatured?: boolean;
    date?: string;
}

export interface Achievement {
    id: string;
    icon: string;
    title: string;
    description: string;
    color: string;
}

export interface Testimonial {
    id: string;
    quote: string;
    coachName: string;
    coachTitle: string;
    coachOrganization: string;
}

export interface PerformanceMetric {
    label: string;
    value: string;
}

export interface Hero {
    firstName: string;
    lastName: string;
    initials: string;
    position: string;
    school: string;
    location: string;
    classYear: string;
    height: string;
    weight: string;
    age?: number;
    profileImage?: string;
    performanceMetrics?: PerformanceMetric[];
}

export interface Academic {
    ncaaEligibilityCenter?: string;
    ncaaQualifier?: boolean;
    gpa: number;
    gpaScale: string;
    satScore?: number;
    satMath?: number;
    satReading?: number;
    actScore?: number;
    classRank?: string;
    classRankDetail?: string;
    coursework: string[];
}

export interface Stats {
    [key: string]: number | string;
}

// ============================================
// Validation
// ============================================

export type ValidationErrors = Record<string, string>;

// ============================================
// Player Profile Data (complete structure)
// ============================================

export interface PlayerProfile {
    id: string;
    firstName: string;
    lastName: string;
    initials: string;
    classYear: string;
    position: string;
    school: string;
    location: string;
    height: string;
    weight: string;
    age?: number;
    profileImage?: string;
    performanceMetrics?: PerformanceMetric[];
    academic: Academic;
    stats: Stats;
    videos: Video[];
    achievements: Achievement[];
    coachTestimonials: Testimonial[];
    contact: Contact;
    recruitmentStatus?: string;
    commitmentStatus?: string | null;
}

// ============================================
// Input Component Props
// ============================================

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

export interface HeroSectionProps {
    player: PlayerProfile;
    isOwner?: boolean;
    isEditing?: boolean;
    isAnyOtherSectionEditing?: boolean;
    onEdit?: () => void;
    onSave?: (updatedData: Partial<PlayerProfile>) => void;
    onCancel?: () => void;
}

export interface StatsShowcaseProps {
    stats: PlayerProfile['stats'];
    isOwner?: boolean;
    isEditing?: boolean;
    isAnyOtherSectionEditing?: boolean;
    onEdit?: () => void;
    onSave?: (updatedData: Partial<PlayerProfile>) => void;
    onCancel?: () => void;
}

export interface AthleticAchievementsSectionProps {
    achievements: PlayerProfile['achievements'];
    isOwner?: boolean;
    isEditing?: boolean;
    isAnyOtherSectionEditing?: boolean;
    onEdit?: () => void;
    onSave?: (updatedData: Partial<PlayerProfile>) => void;
    onCancel?: () => void;
}

export interface AcademicProfileSectionProps {
    academic: PlayerProfile['academic'];
    isOwner?: boolean;
    isEditing?: boolean;
    isAnyOtherSectionEditing?: boolean;
    onEdit?: () => void;
    onSave?: (updatedData: Partial<PlayerProfile>) => void;
    onCancel?: () => void;
}

export interface GameHighlightsSectionProps {
    videos: PlayerProfile['videos'];
    isOwner?: boolean;
    isEditing?: boolean;
    isAnyOtherSectionEditing?: boolean;
    onEdit?: () => void;
    onSave?: (updatedData: Partial<PlayerProfile>) => void;
    onCancel?: () => void;
}

export interface CoachesPerspectiveSectionProps {
    testimonials: PlayerProfile['coachTestimonials'];
    isOwner?: boolean;
    isEditing?: boolean;
    isAnyOtherSectionEditing?: boolean;
    onEdit?: () => void;
    onSave?: (updatedData: Partial<PlayerProfile>) => void;
    onCancel?: () => void;
}

export interface RecruitingContactSectionProps {
    contact: PlayerProfile['contact'];
    isOwner?: boolean;
    isEditing?: boolean;
    isAnyOtherSectionEditing?: boolean;
    onEdit?: () => void;
    onSave?: (updatedData: Partial<PlayerProfile>) => void;
    onCancel?: () => void;
}

export interface PlayerProfileViewProps {
    playerId: string;
    currentUserId?: string;
    initialData: PlayerProfile;
    onDataUpdate?: (updatedData: Partial<PlayerProfile>) => void;
}

// Legacy type alias for backwards compatibility
// TODO: Remove this once all references are updated
export type MockPlayerData = PlayerProfile;

// ============================================
// Edit Component Props Interfaces
// ============================================

export interface HeroSectionEditProps {
    formData: Hero;
    setFormData: React.Dispatch<React.SetStateAction<Hero>>;
    errors: ValidationErrors;
    isSaving: boolean;
    onSave: () => void;
    onCancel: () => void;
}

export interface StatsShowcaseEditProps {
    formData: Stats;
    setFormData: React.Dispatch<React.SetStateAction<Stats>>;
    errors: ValidationErrors;
    isSaving: boolean;
    onSave: () => void;
    onCancel: () => void;
}

export interface AthleticAchievementsSectionEditProps {
    formData: Achievement[];
    setFormData: React.Dispatch<React.SetStateAction<Achievement[]>>;
    errors: ValidationErrors;
    isSaving: boolean;
    onSave: () => void;
    onCancel: () => void;
}

export interface AcademicProfileSectionEditProps {
    formData: Academic;
    setFormData: React.Dispatch<React.SetStateAction<Academic>>;
    errors: ValidationErrors;
    isSaving: boolean;
    onSave: () => void;
    onCancel: () => void;
}

export interface GameHighlightsSectionEditProps {
    formData: Video[];
    setFormData: React.Dispatch<React.SetStateAction<Video[]>>;
    errors: ValidationErrors;
    isSaving: boolean;
    onSave: () => void;
    onCancel: () => void;
}

export interface CoachesPerspectiveSectionEditProps {
    formData: Testimonial[];
    setFormData: React.Dispatch<React.SetStateAction<Testimonial[]>>;
    errors: ValidationErrors;
    isSaving: boolean;
    onSave: () => void;
    onCancel: () => void;
}

export interface RecruitingContactSectionEditProps {
    formData: Contact;
    setFormData: React.Dispatch<React.SetStateAction<Contact>>;
    errors: ValidationErrors;
    isSaving: boolean;
    onSave: () => void;
    onCancel: () => void;
}

export interface ActionButtonsProps {
    onSave: () => void;
    onCancel: () => void;
    isSaving: boolean;
    disabled?: boolean;
}
