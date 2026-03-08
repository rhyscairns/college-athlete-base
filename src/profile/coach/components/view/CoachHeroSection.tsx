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
            {/* Main Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Blue Gradient Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-8 sm:px-8 sm:py-10 relative">
                    {/* Edit Button */}
                    {isOwner && !isEditing && (
                        <button
                            onClick={() => onEdit?.()}
                            className="absolute top-4 right-4 px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Profile
                        </button>
                    )}

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        {/* Profile Photo */}
                        <div className="relative">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                                {coach.profileImage ? (
                                    <Image
                                        src={coach.profileImage}
                                        alt={fullName}
                                        width={128}
                                        height={128}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                        <span className="text-3xl sm:text-4xl font-bold text-white">
                                            {initials}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {/* Online Status Indicator */}
                            <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
                        </div>

                        {/* Name and Title */}
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                                {fullName}
                            </h1>
                            <p className="text-lg text-blue-100 mb-2">
                                {coach.position || 'Head Coach'}
                            </p>
                            <p className="text-base text-blue-50">
                                {coach.university || 'University Name'}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mt-4">
                                {coach.sport && (
                                    <span className="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">
                                        {coach.sport}
                                    </span>
                                )}
                                <span className="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">
                                    NCAA Division I
                                </span>
                                <span className="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">
                                    15 Years Experience
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid md:grid-cols-2 gap-6 p-6 sm:p-8">
                    {/* Contact Information */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Contact Information</h2>
                        </div>

                        <div className="space-y-4">
                            {/* Email */}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="text-sm font-medium text-gray-900 break-all">{coach.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Phone */}
                            {coach.phone && (
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Phone</p>
                                            <p className="text-sm font-medium text-gray-900">{coach.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Office Location */}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Office Location</p>
                                        <p className="text-sm font-medium text-gray-900">Pauley Pavilion, Room 201</p>
                                    </div>
                                </div>
                            </div>

                            {/* Office Hours */}
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Office Hours</p>
                                        <p className="text-sm font-medium text-gray-900">Mon-Fri: 9:00 AM - 5:00 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* University Information */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">University Information</h2>
                        </div>

                        {/* University Logo and Name */}
                        <div className="bg-blue-50 rounded-xl p-6 mb-4 text-center">
                            <div className="w-20 h-20 mx-auto mb-3 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">UCLA</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {coach.university || 'University of California, Los Angeles'}
                            </h3>
                            <p className="text-sm text-gray-600">Athletics Department</p>
                        </div>

                        {/* University Details */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Conference:</span>
                                <span className="text-sm font-semibold text-gray-900">Pac-12</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Division:</span>
                                <span className="text-sm font-semibold text-gray-900">NCAA Division I</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Team:</span>
                                <span className="text-sm font-semibold text-gray-900">UCLA Bruins</span>
                            </div>
                        </div>

                        {/* Visit Website Button */}
                        {coach.teamWebsiteUrl && (
                            <a
                                href={coach.teamWebsiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Visit UCLA Official Website
                            </a>
                        )}
                    </div>
                </div>

                {/* Recent Achievements */}
                <div className="border-t border-gray-200 px-6 py-6 sm:px-8">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">🏆</span>
                        <h2 className="text-lg font-bold text-gray-900">Recent Achievements</h2>
                    </div>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></span>
                            <span className="text-sm text-gray-700">Pac-12 Conference Champion 2023</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></span>
                            <span className="text-sm text-gray-700">NCAA Tournament Elite Eight 2023</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></span>
                            <span className="text-sm text-gray-700">Coach of the Year Award 2022</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
});
