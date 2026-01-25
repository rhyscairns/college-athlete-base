'use client';

import { useState, useEffect, useRef } from 'react';
import type { GameHighlightsSectionProps, ValidationErrors } from '../../types';
import { EditButton } from './EditButton';
import { GameHighlightsSectionEdit } from './GameHighlightsSectionEdit';
import { validateVideosSection } from '../../utils/validation';

interface Video {
    id: string;
    title: string;
    description?: string;
    url: string;
    thumbnail?: string;
    duration?: string;
    isFeatured?: boolean;
    date?: string;
}

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
                videos: formData,
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

    return (
        <section
            id="highlights"
            ref={sectionRef}
            className={`relative min-h-[calc(100vh-80px)] flex items-center px-6 py-12 transition-all duration-300 ease-in-out ${isEditing ? 'bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6' : ''
                }`}
        >
            <div className="max-w-7xl mx-auto w-full">
                {/* Section Header with Edit Button */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white">
                            Game Highlights
                        </h2>
                        {isOwner && !isEditing && (
                            <EditButton
                                onClick={() => onEdit?.()}
                                disabled={isAnyOtherSectionEditing}
                                tooltip={
                                    isAnyOtherSectionEditing
                                        ? 'Another section is being edited'
                                        : undefined
                                }
                            />
                        )}
                    </div>
                    <p className="text-lg md:text-xl text-slate-400">Watch the action</p>
                </div>

                {isEditing ? (
                    <GameHighlightsSectionEdit
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                        isSaving={isSaving}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                ) : (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Featured Video */}
                        {featured && (
                            <div className="lg:col-span-2">
                                <div className="group relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-yellow-400/50 transition-all h-full">
                                    <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className="relative z-10 text-center">
                                            <div className="w-16 h-16 md:w-20 md:h-20 bg-yellow-400 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                                                <svg className="w-8 h-8 md:w-10 md:h-10 text-slate-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                            <p className="text-white text-sm md:text-base font-semibold">{featured.duration}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 md:p-6">
                                        <div className="inline-block px-3 py-1 bg-yellow-400/20 border border-yellow-400/50 rounded-full text-xs font-semibold text-yellow-300 mb-3">
                                            FEATURED
                                        </div>
                                        <h3 className="text-lg md:text-xl font-bold text-white mb-2">{featured.title}</h3>
                                        <p className="text-sm md:text-base text-slate-400">{featured.description}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Other Videos */}
                        <div className="space-y-4 overflow-y-auto max-h-[500px] lg:max-h-full">
                            {otherVideos.map((video) => (
                                <div key={video.id} className="group relative bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-yellow-400/50 hover:bg-white/10 transition-all">
                                    <div className="flex gap-4 p-4">
                                        <div className="relative w-24 h-16 md:w-32 md:h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <div className="w-8 h-8 bg-yellow-400/80 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4 text-slate-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                            <span className="absolute bottom-1 right-1 text-xs text-white bg-black/60 px-1 rounded">{video.duration}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm md:text-base font-semibold text-white mb-1 line-clamp-2">{video.title}</h4>
                                            <p className="text-xs text-slate-400">{video.date}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
