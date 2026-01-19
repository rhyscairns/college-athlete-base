'use client';

import type { MockPlayerData } from '../../data/mockPlayerData';

interface CoachesPerspectiveSectionProps {
    testimonials: MockPlayerData['coachTestimonials'];
}

export function CoachesPerspectiveSection({ testimonials }: CoachesPerspectiveSectionProps) {
    return (
        <section id="coaches" className="relative min-h-[calc(100vh-80px)] flex items-center px-6 py-12">
            <div className="max-w-7xl mx-auto w-full">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4">Coaches&apos; Perspective</h2>
                    <p className="text-lg md:text-xl text-slate-400">What the coaches say</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 hover:bg-white/10 hover:border-yellow-400/50 transition-all"
                        >
                            {/* Quote Icon */}
                            <div className="text-5xl text-yellow-400/30 mb-4">&ldquo;</div>

                            {/* Quote */}
                            <p className="text-base md:text-lg text-slate-200 mb-6 leading-relaxed italic">
                                {testimonial.quote}
                            </p>

                            {/* Coach Info */}
                            <div className="border-t border-white/10 pt-4">
                                <p className="text-white font-bold mb-1">{testimonial.coachName}</p>
                                <p className="text-sm text-slate-400">{testimonial.coachTitle}</p>
                                <p className="text-sm text-slate-500">{testimonial.coachOrganization}</p>
                            </div>

                            {/* Decorative element */}
                            <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-yellow-400/5 to-transparent rounded-tl-3xl"></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
