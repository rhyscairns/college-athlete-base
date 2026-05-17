import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { verifyToken } from '@/authentication/utils/jwt';
import { getCoachProfileById } from '@/profile/coach/lib/db/queries';
import { CoachProfileView } from '@/profile/coach/components/view/CoachProfileView';
import { logger } from '@/lib/logger';
import type { CoachProfile } from '@/profile/coach/types';
import type { Metadata } from 'next';

/**
 * Generate metadata for the coach profile page
 */
export async function generateMetadata({
    params,
}: {
    params: Promise<{ coachId: string }>;
}): Promise<Metadata> {
    const { coachId } = await params;

    // Fetch coach data for metadata
    const coachData = await fetchCoachProfile(coachId);

    if (!coachData) {
        return {
            title: 'Coach Profile Not Found',
            description: 'The requested coach profile could not be found.',
        };
    }

    return {
        title: `${coachData.firstName} ${coachData.lastName} - Coach Profile`,
        description: `View the profile of ${coachData.firstName} ${coachData.lastName}, ${coachData.position || 'Coach'} at ${coachData.university || 'University'}.`,
    };
}

/**
 * Fetch coach profile data directly from the database
 */
async function fetchCoachProfile(coachId: string): Promise<CoachProfile | null> {
    try {
        return await getCoachProfileById(coachId);
    } catch (error) {
        logger.error('Error fetching coach profile', {
            coachId,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        return null;
    }
}

/**
 * Coach Profile Page
 * Displays the coach's profile with inline editing capabilities
 * Fetches data server-side and handles authentication
 */
export default async function CoachProfilePage({
    params,
}: {
    params: Promise<{ coachId: string }>;
}) {
    const { coachId } = await params;

    // Fetch coach data from API
    const coachData = await fetchCoachProfile(coachId);

    // If coach not found, show 404
    if (!coachData) {
        logger.error('Coach profile not found', { coachId });
        notFound();
    }

    // Get session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    // Initialize currentUserId as undefined (unauthenticated)
    let currentUserId: string | undefined = undefined;

    // If session exists, verify token and extract user ID
    if (sessionCookie) {
        const tokenPayload = await verifyToken(sessionCookie.value);

        // Only set currentUserId if token is valid and is a coach token
        if (tokenPayload && tokenPayload.type === 'coach') {
            currentUserId = tokenPayload.playerId; // Note: playerId field is used for both players and coaches
        }
    }

    // Allow viewing without authentication, but editing requires authentication
    return (
        <div className="min-h-screen">
            <CoachProfileView
                coachId={coachId}
                currentUserId={currentUserId}
                initialData={coachData}
            />
        </div>
    );
}
