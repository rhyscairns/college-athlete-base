import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/authentication/utils/jwt';
import { getCoachById } from '@/authentication/db/coaches';
import { CoachDashboard } from '@/dashboard/coach/components';

interface CoachDashboardPageProps {
    params: Promise<{
        coachId: string;
    }>;
}

/**
 * Coach Dashboard Page
 * Protected route that requires valid session
 * Displays coach information and dashboard UI
 */
export default async function CoachDashboardPage({ params }: CoachDashboardPageProps) {
    // Await params (Next.js 15 requirement)
    const { coachId } = await params;

    // Get session token from cookies
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    // Redirect to login if no session token
    if (!sessionToken) {
        redirect('/login');
    }

    // Verify the session token
    const tokenPayload = await verifyToken(sessionToken);

    // Redirect to login if token is invalid or expired
    if (!tokenPayload || tokenPayload.playerId !== coachId || tokenPayload.type !== 'coach') {
        redirect('/login');
    }

    // Fetch coach data for verification
    const coach = await getCoachById(coachId);

    // Redirect to login if coach not found
    if (!coach) {
        redirect('/login');
    }

    return <CoachDashboard coachId={coachId} />;
}
