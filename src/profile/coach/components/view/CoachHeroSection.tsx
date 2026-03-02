'use client';

import React from 'react';
import type { CoachProfile } from '../../types';
import { EditButton } from '../../../player/components/view-page/EditButton';

export interface CoachHeroSectionProps {
    coach: CoachProfile;
    isOwner?: boolean;
    isEditing?: boolean;
    onEdit?: () => void;
}

export const CoachHeroSection = React.memo(function CoachHeroSection({
    coach,
    isOwner = false,
    isEditing = false,
    onEdit,
}: CoachHeroSectionProps) {
    return (
        <section
            id="hero"
            className="relative min-h-[calc(100vh-80px)] flex items-center py-6 px-4"
        >
            <div className="max-w-6xl mx-auto w-full">
                {/* Edit Button Header */}
                {isOwner && !isEditing && (
                    <div className="flex justify-end mb-3 sm:mb-4">
                        <EditButton
                            onClick={() => onEdit?.()}
                            disabled={false}
                        />
                    </div>
                )}

                <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">
                    {/* Left Side - Coach Info */}
                    <div className="space-y-3 sm:space-y-4 px-4 sm:px-6 md:ml-8 lg:ml-12 xl:ml-16">
                        {/* Coach Name */}
                        <div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-2">
                                {coach.firstName || 'First Name'}
                            </h1>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                                {coach.lastName || 'Last Name'}
                            </h1>
                        </div>

                        {/* Position & University */}
                        <div className="space-y-1">
                            <p className="text-xl sm:text-2xl font-bold text-blue-400">
                                {coach.position || (isOwner ? (
                                    <span className="text-slate-500 italic">No position specified</span>
                                ) : (
                                    <span className="text-slate-500">Position not specified</span>
                                ))}
                            </p>
                            <p className="text-base sm:text-lg text-slate-300">
                                {coach.university || (isOwner ? (
                                    <span className="text-slate-500 italic">No university specified</span>
                                ) : (
                                    <span className="text-slate-500">University not specified</span>
                                ))}
                            </p>
                            <p className="text-sm sm:text-base text-slate-400">
                                {coach.sport || (isOwner ? (
                                    <span className="text-slate-500 italic">No sport specified</span>
                                ) : (
                                    <span className="text-slate-500">Sport not specified</span>
                                ))}
                            </p>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-2 pt-3 sm:pt-4">
                            <p className="text-xs font-bold text-slate-400 uppercase">
                                Contact Information
                            </p>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                                    <span className="text-sm text-slate-300 break-all">
                                        {coach.email}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                                    <span className="text-sm text-slate-300">
                                        {coach.phone || (isOwner ? (
                                            <span className="text-slate-500 italic">No phone number</span>
                                        ) : (
                                            <span className="text-slate-500">Phone not provided</span>
                                        ))}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Team Website Link */}
                        <div className="pt-2">
                            {coach.teamWebsiteUrl ? (
                                <a
                                    href={coach.teamWebsiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] bg-blue-500/20 border border-blue-400/50 rounded-lg text-blue-300 text-sm font-semibold hover:bg-blue-500/30 transition-all touch-manipulation"
                                >
                                    <svg
                                        className="w-4 h-4 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                        />
                                    </svg>
                                    <span className="truncate">Visit Team Website</span>
                                </a>
                            ) : isOwner ? (
                                <p className="text-sm text-slate-500 italic">
                                    No team website link added
                                </p>
                            ) : null}
                        </div>
                    </div>

                    {/* Right Side - Profile Image or Initials */}
                    <div className="relative hidden lg:block">
                        <div className="relative aspect-[3/4] max-w-md mx-auto">
                            <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-transparent rounded-2xl blur-2xl"></div>

                            {coach.profileImage ? (
                                <div className="relative h-full rounded-2xl border border-white/10 overflow-hidden">
                                    <img
                                        src={coach.profileImage}
                                        alt={`${coach.firstName} ${coach.lastName}`}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        decoding="async"
                                        fetchPriority="low"
                                    />
                                </div>
                            ) : (
                                <div className="relative h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-white/10 flex items-center justify-center">
                                    <span className="text-9xl font-black text-white/5">
                                        {coach.initials || '??'}
                                    </span>

                                    <div className="absolute top-6 right-6 w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-xl">
                                        <span className="text-2xl font-black text-slate-900">
                                            {coach.initials || '??'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
});
