import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { verifyToken } from '@/authentication/utils/jwt';
import { CoachProfileView } from '@/profile/coach/components/view/CoachProfileView';
import { logger } from '@/lib/logger';
import type { CoachProfile, CoachProfileApiResponse } from '@/profile/coach/types';
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
 * Fetch coach profile data from API
 * @param coachId - The coach ID to fetch
 * @returns Coach profile data or null if fetch fails
 */
async function fetchCoachProfile(coachId: string): Promise<CoachProfile | null> {
    try {
        // Construct the API URL
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const apiUrl = `${baseUrl}/api/coach/${coachId}/profile`;

        logger.info('Fetching coach profile from API', { coachId, apiUrl });

        // Fetch from API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal,
            cache: 'no-store', // Disable caching for server-side fetches
        });

        clearTimeout(timeoutId);

        // Check if response is ok
        if (!response.ok) {
            logger.warn('API request failed', {
                coachId,
                status: response.status,
                statusText: response.statusText,
            });
            return null;
        }

        // Parse response
        const data: CoachProfileApiResponse = await response.json();

        if (!data.success || !data.data) {
            logger.warn('API returned unsuccessful response', {
                coachId,
                error: data.error,
            });
            return null;
        }

        logger.info('Successfully fetched coach profile from API', { coachId });
        return data.data;
    } catch (error) {
        // Log error and return null
        logger.error('Error fetching coach profile from API', {
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <CoachProfileView
                coachId={coachId}
                currentUserId={currentUserId}
                initialData={coachData}
            />
        </div>
    );
}
