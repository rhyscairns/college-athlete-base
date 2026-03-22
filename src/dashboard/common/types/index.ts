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
    onWatchVideo?: () => void;
    priority?: boolean; // For image loading optimization
}

// Extended player card data interface
export interface PlayerCardData extends PlayerCardProps {
    videoUrl?: string;
    videoTitle?: string;
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

// Video modal state interface for managing modal state
export interface VideoModalState {
    isOpen: boolean;
    videoUrl: string | null;
    videoTitle: string | null;
    playerName: string | null;
}

// Video modal component props
export interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl: string;
    videoTitle?: string;
    playerName?: string;
}

// Player card grid props
export interface PlayerCardGridProps {
    players: PlayerCardData[];
    currentUserId: string;
    userType: 'coach' | 'player';
    isLoading?: boolean;
    emptyMessage?: string;
    onWatchVideo?: (playerId: string, videoUrl: string, videoTitle?: string, playerName?: string) => void;
}
