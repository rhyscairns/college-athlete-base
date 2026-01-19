'use client';

import type { MockPlayerData } from '../../data/mockPlayerData';

interface GameHighlightsSectionProps {
    videos: MockPlayerData['videos'];
}

export function GameHighlightsSection({ videos }: GameHighlightsSectionProps) {
    const featured = videos.find(v => v.isFeatured);
    const otherVideos = videos.filter(v => !v.isFeatured);

    return (
        <section id="highlights" className="relative min-h-[calc(100vh-80px)] flex items-center px-6 py-12">
            <div className="max-w-7xl mx-auto w-full">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4">Game Highlights</h2>
                    <p className="text-lg md:text-xl text-slate-400">Watch the action</p>
                </div>

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
            </div>
        </section>
    );
}
