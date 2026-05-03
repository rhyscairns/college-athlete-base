import type { Video } from '../../types';

type VideoCardVariant = 'featured' | 'sidebar' | 'grid';

interface VideoCardProps {
    video: Video;
    variant: VideoCardVariant;
    onClick: () => void;
}

export function VideoCard({ video, variant, onClick }: VideoCardProps) {
    const PlayIcon = () => (
        <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
        </svg>
    );

    if (variant === 'featured') {
        return (
            <button
                className="group relative rounded-2xl overflow-hidden transition-all cursor-pointer w-full text-left focus:outline-none"
                style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-3)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--brand-500)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--ink-3)')}
                onClick={onClick}
                aria-label={`Play featured video: ${video.title}`}
            >
                <div className="aspect-video flex items-center justify-center relative" style={{ background: 'var(--ink-0)' }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" aria-hidden="true" />
                    <div className="relative z-10 text-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform shadow-lg" style={{ background: 'var(--brand-500)' }} aria-hidden="true">
                            <div className="w-8 h-8 md:w-10 md:h-10 ml-1" style={{ color: 'var(--ink-0)' }}>
                                <PlayIcon />
                            </div>
                        </div>
                        <p className="text-sm md:text-base font-semibold" style={{ color: 'var(--text-hi)' }}>{video.duration || 'Click to play'}</p>
                    </div>
                </div>
                <div className="p-4 md:p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-lg md:text-xl font-bold flex-1" style={{ color: 'var(--text-hi)' }}>{video.title}</h3>
                        <span className="inline-block px-2 py-1 rounded text-xs font-semibold whitespace-nowrap" style={{ background: 'oklch(68% 0.22 150 / 0.15)', border: '1px solid oklch(68% 0.22 150 / 0.3)', color: 'var(--brand-500)' }} aria-label="Featured video">
                            MAIN VIDEO
                        </span>
                    </div>
                    {video.description && (
                        <p className="text-sm mb-2" style={{ color: 'var(--text-mid)' }}>{video.description}</p>
                    )}
                    {video.date && (
                        <p className="text-xs" style={{ color: 'var(--text-lo)' }}>{video.date}</p>
                    )}
                </div>
            </button>
        );
    }

    if (variant === 'sidebar') {
        return (
            <button
                className="group relative rounded-xl overflow-hidden transition-all cursor-pointer w-full text-left focus:outline-none"
                style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-3)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--brand-500)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--ink-3)')}
                onClick={onClick}
                aria-label={`Play video: ${video.title}`}
                role="listitem"
            >
                <div className="flex gap-3 p-3">
                    <div className="relative w-32 h-20 md:w-40 md:h-24 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--ink-0)' }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: 'var(--brand-500)' }} aria-hidden="true">
                            <div className="w-5 h-5 ml-0.5" style={{ color: 'var(--ink-0)' }}>
                                <PlayIcon />
                            </div>
                        </div>
                        {video.duration && (
                            <span className="absolute bottom-1 right-1 text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: 'oklch(0% 0 0 / 0.7)', color: 'var(--text-hi)' }}>{video.duration}</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm md:text-base font-semibold mb-1 line-clamp-2 transition-colors" style={{ color: 'var(--text-hi)' }}>{video.title}</h4>
                        {video.date && (
                            <p className="text-xs" style={{ color: 'var(--text-mid)' }}>{video.date}</p>
                        )}
                    </div>
                </div>
            </button>
        );
    }

    // Grid variant
    return (
        <button
            className="group relative rounded-xl overflow-hidden transition-all cursor-pointer w-full text-left focus:outline-none"
            style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-3)' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--brand-500)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--ink-3)')}
            onClick={onClick}
            aria-label={`Play video: ${video.title}`}
            role="listitem"
        >
            <div className="aspect-video flex items-center justify-center relative" style={{ background: 'var(--ink-0)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ background: 'var(--brand-500)' }} aria-hidden="true">
                    <div className="w-6 h-6 ml-0.5" style={{ color: 'var(--ink-0)' }}>
                        <PlayIcon />
                    </div>
                </div>
                {video.duration && (
                    <span className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded font-semibold" style={{ background: 'oklch(0% 0 0 / 0.7)', color: 'var(--text-hi)' }}>{video.duration}</span>
                )}
            </div>
            <div className="p-3">
                <h4 className="text-sm font-semibold mb-1 line-clamp-2 transition-colors" style={{ color: 'var(--text-hi)' }}>{video.title}</h4>
                {video.date && (
                    <p className="text-xs" style={{ color: 'var(--text-mid)' }}>{video.date}</p>
                )}
            </div>
        </button>
    );
}
