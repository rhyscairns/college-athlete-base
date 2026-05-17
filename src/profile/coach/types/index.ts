// Achievement structure
export interface Achievement {
    title: string;
    year?: number;
}

// Core coach profile data structure
export interface CoachProfile {
    id: string;
    firstName: string;
    lastName: string;
    initials: string;
    email: string;
    phone?: string;
    university?: string;
    position?: string;
    sport?: string;
    yearsExperience?: number;
    profileImage?: string;
    teamWebsiteUrl?: string;
    // University information
    universityLogoUrl?: string;
    conference?: string;
    division?: string;
    teamName?: string;
    // Office information
    officeLocation?: string;
    officeHours?: string;
    // Financials
    scholarshipBudget?: number;
    annualCostPerPlayer?: number;
    // Achievements
    achievements?: Achievement[];
    createdAt: Date;
    updatedAt: Date;
}

// View component props
export interface CoachProfileViewProps {
    coachId: string;
    currentUserId?: string;
    initialData: CoachProfile;
    onDataUpdate?: (updatedData: Partial<CoachProfile>) => void;
}

export interface CoachHeroSectionProps {
    coach: CoachProfile;
    isOwner?: boolean;
    isEditing?: boolean;
    onEdit?: () => void;
    onSave?: (updatedData: Partial<CoachProfile>) => void;
    onCancel?: () => void;
}

// Edit component props
export interface CoachHeroSectionEditProps {
    formData: CoachProfile;
    setFormData: React.Dispatch<React.SetStateAction<CoachProfile>>;
    errors: ValidationErrors;
    isSaving: boolean;
    onSave: () => void;
    onCancel: () => void;
}

// Validation
export type ValidationErrors = Record<string, string>;

// API Response types
export interface CoachProfileApiResponse {
    success: boolean;
    data?: CoachProfile;
    error?: string;
    validationErrors?: ValidationErrors;
}
