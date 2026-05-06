// Navigation item structure
export interface NavItem {
    label: string;
    href?: string;
    onClick?: () => void;
    active?: boolean;
}

// Player navbar props
export interface PlayerNavbarProps {
    playerId: string;
}

// Player dashboard props
export interface PlayerDashboardProps {
    playerId: string;
}

/** Stats returned by GET /api/player/[playerId]/stats */
export interface PlayerStats {
    profileViews: number;
    coachesFavorited: number;
    playersReferred: number;
    coachesReferred: number;
    promoCode: string | null;
}

/** Props for the StatTile sub-component in PlayerDashboardHeader */
export interface StatTileProps {
    label: string;
    value: number;
    isLoading: boolean;
    accent?: 'brand' | 'amber' | 'danger';
}

/** Props for the PlayerDashboardHeader component */
export interface PlayerDashboardHeaderProps {
    playerId: string;
}
