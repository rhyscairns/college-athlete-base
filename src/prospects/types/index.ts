/**
 * Prospect player data returned from the prospects API
 */
export interface ProspectPlayerData {
    playerId: string;
    firstName: string;
    lastName: string;
    sport: string | null;
    position: string | null;
    gpa: number | null;
    highSchool: string | null;
    scholarshipAmount: number | null;
    videoUrl: string | null;
    videoTitle: string | null;
    profileImage: string | null;
}

/**
 * Props for the ProspectsTable component
 */
export interface ProspectsTableProps {
    prospects: ProspectPlayerData[];
    coachId: string;
}
