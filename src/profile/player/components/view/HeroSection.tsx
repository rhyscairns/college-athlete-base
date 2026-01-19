'use client';

import type { HeroSectionProps } from '../../types';

export function HeroSection({ player }: HeroSectionProps) {
    return (
        <section id="hero" className="relative min-h-[calc(100vh-80px)] flex items-center py-12 px-6">
            <div className="max-w-7xl mx-auto w-full">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Player Info */}
                    <div className="space-y-6">
                        {/* Status Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-400/50 rounded-full">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                            <span className="text-xs font-semibold text-emerald-300 tracking-wide uppercase">Open to Recruitment</span>
                        </div>

                        {/* Player Name */}
                        <div>
                            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white leading-tight mb-2">
                                {player.firstName}
                            </h1>
                            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                                {player.lastName}
                            </h1>
                        </div>

                        {/* Position & School */}
                        <div className="space-y-1">
                            <p className="text-2xl font-bold text-blue-400">{player.position}</p>
                            <p className="text-lg text-slate-300">{player.school}</p>
                            <p className="text-base text-slate-400">{player.location} • Class of {player.classYear}</p>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-3 pt-4">
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                <p className="text-xs text-slate-400 uppercase mb-1">Height</p>
                                <p className="text-xl font-bold text-white">{player.height}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                <p className="text-xs text-slate-400 uppercase mb-1">Weight</p>
                                <p className="text-xl font-bold text-white">{player.weight}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                <p className="text-xs text-slate-400 uppercase mb-1">GPA</p>
                                <p className="text-xl font-bold text-white">{player.academic.gpa}</p>
                            </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="space-y-2 pt-4">
                            <p className="text-xs font-bold text-slate-400 uppercase">Performance Highlights</p>
                            {player.performanceMetrics.map((metric, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                                    <span className="text-sm text-slate-300">{metric.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side - Player Image */}
                    <div className="relative hidden lg:block">
                        <div className="relative aspect-[3/4] max-w-md mx-auto">
                            <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-transparent rounded-2xl blur-2xl"></div>

                            <div className="relative h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-white/10 flex items-center justify-center">
                                <span className="text-9xl font-black text-white/5">{player.initials}</span>

                                <div className="absolute top-6 right-6 w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-xl">
                                    <span className="text-2xl font-black text-slate-900">{player.initials}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
