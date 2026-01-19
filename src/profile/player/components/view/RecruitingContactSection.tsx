'use client';

import type { RecruitingContactSectionProps } from '../../types';

export function RecruitingContactSection({ contact }: RecruitingContactSectionProps) {
    return (
        <section id="contact" className="relative min-h-[calc(100vh-80px)] flex items-center px-6 py-12">
            <div className="max-w-7xl mx-auto w-full">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4">Get In Touch</h2>
                    <p className="text-lg md:text-xl text-slate-400">Ready to recruit? Let&apos;s connect</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
                    {/* Player Contact */}
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10">
                        <h3 className="text-2xl font-bold text-white mb-6">Player Contact</h3>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">Email</p>
                                    <a href={`mailto:${contact.email}`} className="text-white hover:text-yellow-400 transition-colors break-all">
                                        {contact.email}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">Phone</p>
                                    <a href={`tel:${contact.phone}`} className="text-white hover:text-yellow-400 transition-colors">
                                        {contact.phone}
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <p className="text-sm text-slate-400 mb-4">Follow on social media</p>
                            <div className="flex gap-3">
                                <a href={contact.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-yellow-400/20 rounded-lg flex items-center justify-center transition-all hover:scale-110">
                                    <span className="text-xl">𝕏</span>
                                </a>
                                <a href={contact.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-yellow-400/20 rounded-lg flex items-center justify-center transition-all hover:scale-110">
                                    <span className="text-xl">📷</span>
                                </a>
                                <a href={contact.socialMedia.hudl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 hover:bg-yellow-400/20 rounded-lg flex items-center justify-center transition-all hover:scale-110">
                                    <span className="text-xl">🎥</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Coach Contact */}
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10">
                        <h3 className="text-2xl font-bold text-white mb-6">Head Coach</h3>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Name</p>
                                <p className="text-xl font-semibold text-white">{contact.headCoach.name}</p>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">Email</p>
                                    <a href={`mailto:${contact.headCoach.email}`} className="text-white hover:text-blue-400 transition-colors break-all">
                                        {contact.headCoach.email}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">Phone</p>
                                    <a href={`tel:${contact.headCoach.phone}`} className="text-white hover:text-blue-400 transition-colors">
                                        {contact.headCoach.phone}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
