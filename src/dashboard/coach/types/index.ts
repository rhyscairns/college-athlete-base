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
