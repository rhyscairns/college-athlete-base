import type { MouseEvent } from 'react';

/** Stats returned by GET /api/coach/[coachId]/stats */
export interface CoachStats {
    prospectsCount: number;
    newPlayersToday: number;
    scholarshipsOffered: number;
    scholarshipsAccepted: number;
    playersReferred: number;
    coachesReferred: number;
    promoCode: string | null;
}

/** Props for the StatTile sub-component in CoachDashboardHeader */
export interface StatTileProps {
    label: string;
    value: number;
    isLoading: boolean;
    accent?: 'brand' | 'amber' | 'danger';
}

/** Props for the CoachDashboardHeader component */
export interface CoachDashboardHeaderProps {
    coachId: string;
    /** Live override for prospects count — updated optimistically by parent on favorite toggle */
    prospectsCountOverride?: number;
}

/** Navigation item structure for coach nav menus */
export interface NavItem {
    label: string;
    href?: string;
    onClick?: () => void;
    active?: boolean;
}

/** Props for the CoachNavbar component */
export interface CoachNavbarProps {
    coachId: string;
}

/** Internal nav sub-component props (shared between DesktopNav and MobileDropdown) */
export interface NavProps {
    coachId: string;
    onSearchClick: (e: MouseEvent) => void;
    onProspectsClick: (e: MouseEvent) => void;
    onMessagesClick: (e: MouseEvent) => void;
    onProfileClick: (e: MouseEvent) => void;
    onLogout: () => void;
}

/** Props for the CoachDashboard component */
export interface CoachDashboardProps {
    coachId: string;
}

/**
 * Search criteria for athlete search modal.
 * All fields are optional — omitted fields are not applied as filters.
 */
export interface SearchCriteria {
    sport?: string;
    position?: string;
    desiredDivision?: string;
    gpaMin?: number;
    gpaMax?: number;
    affordableAmount?: number;
    /** Format: "5'10\"" or "70" (inches) */
    heightMin?: string;
    heightMax?: string;
    /** pounds */
    weightMin?: number;
    weightMax?: number;
}

/** Paginated response from the athlete search API */
export interface SearchResponse {
    athletes: PlayerProfile[];
    totalCount: number;
    page: number;
    pageSize: number;
    filters: SearchCriteria;
}

/**
 * Player profile shape returned by the athlete search API.
 * Note: consider renaming to `AthleteSearchResult` to avoid confusion with profile-domain types.
 */
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
    videoThumbnailUrl?: string;
    videoUrl?: string;
}

/** Props for the AthleteSearchModal component */
export interface AthleteSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    coachId: string;
}

/** Props for the AthleteSearchForm component */
export interface AthleteSearchFormProps {
    onSubmit: (criteria: SearchCriteria) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

/** Field-level validation errors for the athlete search form */
export interface FormErrors {
    gpa?: string;
    height?: string;
    weight?: string;
    affordableAmount?: string;
    general?: string;
}

/** Props for the SearchFiltersBar component */
export interface SearchFiltersBarProps {
    criteria: SearchCriteria;
    onFilterChange: (criteria: SearchCriteria) => void;
    onClearAll: () => void;
    onRefineSearch?: () => void;
}

/** Props for the AthleteSearchResults component */
export interface AthleteSearchResultsProps {
    athletes: PlayerProfile[];
    isLoading: boolean;
    totalCount: number;
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    /** Coach ID — used to build the correct coach-scoped player profile URL */
    coachId?: string;
    /** Set of player IDs the coach has already favorited */
    favoritedPlayerIds?: Set<string>;
    /** Callback when the heart icon is toggled on a card */
    onFavoriteToggle?: (playerId: string, currentState: boolean) => void | Promise<void>;
    /** Callback when the video play button is clicked */
    onWatchVideo?: (playerId: string, videoUrl: string, videoTitle?: string, playerName?: string) => void;
}

/** Shape returned by GET /api/dashboard/players */
export interface DashboardPlayerApiResponse {
    id: string;
    firstName: string;
    lastName: string;
    sport: string;
    position: string;
    profileImage?: string;
    videoThumbnail?: string;
    videoUrl?: string;
    videoTitle?: string;
    hasAcceptedOffer?: boolean;
}
