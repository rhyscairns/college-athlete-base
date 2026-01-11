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
