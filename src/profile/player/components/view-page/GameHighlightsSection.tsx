'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { GameHighlightsSectionProps, ValidationErrors } from '../../types';
import type { Video } from '../../types';
import { GameHighlightsSectionEdit } from '../edit/components/sections/GameHighlightsSectionEdit';
import { validateVideosSection } from '../../utils/validation';
import { hasSectionData } from '../../utils/profile-helpers';
import { EmptySection } from '../EmptySection';
import { VideoCard } from './VideoCard';
import { VideoModal } from '@/dashboard/common/components/VideoModal';

/**
 * Game Highlights Section Component
 * 
 * Displays player highlight videos in a responsive layout with featured video support.
 * Supports edit mode for profile owners and includes a video modal player.
 * 
 * Features:
 * - Featured video with large display
 * - Sidebar list for additional videos
 * - Grid layout when no featured video
 * - Full-screen video modal with YouTube embed support
 * - Keyboard navigation and accessibility
 * - Edit mode with validation
 * 
 * @param props - Component props
 * @param props.videos - Array of video objects to display
 * @param props.isOwner - Whether the current user owns this profile
 * @param props.isEditing - Whether the section is in edit mode
 * @param props.isAnyOtherSectionEditing - Whether another section is being edited
 * @param props.onEdit - Callback when edit button is clicked
 * @param props.onSave - Callback when save button is clicked
 * @param props.onCancel - Callback when cancel button is clicked
 * @returns Game highlights section with videos or empty state
 */
export function GameHighlightsSection({
    videos,
    isOwner = false,
    isEditing = false,
    isAnyOtherSectionEditing = false,
    onEdit,
    onSave,
    onCancel,
}: GameHighlightsSectionProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const [formData, setFormData] = useState<Video[]>(videos);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSaving, setIsSaving] = useState(false);
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

    // Reset form data when videos data changes or when exiting edit mode
    useEffect(() => {
        if (!isEditing) {
            setFormData(videos);
            setErrors({});
        }
    }, [isEditing, videos]);

    // Scroll into view when entering edit mode and set focus
    useEffect(() => {
        if (isEditing && sectionRef.current) {
            sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Focus the first input field after a short delay to allow for scroll
            const timeoutId = setTimeout(() => {
                const firstInput = sectionRef.current?.querySelector('input, textarea, select') as HTMLElement;
                if (firstInput) {
                    firstInput.focus();
                }
            }, 300);

            return () => clearTimeout(timeoutId);
        }
    }, [isEditing]);

    // Handle Escape key to cancel editing and close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            if (e.key === 'Escape') {
                e.preventDefault();
                if (videoModalOpen) {
                    handleCloseModal();
                } else if (isEditing) {
                    handleCancel();
                }
            }
        };

        if (isEditing || videoModalOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isEditing, videoModalOpen]);

    const handleSave = async (): Promise<void> => {
        const validationErrors = validateVideosSection({ videos: formData });
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSaving(true);
        // Simulate save delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (onSave) {
            onSave({
                videos: formData.map(video => ({
                    id: video.id,
                    title: video.title,
                    description: video.description || '',
                    url: video.url,
                    thumbnail: video.thumbnail || '',
                    duration: video.duration || '',
                    isFeatured: video.isFeatured || false,
                    date: video.date || '',
                })),
            });
        }

        setIsSaving(false);
        setErrors({});
    };

    const handleCancel = useCallback((): void => {
        // Reset form data to original videos data
        setFormData(videos);
        setErrors({});
        if (onCancel) {
            onCancel();
        }
    }, [videos, onCancel]);

    const handleVideoClick = useCallback((video: Video): void => {
        setSelectedVideo(video);
        setVideoModalOpen(true);
    }, []);

    const handleCloseModal = useCallback((): void => {
        setVideoModalOpen(false);
        setSelectedVideo(null);
    }, []);

    const featured = videos.find(v => v.isFeatured);
    const otherVideos = videos.filter(v => !v.isFeatured);

    // Check if videos section has data
    const hasVideos = hasSectionData(videos, 'videos');

    // If no videos and not owner, hide the section
    if (!hasVideos && !isOwner) {
        return null;
    }

    if (isEditing) {
        return (
            <section
                id="highlights"
                ref={sectionRef}
                className="max-w-6xl mx-auto px-4 py-8"
                aria-label="Game highlights section - Edit mode"
            >
                <GameHighlightsSectionEdit
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    isSaving={isSaving}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            </section>
        );
    }

    if (!hasVideos) {
        return (
            <section id="highlights" ref={sectionRef} className="max-w-6xl mx-auto px-4 py-8" aria-label="Game highlights section - Empty">
                <div className="rounded-2xl p-8" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}>
                    <EmptySection
                        title="No Videos Yet"
                        description="Add highlight videos to showcase your best plays and skills to college recruiters."
                        isOwner={isOwner}
                        showEditButton={true}
                        onEdit={onEdit}
                        icon="🎥"
                    />
                </div>
            </section>
        );
    }

    return (
        <section id="highlights" ref={sectionRef} className="max-w-6xl mx-auto px-4 py-8" aria-label="Game highlights section">
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}>
                {/* Header */}
                <div
                    className="px-6 py-6 sm:px-8 relative"
                    style={{
                        background: `radial-gradient(ellipse 80% 120% at 0% 50%, oklch(68% 0.22 150 / 0.15) 0%, transparent 60%), var(--ink-2)`,
                        borderBottom: '1px solid var(--ink-3)',
                    }}
                >
                    {isOwner && (
                        <button
                            onClick={() => onEdit?.()}
                            disabled={isAnyOtherSectionEditing}
                            className="absolute top-4 right-4 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                            style={{ background: 'var(--ink-3)', color: 'var(--text-hi)' }}
                            onMouseEnter={e => !isAnyOtherSectionEditing && (e.currentTarget.style.background = 'var(--ink-0)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink-3)')}
                            aria-label={isAnyOtherSectionEditing ? 'Edit section - disabled, another section is being edited' : 'Edit game highlights section'}
                            title={isAnyOtherSectionEditing ? 'Another section is being edited' : 'Edit section'}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </button>
                    )}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" aria-hidden="true" style={{ background: 'var(--ink-3)' }}>
                            <span className="text-2xl">🎥</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-hi)' }}>Game Highlights</h2>
                            <p style={{ color: 'var(--text-lo)' }}>Watch the action</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
                        {/* Main Video - Large Player */}
                        {featured && (
                            <div className="flex-1 lg:w-2/3">
                                <VideoCard
                                    video={featured}
                                    variant="featured"
                                    onClick={() => handleVideoClick(featured)}
                                />
                            </div>
                        )}

                        {/* Other Videos - Sidebar List */}
                        {otherVideos.length > 0 && (
                            <div className="lg:w-1/3">
                                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2" role="list" aria-label="Additional highlight videos">
                                    {otherVideos.map((video) => (
                                        <VideoCard
                                            key={video.id}
                                            video={video}
                                            variant="sidebar"
                                            onClick={() => handleVideoClick(video)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Main Video - Show All Videos in Grid */}
                        {!featured && otherVideos.length > 0 && (
                            <div className="w-full">
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Highlight videos">
                                    {otherVideos.map((video) => (
                                        <VideoCard
                                            key={video.id}
                                            video={video}
                                            variant="grid"
                                            onClick={() => handleVideoClick(video)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Video Modal */}
            <VideoModal
                isOpen={videoModalOpen}
                onClose={handleCloseModal}
                videoUrl={selectedVideo?.url || ''}
                videoTitle={selectedVideo?.title}
            />
        </section>
    );
}
