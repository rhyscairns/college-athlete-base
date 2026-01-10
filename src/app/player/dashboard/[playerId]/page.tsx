import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/authentication/utils/jwt';
import { getPlayerById } from '@/authentication/db/players';

interface PlayerDashboardPageProps {
    params: Promise<{
        playerId: string;
    }>;
}

/**
 * Player Dashboard Page
 * Protected route that requires valid session
 * Displays player information and dashboard UI
 */
export default async function PlayerDashboardPage({ params }: PlayerDashboardPageProps) {
    // Await params (Next.js 15 requirement)
    const { playerId } = await params;

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
    if (!tokenPayload || tokenPayload.playerId !== playerId) {
        redirect('/login');
    }

    // Fetch player data
    const player = await getPlayerById(playerId);

    // Redirect to login if player not found
    if (!player) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome, {player.firstName} {player.lastName}
                    </h1>
                    <p className="mt-2 text-gray-600">Player Dashboard</p>
                </div>

                {/* Player Information */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Your Profile
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="mt-1 text-gray-900">{player.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Sport</p>
                            <p className="mt-1 text-gray-900">{player.sport}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Position</p>
                            <p className="mt-1 text-gray-900">{player.position}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">GPA</p>
                            <p className="mt-1 text-gray-900">{player.gpa.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Country</p>
                            <p className="mt-1 text-gray-900">{player.country}</p>
                        </div>
                        {player.state && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">State</p>
                                <p className="mt-1 text-gray-900">{player.state}</p>
                            </div>
                        )}
                        {player.region && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">Region</p>
                                <p className="mt-1 text-gray-900">{player.region}</p>
                            </div>
                        )}
                        {player.scholarshipAmount && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">
                                    Scholarship Amount
                                </p>
                                <p className="mt-1 text-gray-900">
                                    ${player.scholarshipAmount.toLocaleString()}
                                </p>
                            </div>
                        )}
                        {player.testScores && (
                            <div className="md:col-span-2">
                                <p className="text-sm font-medium text-gray-500">Test Scores</p>
                                <p className="mt-1 text-gray-900">{player.testScores}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
