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
    /** Whether the player has an active CAB membership (is_cab_member) */
    isCABMember?: boolean;
    /** Current subscription status value from the DB */
    subscriptionStatus?: string;
    /** ISO string of the subscription period end date, or null */
    subscriptionPeriodEnd?: string | null;
    /** Whether the app is running in a cloud environment */
    isCloud?: boolean;
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
