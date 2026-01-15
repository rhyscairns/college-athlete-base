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

// Section Component Props
export interface BasicInformationSectionProps {
    formData: PlayerProfileFormData;
    setFormData: React.Dispatch<React.SetStateAction<PlayerProfileFormData>>;
    errors?: ProfileValidationErrors;
    handleBlur?: (field: string, value: string | undefined | null) => void;
    isEditing: boolean;
}

export interface PhysicalAttributesSectionProps {
    formData: PlayerProfileFormData;
    setFormData: React.Dispatch<React.SetStateAction<PlayerProfileFormData>>;
    errors?: ProfileValidationErrors;
    handleBlur?: (field: string, value: string | undefined | null) => void;
    isEditing: boolean;
}

export interface AcademicInformationSectionProps {
    formData: PlayerProfileFormData;
    setFormData: React.Dispatch<React.SetStateAction<PlayerProfileFormData>>;
    errors?: ProfileValidationErrors;
    handleBlur?: (field: string, value: string | undefined | null) => void;
    isEditing: boolean;
}

export interface AthleticInformationSectionProps {
    formData: PlayerProfileFormData;
    setFormData: React.Dispatch<React.SetStateAction<PlayerProfileFormData>>;
    errors?: ProfileValidationErrors;
    handleBlur?: (field: string, value: string | undefined | null) => void;
    isEditing: boolean;
}

export interface StatsSectionProps {
    formData: PlayerProfileFormData;
    setFormData: React.Dispatch<React.SetStateAction<PlayerProfileFormData>>;
    errors?: ProfileValidationErrors;
    handleBlur?: (field: string, value: string | undefined | null) => void;
    isEditing: boolean;
}

export interface RecruitmentSectionProps {
    formData: PlayerProfileFormData;
    setFormData: React.Dispatch<React.SetStateAction<PlayerProfileFormData>>;
    errors?: ProfileValidationErrors;
    handleBlur?: (field: string, value: string | undefined | null) => void;
    isEditing: boolean;
}

export interface ContactInformationSectionProps {
    formData: PlayerProfileFormData;
    setFormData: React.Dispatch<React.SetStateAction<PlayerProfileFormData>>;
    errors?: ProfileValidationErrors;
    handleBlur?: (field: string, value: string | undefined | null) => void;
    isEditing: boolean;
}

export interface VideosSectionProps {
    formData: PlayerProfileFormData;
    setFormData: React.Dispatch<React.SetStateAction<PlayerProfileFormData>>;
    errors?: ProfileValidationErrors;
    handleBlur?: (field: string, value: string | undefined | null) => void;
    isEditing: boolean;
}

export interface VideoItemProps {
    video: VideoLink;
    index: number;
    isEditing: boolean;
    errors?: ProfileValidationErrors;
    onUpdate: (index: number, field: keyof VideoLink, value: string | boolean) => void;
    onRemove: (index: number) => void;
    onBlur?: (field: string, value: string) => void;
}

export interface SocialMediaSectionProps {
    formData: PlayerProfileFormData;
    setFormData: React.Dispatch<React.SetStateAction<PlayerProfileFormData>>;
    errors?: ProfileValidationErrors;
    handleBlur?: (field: string, value: string | undefined | null) => void;
    isEditing: boolean;
}
