// Player card props - shared between coach and player dashboards
export interface PlayerCardProps {
    playerId: string;
    firstName: string;
    lastName: string;
    position: string;
    sport: string;
    videoThumbnail?: string;
    profileImage?: string;
    status?: 'available' | 'interested' | 'contacted';
    height?: string;
    weight?: string;
    primaryButtonLabel?: string;
    secondaryButtonLabel?: string;
    onPrimaryClick?: () => void;
    onSecondaryClick?: () => void;
    priority?: boolean; // For image loading optimization
}

// Extended player card data interface
export interface PlayerCardData extends PlayerCardProps {
    // Inherits all PlayerCardProps properties
}

// Dashboard state interface for managing dashboard state
export interface DashboardState {
    // User info
    userId: string;
    userType: 'coach' | 'player';
    userSport?: string;

    // Filter state
    selectedSport: string;
    selectedPosition: string;

    // Data state
    players: PlayerCardData[];
    isLoading: boolean;
    error: string | null;

    // Pagination state
    currentPage: number;
    totalPages: number;
    pageSize: number;
}
