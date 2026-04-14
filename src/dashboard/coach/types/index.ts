// Navigation item structure
export interface NavItem {
    label: string;
    href?: string;
    onClick?: () => void;
    active?: boolean;
}

// Coach navbar props
export interface CoachNavbarProps {
    coachId: string;
}

// Coach dashboard props
export interface CoachDashboardProps {
    coachId: string;
}

// Search criteria for athlete search
export interface SearchCriteria {
    sport?: string;
    position?: string;
    desiredDivision?: string;
    gpaMin?: number;
    gpaMax?: number;
    affordableAmount?: number;
    heightMin?: string; // Format: "5'10"" or "70" (inches)
    heightMax?: string;
    weightMin?: number; // pounds
    weightMax?: number;
}

// Search response from API
export interface SearchResponse {
    athletes: PlayerProfile[];
    totalCount: number;
    page: number;
    pageSize: number;
    filters: SearchCriteria;
}

// Player profile structure (for search results)
export interface PlayerProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    sport: string;
    position: string;
    desiredDivision?: string;
    gpa: number;
    heightInches: number;
    weightLbs: number;
    affordableAmount?: number;
    profileImageUrl?: string;
    videoUrl?: string;
}

// Athlete search modal props
export interface AthleteSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    coachId: string;
}

// Athlete search form props
export interface AthleteSearchFormProps {
    onSubmit: (criteria: SearchCriteria) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

// Form validation errors
export interface FormErrors {
    gpa?: string;
    height?: string;
    weight?: string;
    affordableAmount?: string;
    general?: string;
}

// Search filters bar props
export interface SearchFiltersBarProps {
    criteria: SearchCriteria;
    onFilterChange: (criteria: SearchCriteria) => void;
    onClearAll: () => void;
}

// Athlete search results props
export interface AthleteSearchResultsProps {
    athletes: PlayerProfile[];
    isLoading: boolean;
    totalCount: number;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}
