'use client';

import React from 'react';
import type { PlayerInfoSectionProps } from '../types';

/**
 * Displays player information including name, position, sport, and physical stats.
 * 
 * @param props - Component props
 * @param props.playerName - Full name of the player
 * @param props.position - Player's position
 * @param props.sport - Sport the player participates in
 * @param props.height - Optional height measurement
 * @param props.weight - Optional weight measurement
 * @returns Player information section component
 */
export const PlayerInfoSection: React.FC<PlayerInfoSectionProps> = ({
    playerName,
    position,
    sport,
    height,
    weight,
    action,
}): React.ReactElement => {
    return (
        <div className="p-4 sm:p-5 bg-white">
            {/* Name row with optional action (e.g. heart button) */}
            <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    {playerName}
                </h3>
                {action && (
                    <div className="flex-shrink-0 mt-0.5">
                        {action}
                    </div>
                )}
            </div>

            {/* Position & Sport */}
            <div className="space-y-1 mb-4">
                <p className="text-base sm:text-lg font-semibold text-blue-600">
                    {position}
                </p>
                <p className="text-sm sm:text-base text-gray-700">
                    {sport}
                </p>
                {/* Height & Weight */}
                {(height || weight) && (
                    <p
                        className="text-sm text-gray-500"
                        aria-label={`Physical stats: ${[height, weight].filter(Boolean).join(', ')}`}
                    >
                        {height && weight ? `${height} • ${weight}` : height || weight}
                    </p>
                )}
            </div>
        </div>
    );
};
