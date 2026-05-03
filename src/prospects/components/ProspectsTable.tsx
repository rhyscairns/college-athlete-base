'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { VideoModal } from '@/dashboard/common/components/VideoModal';
import { EmptyState } from '@/components/primitives/EmptyState';
import { EmptyProspectsIllustration } from '@/components/primitives/illustrations/EmptyProspects';
import type { ProspectPlayerData, ProspectsTableProps, VideoModalState } from '../types';

const COLUMNS = ['Name', 'Sport', 'Position', 'GPA', 'High School', 'Scholarship Required', 'Actions'];

export function ProspectsTable({ prospects: initialProspects, coachId }: ProspectsTableProps) {
    const router = useRouter();
    const [prospects, setProspects] = useState<ProspectPlayerData[]>(initialProspects);
    const [error, setError] = useState<string | null>(null);
    const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
    const [videoModal, setVideoModal] = useState<VideoModalState>(
        { isOpen: false, videoUrl: null, videoTitle: null, playerName: null }
    );

    const handleWatchVideo = useCallback((prospect: ProspectPlayerData): void => {
        setVideoModal({
            isOpen: true,
            videoUrl: prospect.videoUrl,
            videoTitle: prospect.videoTitle,
            playerName: `${prospect.firstName} ${prospect.lastName}`,
        });
    }, []);

    const handleCloseVideo = useCallback((): void => {
        setVideoModal({ isOpen: false, videoUrl: null, videoTitle: null, playerName: null });
    }, []);

    const handleUnfavorite = useCallback(async (playerId: string): Promise<void> => {
        setRemovingIds((prev) => new Set(prev).add(playerId));
        setError(null);
        try {
            const response = await fetch(`/api/coach/${coachId}/prospects/${playerId}`, { method: 'DELETE' });
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
            <EmptyState
                illustration={<EmptyProspectsIllustration />}
                title="No prospects yet"
                description="No prospects yet — start scouting."
                data-testid="empty-prospects"
            />
        );
    }

    return (
        <>
            {error && (
                <div
                    role="alert"
                    aria-live="assertive"
                    className="mb-4 p-3 rounded-lg text-sm"
                    style={{
                        background: 'oklch(65% 0.24 25 / 0.12)',
                        border: '1px solid oklch(65% 0.24 25 / 0.3)',
                        color: 'var(--status-danger)',
                    }}
                >
                    {error}
                </div>
            )}

            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
                {prospects.map((prospect) => {
                    const fullName = `${prospect.firstName} ${prospect.lastName}`;
                    const isRemoving = removingIds.has(prospect.playerId);
                    return (
                        <div key={prospect.playerId} className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-semibold text-gray-900">{fullName}</p>
                                <button
                                    onClick={() => handleUnfavorite(prospect.playerId)}
                                    disabled={isRemoving}
                                    aria-label={`Remove ${fullName} from prospects`}
                                    className="shrink-0 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                </button>
                            </div>
                            <div className="mt-2 flex flex-col gap-1">
                                <span className="text-xs text-gray-500"><span className="font-medium text-gray-700">Sport:</span> {prospect.sport ?? '—'}</span>
                                <span className="text-xs text-gray-500"><span className="font-medium text-gray-700">Position:</span> {prospect.position ?? '—'}</span>
                                <span className="text-xs text-gray-500"><span className="font-medium text-gray-700">GPA:</span> {prospect.gpa !== null ? prospect.gpa : '—'}</span>
                                <span className="text-xs text-gray-500"><span className="font-medium text-gray-700">High School:</span> {prospect.highSchool ?? '—'}</span>
                                <span className="text-xs text-gray-500"><span className="font-medium text-gray-700">Scholarship:</span> {prospect.scholarshipAmount !== null ? `$${prospect.scholarshipAmount.toLocaleString()}` : '—'}</span>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
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
                                    onClick={() => router.push(`/coach/${coachId}/dashboard/player-profile/${prospect.playerId}`)}
                                    aria-label={`View profile for ${fullName}`}
                                    className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                                >
                                    View Profile
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full divide-y divide-gray-200 bg-white">
                    <thead>
                        <tr style={{ background: 'var(--ink-2)' }}>
                            {COLUMNS.map((col) => (
                                <th
                                    key={col}
                                    scope="col"
                                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                                    style={{ color: 'var(--brand-500)' }}
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--ink-3)' }}>
                        {prospects.map((prospect) => {
                            const fullName = `${prospect.firstName} ${prospect.lastName}`;
                            const isRemoving = removingIds.has(prospect.playerId);
                            return (
                                <tr
                                    key={prospect.playerId}
                                    className="transition-colors"
                                    style={{ borderColor: 'var(--ink-3)' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink-2)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                                >
                                    <td className="px-4 py-3 text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--text-hi)' }}>
                                        {fullName}
                                    </td>
                                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--text-mid)' }}>
                                        {prospect.sport ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--text-mid)' }}>
                                        {prospect.position ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: 'var(--text-mid)' }}>
                                        {prospect.gpa !== null ? prospect.gpa : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--text-mid)' }}>
                                        {prospect.highSchool ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: 'var(--text-mid)' }}>
                                        {prospect.scholarshipAmount !== null ? `$${prospect.scholarshipAmount.toLocaleString()}` : '—'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {prospect.videoUrl && (
                                                <button
                                                    onClick={() => handleWatchVideo(prospect)}
                                                    aria-label={`Watch video for ${fullName}`}
                                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors"
                                                    style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
                                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--brand-600)')}
                                                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--brand-500)')}
                                                >
                                                    Watch Video
                                                </button>
                                            )}
                                            <button
                                                onClick={() => router.push(`/coach/${coachId}/dashboard/player-profile/${prospect.playerId}`)}
                                                aria-label={`View profile for ${fullName}`}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors"
                                                style={{ background: 'var(--ink-3)', color: 'var(--text-mid)' }}
                                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink-2)')}
                                                onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink-3)')}
                                            >
                                                View Profile
                                            </button>
                                            <button
                                                onClick={() => handleUnfavorite(prospect.playerId)}
                                                disabled={isRemoving}
                                                aria-label={`Remove ${fullName} from prospects`}
                                                className="p-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                style={{ color: 'var(--status-danger)' }}
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
