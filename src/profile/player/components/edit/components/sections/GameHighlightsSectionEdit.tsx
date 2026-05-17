import React from 'react';
import { TextInput } from '../inputs/TextInput';
import { ActionButtons } from './ActionButtons';
import type { GameHighlightsSectionEditProps, Video } from '../../../../types';
import { extractYouTubeThumbnail } from '../../../../utils/video-helpers';

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
            const current = updated[index];
            updated[index] = { ...current, [field]: value };

            if (field === 'url') {
                const derived = extractYouTubeThumbnail(value);
                const existingThumb = current.thumbnail || '';
                // Only overwrite thumbnail if it's empty or was previously auto-derived
                const wasAutoDerived =
                    existingThumb === '' ||
                    existingThumb === (extractYouTubeThumbnail(current.url || '') ?? '');
                if (wasAutoDerived) {
                    updated[index] = { ...updated[index], thumbnail: derived || '' };
                }
            }

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
        const isFirst = formData.length === 0;
        const newVideo: Video = {
            id: `video-${Date.now()}`,
            title: '',
            description: '',
            url: '',
            thumbnail: '',
            duration: '',
            isFeatured: isFirst,
            date: '',
        };
        setFormData((prev) => [...prev, newVideo]);
    };

    const handleRemoveVideo = (index: number) => {
        setFormData((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            const hasFeatured = updated.some((v) => v.isFeatured);
            if (!hasFeatured && updated.length > 0) {
                updated[0] = { ...updated[0], isFeatured: true };
            }
            return updated;
        });
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
        <div className="space-y-4 p-6 sm:p-8 rounded-2xl animate-fade-in" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}>
            <div className="space-y-4">
                {formData.map((video, index) => (
                    <div
                        key={video.id}
                        className="space-y-3 p-6 rounded-xl"
                        style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-3)' }}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <div className="flex items-center gap-3">
                                <h4 className="text-sm font-semibold" style={{ color: 'var(--text-hi)' }}>
                                    Video {index + 1}
                                    {video.isFeatured && (
                                        <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium" style={{ background: 'oklch(68% 0.22 150 / 0.15)', color: 'var(--brand-500)', border: '1px solid oklch(68% 0.22 150 / 0.3)' }}>
                                            MAIN VIDEO
                                        </span>
                                    )}
                                </h4>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveVideo(index)}
                                disabled={isSaving}
                                className="min-h-[44px] w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                                style={{ background: 'oklch(60% 0.22 25 / 0.1)', color: 'var(--status-danger)', border: '1px solid oklch(60% 0.22 25 / 0.3)' }}
                            >
                                Remove
                            </button>
                        </div>

                        {/* Main Video Selection — only shown when there are multiple videos */}
                        {formData.length > 1 && (
                            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'oklch(68% 0.22 150 / 0.08)', border: '1px solid oklch(68% 0.22 150 / 0.25)' }}>
                                <input
                                    type="radio"
                                    id={`main-video-${index}`}
                                    name="main-video"
                                    checked={video.isFeatured || false}
                                    onChange={() => handleSetMainVideo(index)}
                                    disabled={isSaving}
                                    className="w-4 h-4 disabled:opacity-50"
                                />
                                <label
                                    htmlFor={`main-video-${index}`}
                                    className="text-sm font-medium cursor-pointer"
                                    style={{ color: 'var(--text-mid)' }}
                                >
                                    Set as main video (appears on player card)
                                </label>
                            </div>
                        )}

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
                            <p className="text-sm -mt-2" style={{ color: 'var(--status-danger)' }}>
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
                            {video.thumbnail && (
                                <div className="mt-2">
                                    <img
                                        src={video.thumbnail}
                                        alt="Thumbnail preview"
                                        className="h-16 rounded object-cover"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {formData.length === 0 && (
                <p className="text-center py-8" style={{ color: 'var(--text-lo)' }}>
                    No videos added yet. Click "Add Video" to get started.
                </p>
            )}

            <button
                type="button"
                onClick={handleAddVideo}
                disabled={isSaving}
                className="min-h-[44px] w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                style={{ background: 'oklch(68% 0.22 150 / 0.1)', color: 'var(--brand-500)', border: '1px solid oklch(68% 0.22 150 / 0.3)' }}
            >
                + Add Video
            </button>

            {errors.videos && (
                <p className="text-sm" style={{ color: 'var(--status-danger)' }}>{errors.videos}</p>
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
