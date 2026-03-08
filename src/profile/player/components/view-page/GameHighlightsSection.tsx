'use client';

import { useState, useEffect, useRef } from 'react';
import type { GameHighlightsSectionProps, ValidationErrors } from '../../types';
import type { Video } from '../../types';
import { GameHighlightsSectionEdit } from '../edit/components/sections/GameHighlightsSectionEdit';
import { validateVideosSection } from '../../utils/validation';
import { hasSectionData } from '../../utils/profile-helpers';
import { EmptySection } from '../EmptySection';

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
            setTimeout(() => {
                const firstInput = sectionRef.current?.querySelector('input, textarea, select') as HTMLElement;
                if (firstInput) {
                    firstInput.focus();
                }
            }, 300);
        }
    }, [isEditing]);

    // Handle Escape key to cancel editing
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isEditing) {
                e.preventDefault();
                handleCancel();
            }
        };

        if (isEditing) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing]);

    const handleSave = async () => {
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

    const handleCancel = () => {
        // Reset form data to original videos data
        setFormData(videos);
        setErrors({});
        if (onCancel) {
            onCancel();
        }
    };

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
            <section id="highlights" ref={sectionRef} className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
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
        <section id="highlights" ref={sectionRef} className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-6 sm:px-8 relative">
                    {isOwner && (
                        <button
                            onClick={() => onEdit?.()}
                            disabled={isAnyOtherSectionEditing}
                            className="absolute top-4 right-4 px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={isAnyOtherSectionEditing ? 'Another section is being edited' : 'Edit section'}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </button>
                    )}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🎥</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Game Highlights</h2>
                            <p className="text-blue-100">Watch the action</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
                        {/* Main Video - Large Player */}
                        {featured && (
                            <div className="flex-1 lg:w-2/3">
                                <div className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden border border-gray-200 hover:border-yellow-400 hover:shadow-xl transition-all">
                                    <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative cursor-pointer">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className="relative z-10 text-center">
                                            <div className="w-16 h-16 md:w-20 md:h-20 bg-yellow-400 rounded-full flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform shadow-lg">
                                                <svg className="w-8 h-8 md:w-10 md:h-10 text-slate-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                            <p className="text-white text-sm md:text-base font-semibold">{featured.duration}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 md:p-5">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <h3 className="text-lg md:text-xl font-bold text-gray-900 flex-1">{featured.title}</h3>
                                            <div className="inline-block px-2 py-1 bg-yellow-100 border border-yellow-300 rounded text-xs font-semibold text-yellow-700 whitespace-nowrap">
                                                MAIN VIDEO
                                            </div>
                                        </div>
                                        {featured.description && (
                                            <p className="text-sm text-gray-600 mb-2">{featured.description}</p>
                                        )}
                                        {featured.date && (
                                            <p className="text-xs text-gray-500">{featured.date}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Other Videos - Sidebar List */}
                        {otherVideos.length > 0 && (
                            <div className="lg:w-1/3">
                                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                    {otherVideos.map((video) => (
                                        <div key={video.id} className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
                                            <div className="flex gap-3 p-3">
                                                <div className="relative w-32 h-20 md:w-40 md:h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <svg className="w-5 h-5 text-slate-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M8 5v14l11-7z" />
                                                        </svg>
                                                    </div>
                                                    {video.duration && (
                                                        <span className="absolute bottom-1 right-1 text-xs text-white bg-black/70 px-1.5 py-0.5 rounded font-semibold">{video.duration}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">{video.title}</h4>
                                                    {video.date && (
                                                        <p className="text-xs text-gray-600">{video.date}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Main Video - Show All Videos in Grid */}
                        {!featured && otherVideos.length > 0 && (
                            <div className="w-full">
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {otherVideos.map((video) => (
                                        <div key={video.id} className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
                                            <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                                                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <svg className="w-6 h-6 text-slate-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                                {video.duration && (
                                                    <span className="absolute bottom-2 right-2 text-xs text-white bg-black/70 px-2 py-1 rounded font-semibold">{video.duration}</span>
                                                )}
                                            </div>
                                            <div className="p-3">
                                                <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">{video.title}</h4>
                                                {video.date && (
                                                    <p className="text-xs text-gray-600">{video.date}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
