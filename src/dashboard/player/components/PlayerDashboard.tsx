'use client';

import { PlayerDashboardProps } from '../types';

export default function PlayerDashboard({ playerId: _playerId }: PlayerDashboardProps) {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="w-full p-8 sm:p-10 lg:p-12 bg-white/90 rounded-3xl shadow-2xl border border-white/50 backdrop-blur-sm">
                <div className="flex items-center justify-center min-h-[400px]">
                    <p className="text-gray-500 text-lg text-center">
                        Dashboard content coming soon
                    </p>
                </div>
            </div>
        </div>
    );
}
