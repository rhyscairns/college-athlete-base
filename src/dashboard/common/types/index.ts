/**
 * Player card component props
 * 
 * Shared interface for displaying player information in card format
 * across coach and player dashboards.
 * 
 * @example
 * ```tsx
 * <PlayerCard
 *   playerId="player-123"
 *   firstName="John"
 *   lastName="Smith"
 *   position="Point Guard"
 *   sport="Basketball"
 *   currentUserId="coach-456"
 *   userType="coach"
 * />
 * ```
 */
export interface PlayerCardProps {
    /** Unique identifier for the player */
    playerId: string;
    /** Player's first name */
    firstName: string;
    /** Player's last name */
    lastName: string;
    /** Player's position or role in their sport */
    position: string;
    /** Sport the player participates in */
    sport: string;
    /** Optional URL to video thumbnail image */
    videoThumbnail?: string;
    /** Optional URL to player's profile image */
    profileImage?: string;
    /** Optional recruitment status badge */
    status?: 'available' | 'interested' | 'contacted';
    /** Optional height display (e.g., "6'2\"") */
    height?: string;
    /** Optional weight display (e.g., "210 lbs") */
    weight?: string;
    /** Custom label for primary action button (default: "View Profile") */
    primaryButtonLabel?: string;
    /** Optional callback for primary button click (renders button instead of link) */
    onPrimaryClick?: () => void;
    /** Optional callback for video play button */
    onWatchVideo?: () => void;
    /** Optional label for secondary action button */
    secondaryButtonLabel?: string;
    /** Optional callback for secondary button click */
    onSecondaryClick?: () => void;
    /** Image loading priority for above-the-fold cards */
    priority?: boolean;
    /** Current logged-in user ID for routing */
    currentUserId?: string;
    /** Type of current user for routing and button labels */
    userType?: 'coach' | 'player';
}

/**
 * Extended player card data interface
 * 
 * Extends PlayerCardProps with additional video metadata
 * used for video modal integration.
 */
export interface PlayerCardData extends PlayerCardProps {
    /** Optional URL to player's highlight video */
    videoUrl?: string;
    /** Optional title for the highlight video */
    videoTitle?: string;
}

/**
 * Dashboard state interface
 * 
 * Centralized state management for coach and player dashboards.
 * Includes user info, filters, data, and pagination state.
 * 
 * @example
 * ```tsx
 * const [state, setState] = useState<DashboardState>({
 *   userId: 'coach-123',
 *   userType: 'coach',
 *   selectedSport: 'Basketball',
 *   selectedPosition: 'All Positions',
 *   players: [],
 *   isLoading: false,
 *   error: null,
 *   currentPage: 1,
 *   totalPages: 1,
 *   pageSize: 6
 * });
 * ```
 */
export interface DashboardState {
    // User info
    /** Current user's unique identifier */
    userId: string;
    /** Type of current user */
    userType: 'coach' | 'player';
    /** Optional sport associated with the user */
    userSport?: string;

    // Filter state
    /** Currently selected sport filter */
    selectedSport: string;
    /** Currently selected position filter */
    selectedPosition: string;

    // Data state
    /** Array of player card data to display */
    players: PlayerCardData[];
    /** Loading state for data fetching */
    isLoading: boolean;
    /** Error message if data fetch fails */
    error: string | null;

    // Pagination state
    /** Current page number (1-indexed) */
    currentPage: number;
    /** Total number of pages available */
    totalPages: number;
    /** Number of items per page */
    pageSize: number;
}

/**
 * Video modal state interface
 * 
 * Manages the state of the video modal component including
 * visibility and video metadata.
 */
export interface VideoModalState {
    /** Whether the modal is currently open */
    isOpen: boolean;
    /** URL of the video to display (null when closed) */
    videoUrl: string | null;
    /** Optional title of the video */
    videoTitle: string | null;
    /** Optional name of the player in the video */
    playerName: string | null;
}

/**
 * Video modal component props
 * 
 * Props for the VideoModal component that displays
 * player highlight videos in a modal overlay.
 * 
 * @example
 * ```tsx
 * <VideoModal
 *   isOpen={true}
 *   onClose={() => setModalOpen(false)}
 *   videoUrl="https://youtube.com/watch?v=..."
 *   videoTitle="Championship Game Highlights"
 *   playerName="John Smith"
 * />
 * ```
 */
export interface VideoModalProps {
    /** Whether the modal is currently open */
    isOpen: boolean;
    /** Callback function to close the modal */
    onClose: () => void;
    /** URL of the video to display */
    videoUrl: string;
    /** Optional title of the video */
    videoTitle?: string;
    /** Optional name of the player in the video */
    playerName?: string;
}

/**
 * Player card grid component props
 * 
 * Props for the PlayerCardGrid component that displays
 * a responsive grid of player cards with loading and empty states.
 * 
 * @example
 * ```tsx
 * <PlayerCardGrid
 *   players={playerData}
 *   currentUserId="coach-123"
 *   userType="coach"
 *   isLoading={false}
 *   emptyMessage="No players found"
 *   onWatchVideo={(id, url, title, name) => openVideoModal(url)}
 * />
 * ```
 */
export interface PlayerCardGridProps {
    /** Array of player data to display in the grid */
    players: PlayerCardData[];
    /** Current logged-in user ID (filtered out from display) */
    currentUserId: string;
    /** Type of current user for button labels and routing */
    userType: 'coach' | 'player';
    /** Whether data is currently loading (shows skeletons) */
    isLoading?: boolean;
    /** Custom message to show when no players found */
    emptyMessage?: string;
    /** Callback when video play button is clicked */
    onWatchVideo?: (playerId: string, videoUrl: string, videoTitle?: string, playerName?: string) => void;
}

/**
 * Player info section component props
 * 
 * Props for the PlayerInfoSection component that displays
 * player name, position, sport, and physical stats.
 */
export interface PlayerInfoSectionProps {
    /** Full name of the player */
    playerName: string;
    /** Player's position or role */
    position: string;
    /** Sport the player participates in */
    sport: string;
    /** Optional height display (e.g., "6'2\"") */
    height?: string;
    /** Optional weight display (e.g., "210 lbs") */
    weight?: string;
}

/**
 * Player media display component props
 * 
 * Props for the PlayerMediaDisplay component that shows
 * video thumbnails, profile images, or initials fallback.
 */
export interface PlayerMediaDisplayProps {
    /** Optional URL to video thumbnail image */
    videoThumbnail?: string;
    /** Optional URL to player's profile image */
    profileImage?: string;
    /** Full name of the player for alt text */
    playerName: string;
    /** Player's initials for fallback display */
    initials: string;
    /** Image loading priority for above-the-fold content */
    priority?: boolean;
    /** Optional callback for video play button */
    onWatchVideo?: () => void;
}
