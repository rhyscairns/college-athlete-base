'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { VideoModal } from '@/dashboard/common/components/VideoModal';
import type { ProspectPlayerData, ProspectsTableProps } from '../types';

export function ProspectsTable({ prospects: initialProspects, coachId }: ProspectsTableProps) {
    const router = useRouter();
    const [prospects, setProspects] = useState<ProspectPlayerData[]>(initialProspects);
    const [error, setError] = useState<string | null>(null);
    const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

    const [videoModal, setVideoModal] = useState<{
        isOpen: boolean;
        videoUrl: string | null;
        videoTitle: string | null;
        playerName: string | null;
    }>({ isOpen: false, videoUrl: null, videoTitle: null, playerName: null });

    const handleWatchVideo = useCallback((prospect: ProspectPlayerData) => {
        setVideoModal({
            isOpen: true,
            videoUrl: prospect.videoUrl,
            videoTitle: prospect.videoTitle,
            playerName: `${prospect.firstName} ${prospect.lastName}`,
        });
    }, []);

    const handleCloseVideo = useCallback(() => {
        setVideoModal({ isOpen: false, videoUrl: null, videoTitle: null, playerName: null });
    }, []);

    const handleViewProfile = useCallback((playerId: string) => {
        router.push(`/coach/${coachId}/dashboard/player-profile/${playerId}`);
    }, [router, coachId]);

    const handleUnfavorite = useCallback(async (playerId: string) => {
        setRemovingIds((prev) => new Set(prev).add(playerId));
        setError(null);

        try {
            const response = await fetch(`/api/coach/${coachId}/prospects/${playerId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to remove prospect');

            setProspects((prev) => prev.filter((p) => p.playerId !== playerId));
        } catch {
            setError('Failed to remove prospect. Please try again.');
        } finally {
            setRemovingIds((prev) => {
                const next = new Set(prev);
                next.delete(playerId);
                return next;
            });
        }
    }, [coachId]);

    if (prospects.length === 0) {
        return (
            <p className="text-gray-500 text-center py-12">
                No prospects yet. Start favoriting players from the dashboard.
            </p>
        );
    }

    return (
        <>
            {error && (
                <div
                    role="alert"
                    aria-live="assertive"
                    className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                >
                    {error}
                </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full divide-y divide-gray-200 bg-white">
                    <thead>
                        <tr className="bg-blue-50">
                            {['Name', 'Sport', 'Position', 'GPA', 'High School', 'Scholarship Required', 'Actions'].map((col) => (
                                <th
                                    key={col}
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider whitespace-nowrap"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {prospects.map((prospect) => {
                            const fullName = `${prospect.firstName} ${prospect.lastName}`;
                            const isRemoving = removingIds.has(prospect.playerId);

                            return (
                                <tr key={prospect.playerId} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                                        {fullName}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                        {prospect.sport ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                        {prospect.position ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                        {prospect.gpa != null ? prospect.gpa : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                        {prospect.highSchool ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                        {prospect.scholarshipAmount != null
                                            ? `$${prospect.scholarshipAmount.toLocaleString()}`
                                            : '—'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {prospect.videoUrl && (
                                                <button
                                                    onClick={() => handleWatchVideo(prospect)}
                                                    aria-label={`Watch video for ${fullName}`}
                                                    className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                                >
                                                    Watch Video
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleViewProfile(prospect.playerId)}
                                                aria-label={`View profile for ${fullName}`}
                                                className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                                            >
                                                View Profile
                                            </button>
                                            <button
                                                onClick={() => handleUnfavorite(prospect.playerId)}
                                                disabled={isRemoving}
                                                aria-label={`Remove ${fullName} from prospects`}
                                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {videoModal.isOpen && videoModal.videoUrl && (
                <VideoModal
                    isOpen={videoModal.isOpen}
                    onClose={handleCloseVideo}
                    videoUrl={videoModal.videoUrl}
                    videoTitle={videoModal.videoTitle ?? undefined}
                    playerName={videoModal.playerName ?? undefined}
                />
            )}
        </>
    );
}
