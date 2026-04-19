import type { ReactElement } from 'react';

/**
 * Loading skeleton component for player profile page
 * 
 * Displays an animated skeleton UI while the player profile data is being fetched.
 * Includes hero section, stats, and content placeholders that match the actual profile layout.
 * 
 * @returns Loading skeleton UI with accessibility support
 * 
 * @example
 * ```tsx
 * // Automatically shown by Next.js during page loading
 * // Route: /coach/dashboard/[coachId]/player-profile/[playerId]
 * ```
 */
export default function Loading(): ReactElement {
    return (
        <div className="relative bg-slate-100 min-h-screen">
            {/* Screen reader announcement */}
            <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                Loading player profile, please wait...
            </div>

            <main className="lg:ml-48" aria-busy="true">
                {/* Hero Section Skeleton */}
                <div
                    className="relative h-96 bg-gradient-to-br from-slate-800 to-slate-900 animate-pulse"
                    aria-hidden="true"
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-32 h-32 bg-slate-700 rounded-full mx-auto mb-4" />
                            <div className="h-8 bg-slate-700 rounded w-64 mx-auto mb-2" />
                            <div className="h-6 bg-slate-700 rounded w-48 mx-auto" />
                        </div>
                    </div>
                </div>

                {/* Content Skeleton */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                    {/* Stats Section Skeleton */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse" aria-hidden="true">
                        <div className="h-6 bg-slate-200 rounded w-48 mb-4" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-4 bg-slate-200 rounded w-20" />
                                    <div className="h-8 bg-slate-200 rounded w-16" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Additional Sections Skeleton */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse" aria-hidden="true">
                            <div className="h-6 bg-slate-200 rounded w-48 mb-4" />
                            <div className="space-y-3">
                                <div className="h-4 bg-slate-200 rounded w-full" />
                                <div className="h-4 bg-slate-200 rounded w-5/6" />
                                <div className="h-4 bg-slate-200 rounded w-4/6" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Loading indicator */}
            <div
                className="fixed bottom-8 right-8 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
                role="status"
                aria-live="polite"
            >
                <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
                <span>Loading player profile...</span>
            </div>
        </div>
    );
}
