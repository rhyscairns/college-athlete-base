'use client';

import type { StatsShowcaseProps } from '../../types';

export function StatsShowcase({ stats }: StatsShowcaseProps) {
    const statCards = [
        { label: 'Receiving Yards', value: stats.receivingYards.toLocaleString(), sublabel: 'Junior Season' },
        { label: 'Touchdowns', value: stats.touchdowns, sublabel: '2023-24' },
        { label: 'Receptions', value: stats.receptions, sublabel: 'Total Catches' },
        { label: 'Yards/Catch', value: stats.yardsPerCatch, sublabel: 'Average' },
        { label: 'Longest Reception', value: `${stats.longestReception}`, sublabel: 'Yards' },
    ];

    return (
        <section id="stats" className="relative min-h-[calc(100vh-80px)] flex items-center px-6 py-12">
            <div className="max-w-7xl mx-auto w-full">
                <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-6xl font-black text-white mb-4">Season Statistics</h2>
                    <p className="text-xl text-slate-400">Junior Year Performance • 2023-24</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {statCards.map((stat, idx) => (
                        <div
                            key={idx}
                            className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 hover:border-yellow-400/50 hover:scale-105 transition-all duration-300"
                        >
                            <div className="text-center">
                                <div className="text-5xl font-black text-yellow-400 mb-3">{stat.value}</div>
                                <div className="text-sm font-bold text-white uppercase tracking-wide mb-1">{stat.label}</div>
                                <div className="text-xs text-slate-400">{stat.sublabel}</div>
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-amber-500/0 group-hover:from-yellow-400/5 group-hover:to-amber-500/5 rounded-2xl transition-all"></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
