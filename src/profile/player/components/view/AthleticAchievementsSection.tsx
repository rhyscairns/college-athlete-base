'use client';

import type { MockPlayerData } from '../../data/mockPlayerData';

interface AthleticAchievementsSectionProps {
    achievements: MockPlayerData['achievements'];
}

export function AthleticAchievementsSection({ achievements }: AthleticAchievementsSectionProps) {
    const iconMap: Record<string, string> = {
        trophy: '🏆',
        medal: '🥇',
        star: '⭐',
        lightning: '⚡',
        target: '🎯',
        award: '🏅',
    };

    return (
        <section id="achievements" className="relative min-h-[calc(100vh-80px)] flex items-center px-6 py-12">
            <div className="max-w-7xl mx-auto w-full">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4">Achievements & Honors</h2>
                    <p className="text-lg md:text-xl text-slate-400">Recognition and accomplishments</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {achievements.map((achievement) => (
                        <div
                            key={achievement.id}
                            className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-yellow-400/50 hover:scale-105 transition-all duration-300"
                        >
                            <div className="text-4xl md:text-5xl mb-4">{iconMap[achievement.icon] || '🏆'}</div>
                            <h3 className="text-lg md:text-xl font-bold text-white mb-2">{achievement.title}</h3>
                            <p className="text-sm md:text-base text-slate-300">{achievement.description}</p>

                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-bl-3xl"></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
