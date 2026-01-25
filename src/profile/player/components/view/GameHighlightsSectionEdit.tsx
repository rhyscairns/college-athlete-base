import React from 'react';
import { TextInput } from '../edit/inputs/TextInput';
import { ActionButtons } from './ActionButtons';
import type { ValidationErrors } from '../../types';

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

interface GameHighlightsSectionEditProps {
    formData: Video[];
    setFormData: React.Dispatch<React.SetStateAction<Video[]>>;
    errors: ValidationErrors;
    isSaving: boolean;
    onSave: () => void;
    onCancel: () => void;
}

export function GameHighlightsSectionEdit({
    formData,
    setFormData,
    errors,
    isSaving,
    onSave,
    onCancel,
}: GameHighlightsSectionEditProps) {
    const handleVideoChange = (index: number, field: keyof Video, value: string) => {
        setFormData((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [field]: value,
            };
            return updated;
        });
    };

    const handleAddVideo = () => {
        const newVideo: Video = {
            id: `video-${Date.now()}`,
            title: '',
            description: '',
            url: '',
            thumbnail: '',
            duration: '',
            isFeatured: false,
            date: '',
        };
        setFormData((prev) => [...prev, newVideo]);
    };

    const handleRemoveVideo = (index: number) => {
        setFormData((prev) => prev.filter((_, i) => i !== index));
    };

    const validateUrl = (url: string): boolean => {
        if (!url) return false;
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    return (
        <div className="space-y-4 p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10 animate-fade-in">
            <div className="space-y-6">
                {formData.map((video, index) => (
                    <div
                        key={video.id}
                        className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <h4 className="text-sm font-semibold text-white">
                                Video {index + 1}
                                {video.isFeatured && (
                                    <span className="ml-2 px-2 py-0.5 bg-yellow-400/20 border border-yellow-400/50 rounded text-xs text-yellow-300">
                                        FEATURED
                                    </span>
                                )}
                            </h4>
                            <button
                                type="button"
                                onClick={() => handleRemoveVideo(index)}
                                disabled={isSaving}
                                className="min-h-[44px] w-full sm:w-auto px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-semibold hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation"
                            >
                                Remove
                            </button>
                        </div>

                        <TextInput
                            label="Title"
                            name={`video-title-${index}`}
                            value={video.title}
                            onChange={(value) => handleVideoChange(index, 'title', value)}
                            error={errors[`video-${index}-title`]}
                            disabled={isSaving}
                            placeholder="e.g., Junior Season Highlights"
                            required
                        />

                        <TextInput
                            label="URL"
                            name={`video-url-${index}`}
                            value={video.url}
                            onChange={(value) => handleVideoChange(index, 'url', value)}
                            error={errors[`video-${index}-url`]}
                            disabled={isSaving}
                            placeholder="https://youtube.com/watch?v=..."
                            required
                        />

                        {video.url && !validateUrl(video.url) && (
                            <p className="text-sm text-red-400 -mt-2">
                                Please enter a valid URL
                            </p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <TextInput
                                label="Description"
                                name={`video-description-${index}`}
                                value={video.description || ''}
                                onChange={(value) => handleVideoChange(index, 'description', value)}
                                error={errors[`video-${index}-description`]}
                                disabled={isSaving}
                                placeholder="Brief description"
                            />

                            <TextInput
                                label="Duration"
                                name={`video-duration-${index}`}
                                value={video.duration || ''}
                                onChange={(value) => handleVideoChange(index, 'duration', value)}
                                error={errors[`video-${index}-duration`]}
                                disabled={isSaving}
                                placeholder="e.g., 5:45"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <TextInput
                                label="Date"
                                name={`video-date-${index}`}
                                value={video.date || ''}
                                onChange={(value) => handleVideoChange(index, 'date', value)}
                                error={errors[`video-${index}-date`]}
                                disabled={isSaving}
                                placeholder="e.g., Sept 2023"
                            />

                            <TextInput
                                label="Thumbnail URL"
                                name={`video-thumbnail-${index}`}
                                value={video.thumbnail || ''}
                                onChange={(value) => handleVideoChange(index, 'thumbnail', value)}
                                error={errors[`video-${index}-thumbnail`]}
                                disabled={isSaving}
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                ))}
            </div>

            {formData.length === 0 && (
                <p className="text-center text-slate-400 py-8">
                    No videos added yet. Click "Add Video" to get started.
                </p>
            )}

            <button
                type="button"
                onClick={handleAddVideo}
                disabled={isSaving}
                className="min-h-[44px] w-full sm:w-auto px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-semibold hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation"
            >
                + Add Video
            </button>

            {errors.videos && (
                <p className="text-sm text-red-600">{errors.videos}</p>
            )}

            {/* Action Buttons */}
            <ActionButtons
                onSave={onSave}
                onCancel={onCancel}
                isSaving={isSaving}
                disabled={isSaving}
            />
        </div>
    );
}
