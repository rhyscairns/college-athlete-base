import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/authentication/utils/jwt';
import { getCoachById } from '@/authentication/db/coaches';

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

    // Fetch coach data
    const coach = await getCoachById(coachId);

    // Redirect to login if coach not found
    if (!coach) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome, Coach {coach.firstName} {coach.lastName}
                    </h1>
                    <p className="mt-2 text-gray-600">Coach Dashboard</p>
                </div>

                {/* Coach Information */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Your Profile
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="mt-1 text-gray-900">{coach.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">University</p>
                            <p className="mt-1 text-gray-900">{coach.university}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Coaching Category</p>
                            <p className="mt-1 text-gray-900 capitalize">{coach.coachingCategory}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Sports</p>
                            <p className="mt-1 text-gray-900">{coach.sports.join(', ')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
