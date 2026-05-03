'use client';

import React from 'react';
import Image from 'next/image';
import type { CoachProfile } from '../../types';

export interface CoachHeroSectionProps {
    coach: CoachProfile;
    isOwner?: boolean;
    isEditing?: boolean;
    onEdit?: () => void;
}

// Shared icon row used for contact + university detail items
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--ink-3)' }}>
                {icon}
            </div>
            <div>
                <p className="text-xs" style={{ color: 'var(--text-lo)' }}>{label}</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-hi)' }}>{value}</p>
            </div>
        </div>
    );
}

export const CoachHeroSection = React.memo(function CoachHeroSection({
    coach,
    isOwner = false,
    isEditing = false,
    onEdit,
}: CoachHeroSectionProps) {
    const fullName = `${coach.firstName || 'First'} ${coach.lastName || 'Last'}`;
    const initials = `${coach.firstName?.charAt(0) || 'F'}${coach.lastName?.charAt(0) || 'L'}`;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}>

                {/* ── Hero header ── */}
                <div
                    className="px-6 py-8 sm:px-8 sm:py-10 relative"
                    style={{
                        background: `radial-gradient(ellipse 80% 120% at 0% 50%, oklch(68% 0.22 150 / 0.15) 0%, transparent 60%), var(--ink-2)`,
                        borderBottom: '1px solid var(--ink-3)',
                    }}
                >
                    {isOwner && !isEditing && (
                        <button
                            onClick={() => onEdit?.()}
                            className="absolute top-4 right-4 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-white transition-colors"
                            style={{ background: 'var(--ink-3)', color: 'var(--text-hi)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink-0)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink-3)')}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Profile
                        </button>
                    )}

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden" style={{ border: '3px solid var(--brand-500)' }}>
                                {coach.profileImage ? (
                                    <Image src={coach.profileImage} alt={fullName} width={128} height={128} className="object-cover w-full h-full" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--ink-3)' }}>
                                        <span className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--brand-500)' }}>{initials}</span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full" style={{ background: 'var(--status-success)', border: '3px solid var(--ink-2)' }} />
                        </div>

                        <div className="flex-1">
                            <h1 className="font-black tracking-tight mb-1" style={{ fontSize: 'clamp(1.5rem, 3vw + 0.5rem, 2rem)', color: 'var(--text-hi)' }}>
                                {fullName}
                            </h1>
                            <p className="text-lg mb-1" style={{ color: 'var(--brand-500)', fontWeight: 500 }}>
                                {coach.position || 'Head Coach'}
                            </p>
                            <p className="text-base" style={{ color: 'var(--text-mid)' }}>
                                {coach.university || 'University Name'}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {coach.sport && (
                                    <span className="px-3 py-1 text-sm font-semibold rounded-full" style={{ background: 'oklch(68% 0.22 150 / 0.15)', border: '1px solid oklch(68% 0.22 150 / 0.3)', color: 'var(--brand-500)' }}>
                                        {coach.sport}
                                    </span>
                                )}
                                {coach.division && (
                                    <span className="px-3 py-1 text-sm font-semibold rounded-full" style={{ background: 'var(--ink-3)', color: 'var(--text-mid)' }}>
                                        {coach.division}
                                    </span>
                                )}
                                {coach.yearsExperience && (
                                    <span className="px-3 py-1 text-sm font-semibold rounded-full" style={{ background: 'var(--ink-3)', color: 'var(--text-mid)' }}>
                                        {coach.yearsExperience} Years Experience
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Two column body ── */}
                <div className="grid md:grid-cols-2 gap-6 p-6 sm:p-8">

                    {/* Contact Information */}
                    <div>
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--ink-3)' }}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--brand-500)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-base font-bold" style={{ color: 'var(--text-hi)' }}>Contact Information</h2>
                        </div>

                        <div className="space-y-4">
                            <InfoRow
                                label="Email"
                                value={coach.email}
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--brand-500)' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                            />
                            {coach.phone && (
                                <InfoRow
                                    label="Phone"
                                    value={coach.phone}
                                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--brand-500)' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                                />
                            )}
                            {coach.officeLocation && (
                                <InfoRow
                                    label="Office Location"
                                    value={coach.officeLocation}
                                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--brand-500)' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                                />
                            )}
                            {coach.officeHours && (
                                <InfoRow
                                    label="Office Hours"
                                    value={coach.officeHours}
                                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--brand-500)' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                />
                            )}
                        </div>
                    </div>

                    {/* University Information */}
                    <div>
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--ink-3)' }}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--brand-500)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h2 className="text-base font-bold" style={{ color: 'var(--text-hi)' }}>University Information</h2>
                        </div>

                        {/* University card */}
                        <div className="rounded-xl p-6 mb-4 text-center" style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-3)' }}>
                            {coach.universityLogoUrl ? (
                                <div className="w-20 h-20 mx-auto mb-3 relative">
                                    <Image src={coach.universityLogoUrl} alt={coach.university || 'University Logo'} width={80} height={80} className="object-contain" />
                                </div>
                            ) : (
                                <div className="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'var(--ink-3)' }}>
                                    <span className="text-2xl font-bold" style={{ color: 'var(--brand-500)' }}>
                                        {coach.university?.split(' ').map(w => w[0]).join('').slice(0, 3) || 'UNI'}
                                    </span>
                                </div>
                            )}
                            <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-hi)' }}>
                                {coach.university || 'University Name'}
                            </h3>
                            <p className="text-sm" style={{ color: 'var(--text-mid)' }}>Athletics Department</p>
                        </div>

                        <div className="space-y-3">
                            {coach.conference && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm" style={{ color: 'var(--text-mid)' }}>Conference:</span>
                                    <span className="text-sm font-semibold" style={{ color: 'var(--text-hi)' }}>{coach.conference}</span>
                                </div>
                            )}
                            {coach.division && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm" style={{ color: 'var(--text-mid)' }}>Division:</span>
                                    <span className="text-sm font-semibold" style={{ color: 'var(--text-hi)' }}>{coach.division}</span>
                                </div>
                            )}
                            {coach.teamName && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm" style={{ color: 'var(--text-mid)' }}>Team:</span>
                                    <span className="text-sm font-semibold" style={{ color: 'var(--text-hi)' }}>{coach.teamName}</span>
                                </div>
                            )}
                        </div>

                        {coach.teamWebsiteUrl && (
                            <a
                                href={coach.teamWebsiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2"
                                style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--brand-600)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'var(--brand-500)')}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Visit Team Official Website
                            </a>
                        )}
                    </div>
                </div>

                {/* ── Achievements ── */}
                <div className="px-6 py-6 sm:px-8" style={{ borderTop: '1px solid var(--ink-3)' }}>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl" aria-hidden="true">🏆</span>
                        <h2 className="text-base font-bold" style={{ color: 'var(--text-hi)' }}>Recent Achievements</h2>
                    </div>
                    {coach.achievements && coach.achievements.length > 0 ? (
                        <ul className="space-y-2">
                            {coach.achievements.map((achievement, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--brand-500)' }} />
                                    <span className="text-sm" style={{ color: 'var(--text-mid)' }}>
                                        {achievement.title}{achievement.year && ` (${achievement.year})`}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm italic" style={{ color: 'var(--text-lo)' }}>No achievements listed yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
});
