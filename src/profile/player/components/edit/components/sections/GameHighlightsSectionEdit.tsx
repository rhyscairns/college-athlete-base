import React from 'react';
import { TextInput } from '../inputs/TextInput';
import { ActionButtons } from './ActionButtons';
import type { GameHighlightsSectionEditProps, Video } from '../../../../types';

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

    const handleSetMainVideo = (index: number) => {
        setFormData((prev) => {
            return prev.map((video, i) => ({
                ...video,
                isFeatured: i === index,
            }));
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
        <div className="space-y-4 p-6 sm:p-8 bg-white rounded-2xl shadow-lg animate-fade-in">
            <div className="space-y-4">
                {formData.map((video, index) => (
                    <div
                        key={video.id}
                        className="space-y-3 p-6 bg-gray-50 rounded-xl border border-gray-200"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <div className="flex items-center gap-3">
                                <h4 className="text-sm font-semibold text-gray-900">
                                    Video {index + 1}
                                    {video.isFeatured && (
                                        <span className="ml-2 px-2 py-0.5 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-700 font-medium">
                                            MAIN VIDEO
                                        </span>
                                    )}
                                </h4>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveVideo(index)}
                                disabled={isSaving}
                                className="min-h-[44px] w-full sm:w-auto px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                            >
                                Remove
                            </button>
                        </div>

                        {/* Main Video Selection */}
                        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <input
                                type="radio"
                                id={`main-video-${index}`}
                                name="main-video"
                                checked={video.isFeatured || false}
                                onChange={() => handleSetMainVideo(index)}
                                disabled={isSaving}
                                className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            />
                            <label
                                htmlFor={`main-video-${index}`}
                                className="text-sm font-medium text-gray-700 cursor-pointer"
                            >
                                Set as main video (appears on player card)
                            </label>
                        </div>

                        <TextInput
                            label="Title"
                            name={`video-title-${index}`}
                            value={video.title}
                            onChange={(value: string) => handleVideoChange(index, 'title', value)}
                            error={errors[`video-${index}-title`]}
                            disabled={isSaving}
                            placeholder="e.g., Junior Season Highlights"
                            required
                        />

                        <TextInput
                            label="URL"
                            name={`video-url-${index}`}
                            value={video.url}
                            onChange={(value: string) => handleVideoChange(index, 'url', value)}
                            error={errors[`video-${index}-url`]}
                            disabled={isSaving}
                            placeholder="https://youtube.com/watch?v=..."
                            required
                        />

                        {video.url && !validateUrl(video.url) && (
                            <p className="text-sm text-red-600 -mt-2">
                                Please enter a valid URL
                            </p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <TextInput
                                label="Description"
                                name={`video-description-${index}`}
                                value={video.description || ''}
                                onChange={(value: string) => handleVideoChange(index, 'description', value)}
                                error={errors[`video-${index}-description`]}
                                disabled={isSaving}
                                placeholder="Brief description"
                            />

                            <TextInput
                                label="Duration"
                                name={`video-duration-${index}`}
                                value={video.duration || ''}
                                onChange={(value: string) => handleVideoChange(index, 'duration', value)}
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
                                onChange={(value: string) => handleVideoChange(index, 'date', value)}
                                error={errors[`video-${index}-date`]}
                                disabled={isSaving}
                                placeholder="e.g., Sept 2023"
                            />

                            <TextInput
                                label="Thumbnail URL"
                                name={`video-thumbnail-${index}`}
                                value={video.thumbnail || ''}
                                onChange={(value: string) => handleVideoChange(index, 'thumbnail', value)}
                                error={errors[`video-${index}-thumbnail`]}
                                disabled={isSaving}
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                ))}
            </div>

            {formData.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                    No videos added yet. Click "Add Video" to get started.
                </p>
            )}

            <button
                type="button"
                onClick={handleAddVideo}
                disabled={isSaving}
                className="min-h-[44px] w-full sm:w-auto px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-sm font-semibold hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
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
