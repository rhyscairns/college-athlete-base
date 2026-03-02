// Player card props - shared between coach and player dashboards
export interface PlayerCardProps {
    playerId: string;
    firstName: string;
    lastName: string;
    position: string;
    sport: string;
    videoThumbnail?: string;
    profileImage?: string;
}
