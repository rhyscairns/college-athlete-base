/**
 * Example usage of PlayerCard in a grid layout
 * This file demonstrates how to use the PlayerCard component in a dashboard
 */

import { PlayerCard } from '../PlayerCard';

// Example player data
const examplePlayers = [
    {
        playerId: 'player-1',
        firstName: 'Michael',
        lastName: 'Jordan',
        position: 'Shooting Guard',
        sport: 'Basketball',
        videoThumbnail: 'https://example.com/jordan-highlights.jpg',
    },
    {
        playerId: 'player-2',
        firstName: 'Serena',
        lastName: 'Williams',
        position: 'Singles',
        sport: 'Tennis',
        profileImage: 'https://example.com/serena.jpg',
    },
    {
        playerId: 'player-3',
        firstName: 'Tom',
        lastName: 'Brady',
        position: 'Quarterback',
        sport: 'Football',
        // No images - will show initials
    },
    {
        playerId: 'player-4',
        firstName: 'Megan',
        lastName: 'Rapinoe',
        position: 'Winger',
        sport: 'Soccer',
        videoThumbnail: 'https://example.com/rapinoe-highlights.jpg',
        profileImage: 'https://example.com/rapinoe.jpg', // Video takes priority
    },
];

/**
 * Example 1: Basic Grid Layout
 */
export function BasicGridExample() {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-3xl font-bold text-white mb-6">My Players</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {examplePlayers.map((player) => (
                    <PlayerCard
                        key={player.playerId}
                        playerId={player.playerId}
                        firstName={player.firstName}
                        lastName={player.lastName}
                        position={player.position}
                        sport={player.sport}
                        videoThumbnail={player.videoThumbnail}
                        profileImage={player.profileImage}
                    />
                ))}
            </div>
        </div>
    );
}

/**
 * Example 2: With Loading State
 */
export function GridWithLoadingExample() {
    const isLoading = false; // Would come from data fetching state

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="bg-white/90 rounded-2xl shadow-lg border border-white/50 overflow-hidden animate-pulse"
                    >
                        <div className="aspect-video bg-slate-300" />
                        <div className="p-5 space-y-3">
                            <div className="h-6 bg-slate-300 rounded w-3/4" />
                            <div className="h-4 bg-slate-300 rounded w-1/2" />
                            <div className="h-4 bg-slate-300 rounded w-2/3" />
                            <div className="h-12 bg-slate-300 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examplePlayers.map((player) => (
                <PlayerCard
                    key={player.playerId}
                    playerId={player.playerId}
                    firstName={player.firstName}
                    lastName={player.lastName}
                    position={player.position}
                    sport={player.sport}
                    videoThumbnail={player.videoThumbnail}
                    profileImage={player.profileImage}
                />
            ))}
        </div>
    );
}

/**
 * Example 3: With Empty State
 */
export function GridWithEmptyStateExample() {
    const players = []; // Empty array

    if (players.length === 0) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white/90 rounded-2xl shadow-lg border border-white/50 p-12 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                        <svg
                            className="w-12 h-12 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                        No Players Yet
                    </h3>
                    <p className="text-slate-600 mb-6">
                        Start building your roster by adding players to your dashboard.
                    </p>
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white font-semibold hover:shadow-lg transition-all">
                        Add Player
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.map((player: any) => (
                <PlayerCard
                    key={player.playerId}
                    playerId={player.playerId}
                    firstName={player.firstName}
                    lastName={player.lastName}
                    position={player.position}
                    sport={player.sport}
                    videoThumbnail={player.videoThumbnail}
                    profileImage={player.profileImage}
                />
            ))}
        </div>
    );
}

/**
 * Example 4: With Filtering
 */
export function GridWithFilteringExample() {
    const [selectedSport, setSelectedSport] = React.useState<string>('all');

    const filteredPlayers = selectedSport === 'all'
        ? examplePlayers
        : examplePlayers.filter((p) => p.sport === selectedSport);

    const sports = ['all', ...new Set(examplePlayers.map((p) => p.sport))];

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Filter Buttons */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {sports.map((sport) => (
                    <button
                        key={sport}
                        onClick={() => setSelectedSport(sport)}
                        className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${selectedSport === sport
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/90 text-slate-700 hover:bg-white'
                            }`}
                    >
                        {sport.charAt(0).toUpperCase() + sport.slice(1)}
                    </button>
                ))}
            </div>

            {/* Player Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlayers.map((player) => (
                    <PlayerCard
                        key={player.playerId}
                        playerId={player.playerId}
                        firstName={player.firstName}
                        lastName={player.lastName}
                        position={player.position}
                        sport={player.sport}
                        videoThumbnail={player.videoThumbnail}
                        profileImage={player.profileImage}
                    />
                ))}
            </div>
        </div>
    );
}

// Note: This file is for documentation purposes only
// It shows various ways to use the PlayerCard component
// Import React at the top if you want to use these examples in your app
import React from 'react';
