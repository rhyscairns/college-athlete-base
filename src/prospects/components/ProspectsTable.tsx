'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { VideoModal } from '@/dashboard/common/components/VideoModal';
import { EmptyState } from '@/components/primitives/EmptyState';
import { EmptyProspectsIllustration } from '@/components/primitives/illustrations/EmptyProspects';
import type { ProspectPlayerData, ProspectsTableProps, VideoModalState } from '../types';

// ── Action buttons ────────────────────────────────────────────────────────────

interface RowActionsProps {
    prospect: ProspectPlayerData;
    coachId: string;
    isRemoving: boolean;
    onWatchVideo: (p: ProspectPlayerData) => void;
    onUnfavorite: (id: string) => void;
}

function RowActions({ prospect, coachId, isRemoving, onWatchVideo, onUnfavorite }: RowActionsProps) {
    const router = useRouter();
    const fullName = `${prospect.firstName} ${prospect.lastName}`;

    return (
        <div className="flex items-center gap-1">
            {prospect.videoUrl && (
                <button
                    aria-label={`Watch video for ${fullName}`}
                    onClick={() => onWatchVideo(prospect)}
                    className="px-2 py-1 rounded text-xs transition-colors focus:outline-none focus:ring-2"
                    style={{ color: 'var(--brand-500)', background: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink-3)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                    Watch
                </button>
            )}
            <button
                aria-label={`View profile for ${fullName}`}
                onClick={() => router.push(`/coach/${coachId}/dashboard/player-profile/${prospect.playerId}`)}
                className="px-2 py-1 rounded text-xs transition-colors focus:outline-none focus:ring-2"
                style={{ color: 'var(--text-hi)', background: 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink-3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
                Profile
            </button>
            <button
                aria-label={`Send scholarship to ${fullName}`}
                onClick={() => router.push(`/coach/${coachId}/scholarships/new?playerId=${prospect.playerId}`)}
                className="px-2 py-1 rounded text-xs transition-colors focus:outline-none focus:ring-2"
                style={{ color: 'oklch(75% 0.18 85)', background: 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink-3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
                Scholarship
            </button>
            <button
                aria-label={`Remove ${fullName} from prospects`}
                disabled={isRemoving}
                onClick={() => { if (!isRemoving) onUnfavorite(prospect.playerId); }}
                className="px-2 py-1 rounded text-xs transition-colors focus:outline-none focus:ring-2 disabled:opacity-50"
                style={{ color: 'var(--status-danger)', background: 'transparent' }}
                onMouseEnter={e => { if (!isRemoving) e.currentTarget.style.background = 'var(--ink-3)'; }}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
                {isRemoving ? 'Removing…' : 'Remove'}
            </button>
        </div>
    );
}

// ── Main table ────────────────────────────────────────────────────────────────

export function ProspectsTable({ prospects: initialProspects, coachId }: ProspectsTableProps) {
    const [prospects, setProspects] = useState<ProspectPlayerData[]>(initialProspects);
    const [error, setError] = useState<string | null>(null);
    const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
    const [videoModal, setVideoModal] = useState<VideoModalState>(
        { isOpen: false, videoUrl: null, videoTitle: null, playerName: null }
    );
    const dragIndexRef = useRef<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handleDragStart = useCallback((index: number) => { dragIndexRef.current = index; }, []);

    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    }, []);

    const handleDrop = useCallback((dropIndex: number) => {
        const from = dragIndexRef.current;
        if (from === null || from === dropIndex) { dragIndexRef.current = null; setDragOverIndex(null); return; }
        setProspects(prev => {
            const next = [...prev];
            const [moved] = next.splice(from, 1);
            next.splice(dropIndex, 0, moved);
            return next;
        });
        dragIndexRef.current = null;
        setDragOverIndex(null);
    }, []);

    const handleDragEnd = useCallback(() => { dragIndexRef.current = null; setDragOverIndex(null); }, []);

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
            setRemovingIds(prev => { const next = new Set(prev); next.delete(playerId); return next; });
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
                            </div>
                            <div className="mt-2 flex flex-col gap-1">
                                <span className="text-xs" style={{ color: 'var(--text-lo)' }}>
                                    <span className="font-medium" style={{ color: 'var(--text-mid)' }}>Sport:</span> {prospect.sport ?? '\u2014'}
                                </span>
                                <span className="text-xs" style={{ color: 'var(--text-lo)' }}>
                                    <span className="font-medium" style={{ color: 'var(--text-mid)' }}>Position:</span> {prospect.position ?? '\u2014'}
                                </span>
                                <span className="text-xs" style={{ color: 'var(--text-lo)' }}>
                                    <span className="font-medium" style={{ color: 'var(--text-mid)' }}>GPA:</span> {prospect.gpa !== null ? prospect.gpa : '\u2014'}
                                </span>
                                <span className="text-xs" style={{ color: 'var(--text-lo)' }}>
                                    <span className="font-medium" style={{ color: 'var(--text-mid)' }}>High School:</span> {prospect.highSchool ?? '\u2014'}
                                </span>
                                <span className="text-xs" style={{ color: 'var(--text-lo)' }}>
                                    <span className="font-medium" style={{ color: 'var(--text-mid)' }}>Scholarship:</span>{' '}
                                    {prospect.scholarshipAmount !== null ? `$${prospect.scholarshipAmount.toLocaleString()}` : '\u2014'}
                                </span>
                            </div>
                            <div className="mt-3">
                                <RowActions
                                    prospect={prospect}
                                    coachId={coachId}
                                    isRemoving={isRemoving}
                                    onWatchVideo={handleWatchVideo}
                                    onUnfavorite={handleUnfavorite}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block w-full overflow-x-auto rounded-xl" style={{ border: '1px solid var(--ink-3)' }}>
                <table className="w-full" style={{ borderColor: 'var(--ink-3)', background: 'var(--ink-1)', borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead>
                        <tr style={{ background: 'var(--ink-2)' }}>
                            <th scope="col" className="w-8 px-2 py-3 rounded-tl-xl" aria-label="Drag handle" />
                            <th scope="col" className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--brand-500)', width: '2.5rem' }}>#</th>
                            {['Name', 'Sport', 'Position', 'GPA', 'High School', 'Scholarship Required'].map(col => (
                                <th key={col} scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--brand-500)' }}>{col}</th>
                            ))}
                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap rounded-tr-xl" style={{ color: 'var(--brand-500)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prospects.map((prospect, index) => {
                            const isRemoving = removingIds.has(prospect.playerId);
                            const isDragTarget = dragOverIndex === index;
                            const isLast = index === prospects.length - 1;
                            const rowBorder: React.CSSProperties = index > 0 ? { borderTop: '1px solid var(--ink-3)' } : {};

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
                                        background: isDragTarget ? 'oklch(68% 0.22 150 / 0.08)' : undefined,
                                        outline: isDragTarget ? '2px solid oklch(68% 0.22 150 / 0.4)' : undefined,
                                        outlineOffset: '-2px',
                                        cursor: 'grab',
                                    }}
                                    onMouseEnter={e => { if (!isDragTarget) e.currentTarget.style.background = 'var(--ink-2)'; }}
                                    onMouseLeave={e => { if (!isDragTarget) e.currentTarget.style.background = ''; }}
                                >
                                    <td className="w-8 px-2 py-3 text-center select-none" aria-hidden="true"
                                        style={{ ...rowBorder, borderColor: 'var(--ink-3)', ...(isLast ? { borderBottomLeftRadius: '0.75rem' } : {}) }}>
                                        <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 16 16" style={{ color: 'var(--text-lo)' }}>
                                            <circle cx="5" cy="4" r="1.2" fill="currentColor" />
                                            <circle cx="5" cy="8" r="1.2" fill="currentColor" />
                                            <circle cx="5" cy="12" r="1.2" fill="currentColor" />
                                            <circle cx="11" cy="4" r="1.2" fill="currentColor" />
                                            <circle cx="11" cy="8" r="1.2" fill="currentColor" />
                                            <circle cx="11" cy="12" r="1.2" fill="currentColor" />
                                        </svg>
                                    </td>
                                    <td className="px-3 py-3 whitespace-nowrap" style={{ ...rowBorder, borderColor: 'var(--ink-3)' }}>
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold" style={{ background: 'var(--ink-3)', color: 'var(--brand-500)' }}>
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold whitespace-nowrap" style={{ ...rowBorder, borderColor: 'var(--ink-3)', color: 'var(--text-hi)' }}>
                                        {prospect.firstName} {prospect.lastName}
                                    </td>
                                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ ...rowBorder, borderColor: 'var(--ink-3)', color: 'var(--text-mid)' }}>{prospect.sport ?? '\u2014'}</td>
                                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ ...rowBorder, borderColor: 'var(--ink-3)', color: 'var(--text-mid)' }}>{prospect.position ?? '\u2014'}</td>
                                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ ...rowBorder, borderColor: 'var(--ink-3)', fontFamily: 'var(--font-geist-mono, monospace)', color: 'var(--text-mid)' }}>
                                        {prospect.gpa !== null ? prospect.gpa : '\u2014'}
                                    </td>
                                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ ...rowBorder, borderColor: 'var(--ink-3)', color: 'var(--text-mid)' }}>
                                        {prospect.highSchool ?? '\u2014'}
                                    </td>
                                    <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ ...rowBorder, borderColor: 'var(--ink-3)', fontFamily: 'var(--font-geist-mono, monospace)', color: 'var(--text-mid)' }}>
                                        {prospect.scholarshipAmount !== null ? `$${prospect.scholarshipAmount.toLocaleString()}` : '\u2014'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap"
                                        style={{ ...rowBorder, borderColor: 'var(--ink-3)', ...(isLast ? { borderBottomRightRadius: '0.75rem' } : {}) }}>
                                        <RowActions
                                            prospect={prospect}
                                            coachId={coachId}
                                            isRemoving={isRemoving}
                                            onWatchVideo={handleWatchVideo}
                                            onUnfavorite={handleUnfavorite}
                                        />
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
