'use client';

import { TextInput } from '../inputs';
import type { VideosSectionProps, VideoItemProps, VideoLink } from '../../types';

function VideoItem({ video, index, isEditing, errors, onUpdate, onRemove, onBlur }: VideoItemProps) {
    return (
        <div className="p-4 border border-gray-300 rounded-lg space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                    label="Title"
                    name={`video-title-${index}`}
                    value={video.title || ''}
                    onChange={(value) => onUpdate(index, 'title', value)}
                    placeholder="Optional"
                    disabled={!isEditing}
                />
                <TextInput
                    label="YouTube URL"
                    name={`video-url-${index}`}
                    type="text"
                    value={video.url}
                    onChange={(value) => onUpdate(index, 'url', value)}
                    onBlur={() => onBlur && onBlur(`video_${index}_url`, video.url)}
                    error={errors?.[`video_${index}_url`]}
                    placeholder="Optional"
                    disabled={!isEditing}
                />
            </div>
            <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={video.isMain}
                        onChange={(e) => onUpdate(index, 'isMain', e.target.checked)}
                        className="w-4 h-4 mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Main Video</span>
                </label>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                    Remove Video
                </button>
            </div>
        </div>
    );
}

function VideoDisplay({ video }: { video: VideoLink }) {
    return (
        <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium text-gray-900">
                        {video.title || 'Untitled Video'}
                        {video.isMain && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                Main
                            </span>
                        )}
                    </p>
                    <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                    >
                        {video.url}
                    </a>
                </div>
            </div>
        </div>
    );
}

export function VideosSection({ formData, setFormData, errors, handleBlur, isEditing }: VideosSectionProps) {
    const addVideo = () => {
        const videos = formData.videos || [];
        if (videos.length >= 5) return;

        const newVideo: VideoLink = {
            id: `video-${Date.now()}`,
            url: '',
            title: '',
            description: '',
            isMain: videos.length === 0,
            order: videos.length + 1,
        };
        setFormData((prev) => ({ ...prev, videos: [...videos, newVideo] }));
    };

    const updateVideo = (index: number, field: keyof VideoLink, value: string | boolean) => {
        const videos = [...(formData.videos || [])];
        videos[index] = { ...videos[index], [field]: value };

        if (field === 'isMain' && value === true) {
            videos.forEach((v, i) => {
                if (i !== index) v.isMain = false;
            });
        }

        setFormData((prev) => ({ ...prev, videos }));
    };

    const removeVideo = (index: number) => {
        const videos = [...(formData.videos || [])];
        videos.splice(index, 1);
        setFormData((prev) => ({ ...prev, videos }));
    };

    const onBlur = (field: string, value: string) => {
        if (handleBlur) {
            handleBlur(field, value);
        }
    };

    const videos = formData.videos || [];

    return (
        <div className="space-y-4">
            <hr className="border-t-2 border-gray-300 my-6 mt-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Highlight Videos (Max 5)</h3>
            {isEditing ? (
                <div className="space-y-4">
                    {videos.map((video, index) => (
                        <VideoItem
                            key={video.id}
                            video={video}
                            index={index}
                            isEditing={isEditing}
                            errors={errors}
                            onUpdate={updateVideo}
                            onRemove={removeVideo}
                            onBlur={onBlur}
                        />
                    ))}
                    {videos.length < 5 && (
                        <button
                            type="button"
                            onClick={addVideo}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Add Video
                        </button>
                    )}
                </div>
            ) : (
                <div>
                    {videos.length > 0 ? (
                        <div className="space-y-4">
                            {videos.map((video) => (
                                <VideoDisplay key={video.id} video={video} />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-900">No videos added</p>
                    )}
                </div>
            )}
        </div>
    );
}
