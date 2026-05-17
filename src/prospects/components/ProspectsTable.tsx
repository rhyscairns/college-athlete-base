'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { VideoModal } from '@/dashboard/common/components/VideoModal';
import { FavoriteButton } from '@/dashboard/common/components/FavoriteButton';
import { EmptyState } from '@/components/primitives/EmptyState';
import { EmptyProspectsIllustration } from '@/components/primitives/illustrations/EmptyProspects';
import type { ProspectPlayerData, ProspectsTableProps, VideoModalState } from '../types';

export function ProspectsTable({ prospects: initialProspects, coachId }: ProspectsTableProps) {
    const router = useRouter();
    const [prospects, setProspects] = useState<ProspectPlayerData[]>(initialProspects);
    const [error, setError] = useState<string | null>(null);
    const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
    const [videoModal, setVideoModal] = useState<VideoModalState>(
        { isOpen: false, videoUrl: null, videoTitle: null, playerName: null }
    );
    const dragIndexRef = useRef<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handleDragStart = useCallback((index: number) => {
        dragIndexRef.current = index;
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    }, []);

    const handleDrop = useCallback((dropIndex: number) => {
        const from = dragIndexRef.current;
        if (from === null || from === dropIndex) {
            dragIndexRef.current = null;
            setDragOverIndex(null);
            return;
        }
        setProspects(prev => {
            const next = [...prev];
            const [moved] = next.splice(from, 1);
            next.splice(dropIndex, 0, moved);
            return next;
        });
        dragIndexRef.current = null;
        setDragOverIndex(null);
    }, []);

    const handleDragEnd = useCallback(() => {
        dragIndexRef.current = null;
        setDragOverIndex(null);
    }, []);

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
        setRemovingIds(prev => new Set(prev).add(playerId));
        setError(null);
        try {
            const response = await fetch(`/api/coach/${coachId}/prospects/${playerId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to remove prospect');
            setProspects(prev => prev.filter(p => p.playerId !== playerId));
        } catch {
            setError('Failed to remove prospect. Please try again.');
        } finally {
            setRemovingIds(prev => {
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

            <p className="mb-3 text-xs" style={{ color: 'var(--text-lo)' }}>
                Drag rows to reorder your prospect rankings.
            </p>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
                {prospects.map((prospect, index) => {
                    const fullName = `${prospect.firstName} ${prospect.lastName}`;
                    const isRemoving = removingIds.has(prospect.playerId);
                    return (
                        <div key={prospect.playerId} className="rounded-xl p-4" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold shrink-0" style={{ background: 'var(--ink-3)', color: 'var(--brand-500)' }}>
                                        {index + 1}
                                    </span>
                                    <p className="text-sm font-semibold" style={{ color: 'var(--text-hi)' }}>{fullName}</p>
                                </div>
                                <FavoriteButton isFavorited={true} playerName={fullName} isDisabled={isRemoving} onClick={() => handleUnfavorite(prospect.playerId)} variant="row" />
                            </div>
                            <div className="mt-2 flex flex-col gap-1">
                                <span className="text-xs" style={{ color: 'var(--text-lo)' }}><span className="font-medium" style={{ color: 'var(--text-mid)' }}>Sport:</span> {prospect.sport ?? '—'}</span>
                                <span className="text-xs" style={{ color: 'var(--text-lo)' }}><span className="font-medium" style={{ color: 'var(--text-mid)' }}>Position:</span> {prospect.position ?? '—'}</span>
                                <span className="text-xs" style={{ color: 'var(--text-lo)' }}><span className="font-medium" style={{ color: 'var(--text-mid)' }}>GPA:</span> {prospect.gpa !== null ? prospect.gpa : '—'}</span>
                                <span className="text-xs" style={{ color: 'var(--text-lo)' }}><span className="font-medium" style={{ color: 'var(--text-mid)' }}>High School:</span> {prospect.highSchool ?? '—'}</span>
                                <span className="text-xs" style={{ color: 'var(--text-lo)' }}><span className="font-medium" style={{ color: 'var(--text-mid)' }}>Scholarship:</span> {prospect.scholarshipAmount !== null ? `$${prospect.scholarshipAmount.toLocaleString()}` : '—'}</span>
                            </div>
                            <div className="mt-3 flex items-center gap-2 flex-wrap">
                                {prospect.videoUrl && (
                                    <button onClick={() => handleWatchVideo(prospect)} aria-label={`Watch video for ${fullName}`} className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2" style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--brand-600)')} onMouseLeave={e => (e.currentTarget.style.background = 'var(--brand-500)')}>Watch Video</button>
                                )}
                                <button onClick={() => router.push(`/coach/${coachId}/dashboard/player-profile/${prospect.playerId}`)} aria-label={`View profile for ${fullName}`} className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2" style={{ background: 'var(--ink-3)', color: 'var(--text-mid)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink-2)')} onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink-3)')}>View Profile</button>
                                <button onClick={() => router.push(`/coach/${coachId}/scholarships/new?playerId=${prospect.playerId}`)} aria-label={`Send scholarship to ${fullName}`} className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2" style={{ background: 'oklch(75% 0.18 85 / 0.15)', color: 'oklch(75% 0.18 85)', border: '1px solid oklch(75% 0.18 85 / 0.3)' }} onMouseEnter={e => (e.currentTarget.style.background = 'oklch(75% 0.18 85 / 0.25)')} onMouseLeave={e => (e.currentTarget.style.background = 'oklch(75% 0.18 85 / 0.15)')}>Send Scholarship</button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto rounded-xl" style={{ border: '1px solid var(--ink-3)' }}>
                <table className="w-full divide-y" style={{ borderColor: 'var(--ink-3)', background: 'var(--ink-1)' }}>
                    <thead>
                        <tr style={{ background: 'var(--ink-2)' }}>
                            <th scope="col" className="w-8 px-2 py-3" aria-label="Drag handle" />
                            <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--brand-500)', width: '2.5rem' }}>#</th>
                            {['Name', 'Sport', 'Position', 'GPA', 'High School', 'Scholarship Required', 'Actions'].map(col => (
                                <th key={col} scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--brand-500)' }}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--ink-3)' }}>
                        {prospects.map((prospect, index) => {
                            const fullName = `${prospect.firstName} ${prospect.lastName}`;
                            const isRemoving = removingIds.has(prospect.playerId);
                            const isDragTarget = dragOverIndex === index;
                            return (
                                <tr
                                    key={prospect.playerId}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={e => handleDragOver(e, index)}
                                    onDrop={() => handleDrop(index)}
                                    onDragEnd={handleDragEnd}
                                    className="transition-colors"
                                    style={{
                                        borderColor: 'var(--ink-3)',
                                        background: isDragTarget ? 'oklch(68% 0.22 150 / 0.08)' : undefined,
                                        outline: isDragTarget ? '2px solid oklch(68% 0.22 150 / 0.4)' : undefined,
                                        outlineOffset: '-2px',
                                        cursor: 'grab',
                                    }}
                                    onMouseEnter={e => { if (!isDragTarget) e.currentTarget.style.background = 'var(--ink-2)'; }}
                                    onMouseLeave={e => { if (!isDragTarget) e.currentTarget.style.background = ''; }}
                                >
                                    <td className="w-8 px-2 py-3 text-center select-none" aria-hidden="true">
                                        <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 16 16" style={{ color: 'var(--text-lo)' }}>
                                            <circle cx="5" cy="4" r="1.2" fill="currentColor" />
                                            <circle cx="5" cy="8" r="1.2" fill="currentColor" />
                                            <circle cx="5" cy="12" r="1.2" fill="currentColor" />
                                            <circle cx="11" cy="4" r="1.2" fill="currentColor" />
                                            <circle cx="11" cy="8" r="1.2" fill="currentColor" />
                                            <circle cx="11" cy="12" r="1.2" fill="currentColor" />
                                        </svg>
                                    </td>
                                    <td className="px-3 py-3 whitespace-nowrap">
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold" style={{ background: 'var(--ink-3)', color: 'var(--brand-500)' }}>
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--text-hi)' }}>{fullName}</td>
                                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--text-mid)' }}>{prospect.sport ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--text-mid)' }}>{prospect.position ?? '—'}</td>
                                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: 'var(--text-mid)' }}>{prospect.gpa !== null ? prospect.gpa : '—'}</td>
                                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ fontFamily: 'var(--font-geist-mono, monospace)', color: 'var(--text-mid)' }}>{prospect.scholarshipAmount !== null ? `$${prospect.scholarshipAmount.toLocaleString()}` : '—'}</td>
                                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: 'var(--text-mid)' }}>{prospect.highSchool ?? '—'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap" style={{ minWidth: '17rem' }}>
                                        <div className="flex items-center gap-2">
                                            {prospect.videoUrl && (
                                                <button onClick={() => handleWatchVideo(prospect)} aria-label={`Watch video for ${fullName}`} className="px-3 py-1.5 text-xs font-semibold rounded-lg focus:outline-none focus:ring-2 transition-colors shrink-0" style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--brand-600)')} onMouseLeave={e => (e.currentTarget.style.background = 'var(--brand-500)')}>Watch Video</button>
                                            )}
                                            <button onClick={() => router.push(`/coach/${coachId}/dashboard/player-profile/${prospect.playerId}`)} aria-label={`View profile for ${fullName}`} className="px-3 py-1.5 text-xs font-semibold rounded-lg focus:outline-none focus:ring-2 transition-colors shrink-0" style={{ background: 'var(--ink-3)', color: 'var(--text-mid)' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink-2)')} onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink-3)')}>View Profile</button>
                                            <button onClick={() => router.push(`/coach/${coachId}/scholarships/new?playerId=${prospect.playerId}`)} aria-label={`Send scholarship to ${fullName}`} className="px-3 py-1.5 text-xs font-semibold rounded-lg focus:outline-none focus:ring-2 transition-colors shrink-0" style={{ background: 'oklch(75% 0.18 85 / 0.15)', color: 'oklch(75% 0.18 85)', border: '1px solid oklch(75% 0.18 85 / 0.3)' }} onMouseEnter={e => (e.currentTarget.style.background = 'oklch(75% 0.18 85 / 0.25)')} onMouseLeave={e => (e.currentTarget.style.background = 'oklch(75% 0.18 85 / 0.15)')}>Send Scholarship</button>
                                            <FavoriteButton isFavorited={true} playerName={fullName} isDisabled={isRemoving} onClick={() => handleUnfavorite(prospect.playerId)} variant="row" />
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
