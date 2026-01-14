// Coach profile data structure
export interface CoachProfileData {
    // Basic Information
    id: string;
    firstName: string;
    lastName: string;
    email: string;

    // Professional Information
    university?: string;
    sport?: string;
    position?: string; // e.g., "Head Coach", "Assistant Coach"
    yearsExperience?: number;

    // Contact Information
    phone?: string;
    officeLocation?: string;

    // Social Media
    socialMedia?: CoachSocialMediaLinks;

    // Bio
    bio?: string;
    achievements?: string[];

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

// Social media links for coaches
export interface CoachSocialMediaLinks {
    facebook?: string;
    instagram?: string;
    twitter?: string; // X (formerly Twitter)
    linkedin?: string;
    universityProfile?: string;
}

// Props for CoachProfile component
export interface CoachProfileProps {
    coachId: string;
    coachData: CoachProfileData;
}

// Form data for coach profile updates
export interface CoachProfileFormData {
    firstName: string;
    lastName: string;
    email: string;
    university?: string;
    sport?: string;
    position?: string;
    yearsExperience?: string;
    phone?: string;
    officeLocation?: string;
    bio?: string;
    achievements?: string[];
    socialMedia?: CoachSocialMediaLinks;
}

// Validation errors
export interface ProfileValidationErrors {
    [key: string]: string;
}
