import type { Video } from '../../types';

type VideoCardVariant = 'featured' | 'sidebar' | 'grid';

interface VideoCardProps {
    video: Video;
    variant: VideoCardVariant;
    onClick: () => void;
}

/**
 * VideoCard Component
 * 
 * Reusable video card component that displays video information with different layouts.
 * Supports three variants: featured (large), sidebar (compact horizontal), and grid (medium).
 * 
 * @param props - Component props
 * @param props.video - Video object containing title, description, duration, date, etc.
 * @param props.variant - Display variant: 'featured', 'sidebar', or 'grid'
 * @param props.onClick - Callback when the video card is clicked
 * @returns Accessible button element styled as a video card
 */
export function VideoCard({ video, variant, onClick }: VideoCardProps) {
    const PlayIcon = () => (
        <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
        </svg>
    );

    if (variant === 'featured') {
        return (
            <button
                className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden border border-gray-200 hover:border-yellow-400 hover:shadow-xl transition-all cursor-pointer w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={onClick}
                aria-label={`Play featured video: ${video.title}`}
            >
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" aria-hidden="true"></div>
                    <div className="relative z-10 text-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-yellow-400 rounded-full flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform shadow-lg" aria-hidden="true">
                            <div className="w-8 h-8 md:w-10 md:h-10 text-slate-900 ml-1">
                                <PlayIcon />
                            </div>
                        </div>
                        <p className="text-white text-sm md:text-base font-semibold">{video.duration || 'Click to play'}</p>
                    </div>
                </div>
                <div className="p-4 md:p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 flex-1">{video.title}</h3>
                        <span className="inline-block px-2 py-1 bg-yellow-100 border border-yellow-300 rounded text-xs font-semibold text-yellow-700 whitespace-nowrap" aria-label="Featured video">
                            MAIN VIDEO
                        </span>
                    </div>
                    {video.description && (
                        <p className="text-sm text-gray-600 mb-2">{video.description}</p>
                    )}
                    {video.date && (
                        <p className="text-xs text-gray-500">{video.date}</p>
                    )}
                </div>
            </button>
        );
    }

    if (variant === 'sidebar') {
        return (
            <button
                className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={onClick}
                aria-label={`Play video: ${video.title}`}
                role="listitem"
            >
                <div className="flex gap-3 p-3">
                    <div className="relative w-32 h-20 md:w-40 md:h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" aria-hidden="true">
                            <div className="w-5 h-5 text-slate-900 ml-0.5">
                                <PlayIcon />
                            </div>
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
            </button>
        );
    }

    // Grid variant
    return (
        <button
            className="group relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={onClick}
            aria-label={`Play video: ${video.title}`}
            role="listitem"
        >
            <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" aria-hidden="true">
                    <div className="w-6 h-6 text-slate-900 ml-0.5">
                        <PlayIcon />
                    </div>
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
        </button>
    );
}
