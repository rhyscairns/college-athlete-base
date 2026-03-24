import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/dashboard/players/sports
 * Returns a list of unique sports from all players
 */
export async function GET(request: NextRequest) {
    try {
        // TODO: Replace with actual database query
        // This should query the database for distinct sports from all player profiles

        // For now, return a mock response
        // In production, this would be something like:
        // const sports = await db.query('SELECT DISTINCT sport FROM player_profiles WHERE sport IS NOT NULL ORDER BY sport');

        const mockSports = [
            'Baseball',
            'Basketball',
            'Cross Country',
            'Football',
            'Golf',
            'Lacrosse',
            'Soccer',
            'Softball',
            'Swimming & Diving',
            'Tennis',
            'Track & Field',
            'Volleyball',
        ];

        return NextResponse.json({
            success: true,
            data: {
                sports: mockSports,
            },
        });
    } catch (error) {
        console.error('Error fetching available sports:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch available sports',
            },
            { status: 500 }
        );
    }
}
