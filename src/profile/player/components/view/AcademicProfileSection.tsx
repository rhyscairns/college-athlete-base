'use client';

import type { AcademicProfileSectionProps } from '../../types';

export function AcademicProfileSection({ academic }: AcademicProfileSectionProps) {
    return (
        <section id="academics" className="relative min-h-[calc(100vh-80px)] flex items-center px-6 py-12">
            <div className="max-w-7xl mx-auto w-full">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4">Academic Profile</h2>
                    <p className="text-lg md:text-xl text-slate-400">Excellence in the classroom</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* GPA Card */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10">
                            <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">GPA</p>
                            <p className="text-5xl md:text-6xl font-black text-yellow-400 mb-2">{academic.gpa}</p>
                            <p className="text-slate-300">{academic.gpaScale}</p>
                        </div>

                        {/* Test Scores */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10">
                            <p className="text-sm text-slate-400 uppercase tracking-wider mb-4">Test Scores</p>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-lg font-bold text-white mb-1">SAT: {academic.satScore}</p>
                                    <p className="text-sm text-slate-400">Math: {academic.satMath} • Reading: {academic.satReading}</p>
                                </div>
                            </div>
                        </div>

                        {/* Class Rank */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10">
                            <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">Class Rank</p>
                            <p className="text-2xl md:text-3xl font-bold text-white mb-1">{academic.classRank}</p>
                            <p className="text-sm text-slate-300">{academic.classRankDetail}</p>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* NCAA Eligibility */}
                        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-emerald-400/30">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                                <p className="text-sm font-bold text-emerald-300 uppercase tracking-wider">NCAA Eligible</p>
                            </div>
                            <p className="text-lg text-white mb-2">Eligibility Center ID</p>
                            <p className="text-2xl font-mono text-slate-300">{academic.ncaaEligibilityCenter}</p>
                        </div>

                        {/* Coursework */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10">
                            <p className="text-sm text-slate-400 uppercase tracking-wider mb-4">Advanced Coursework</p>
                            <div className="space-y-3">
                                {academic.coursework.map((course, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                        <span className="text-white">{course}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
