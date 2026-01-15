import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/authentication/utils/jwt';
import { getPlayerById } from '@/authentication/db/players';
import PlayerProfile from '@/profile/player/components/PlayerProfile';
import type { PlayerProfileData } from '@/profile/player/types';

interface PlayerProfilePageProps {
    params: Promise<{
        playerId: string;
    }>;
}

/**
 * Player Profile Page
 * Protected route that requires valid session
 * Allows player to view and edit their profile information
 */
export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
    const { playerId } = await params;

    // Get session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    // Redirect to login if no session
    if (!sessionCookie) {
        redirect('/login');
    }

    // Verify token
    const tokenPayload = await verifyToken(sessionCookie.value);

    // Redirect if token is invalid or not a player token
    if (!tokenPayload || tokenPayload.type !== 'player') {
        redirect('/login');
    }

    // Verify the playerId in the URL matches the token
    if (tokenPayload.playerId !== playerId) {
        redirect('/login');
    }

    // Get player data from database
    const player = await getPlayerById(playerId);

    // Redirect if player not found
    if (!player) {
        redirect('/login');
    }

    // Transform database record to profile data
    const playerProfileData: PlayerProfileData = {
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        email: player.email,
        sex: player.sex,
        sport: player.sport,
        position: player.position,
        gpa: player.gpa,
        country: player.country,
        state: player.state || undefined,
        region: player.region || undefined,
        scholarshipAmount: player.scholarshipAmount || undefined,
        testScores: player.testScores || undefined,
        createdAt: player.createdAt,
        updatedAt: player.updatedAt,
        // New fields will be undefined until database is updated
        height: undefined,
        weight: undefined,
        clubTeam: undefined,
        highSchool: undefined,
        stats: undefined,
        graduationYear: undefined,
        major: undefined,
        intendedMajor: undefined,
        classRank: undefined,
        honors: undefined,
        previousTeams: undefined,
        championships: undefined,
        allStarSelections: undefined,
        availableDate: undefined,
        preferredRegions: undefined,
        scholarshipNeeds: undefined,
        recruitmentStatus: undefined,
        phone: undefined,
        parentGuardianName: undefined,
        parentGuardianPhone: undefined,
        parentGuardianEmail: undefined,
        coachReferences: undefined,
        videos: undefined,
        socialMedia: undefined,
    };

    return <PlayerProfile playerId={playerId} playerData={playerProfileData} />;
}
