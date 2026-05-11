'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import type { Hero, HeroSectionProps, ValidationErrors } from '../../types';
import { HeroSectionEdit } from '../edit/components/sections/HeroSectionEdit';
import { hasSportPositions, hasSportEvents } from '@/constants/sports';
import { JSX } from 'react/jsx-runtime';

export function HeroSection({
    player,
    isOwner = false,
    isEditing = false,
    isAnyOtherSectionEditing = false,
    onEdit,
    onSave,
    onCancel,
}: HeroSectionProps): JSX.Element {
    const sectionRef = useRef<HTMLElement>(null);
    const [formData, setFormData] = useState<Hero>({
        firstName: player.firstName,
        lastName: player.lastName,
        initials: player.initials,
        position: player.position,
        sport: player.sport,
        school: player.school,
        location: player.location,
        classYear: player.classYear,
        height: player.height,
        weight: player.weight,
        age: player.age,
        dateOfBirth: player.dateOfBirth,
        profileImage: player.profileImage,
        heightInches: player.heightInches,
        weightLbs: player.weightLbs,
        desiredDivision: player.desiredDivision,
        affordableAmount: player.affordableAmount,
        performanceMetrics: player.performanceMetrics,
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSaving, setIsSaving] = useState(false);

    const fullName = `${player.firstName || 'First'} ${player.lastName || 'Last'}`;
    const initials = player.initials || `${player.firstName?.charAt(0) || 'F'}${player.lastName?.charAt(0) || 'L'}`;

    // Determine correct label for position/event based on sport
    const positionEventLabel = useMemo(() => {
        if (!player.sport) return 'Position';
        return hasSportEvents(player.sport) && !hasSportPositions(player.sport) ? 'Event' : 'Position';
    }, [player.sport]);

    // Reset form data when player data changes or when exiting edit mode
    useEffect(() => {
        if (!isEditing) {
            setFormData({
                firstName: player.firstName,
                lastName: player.lastName,
                initials: player.initials,
                position: player.position,
                sport: player.sport,
                school: player.school,
                location: player.location,
                classYear: player.classYear,
                height: player.height,
                weight: player.weight,
                age: player.age,
                dateOfBirth: player.dateOfBirth,
                profileImage: player.profileImage,
                heightInches: player.heightInches,
                weightLbs: player.weightLbs,
                desiredDivision: player.desiredDivision,
                affordableAmount: player.affordableAmount,
                performanceMetrics: player.performanceMetrics,
            });
            setErrors({});
        }
    }, [isEditing, player]);

    // Scroll into view when entering edit mode
    useEffect(() => {
        if (isEditing && sectionRef.current) {
            sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
                const firstInput = sectionRef.current?.querySelector('input, textarea, select') as HTMLElement;
                if (firstInput) {
                    firstInput.focus();
                }
            }, 300);
        }
    }, [isEditing]);

    // Handle Escape key to cancel editing
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isEditing) {
                e.preventDefault();
                handleCancel();
            }
        };

        if (isEditing) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing]);

    const validateHeroSection = (data: Hero): ValidationErrors => {
        const validationErrors: ValidationErrors = {};
        if (!data.firstName?.trim()) validationErrors.firstName = 'First name is required';
        if (!data.lastName?.trim()) validationErrors.lastName = 'Last name is required';
        // School and position are optional since some profiles might not have them set yet
        return validationErrors;
    };

    const handleSave = async () => {
        const validationErrors = validateHeroSection(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSaving(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (onSave) {
            onSave({
                firstName: formData.firstName,
                lastName: formData.lastName,
                position: formData.position,
                sport: formData.sport,
                school: formData.school,
                location: formData.location,
                classYear: formData.classYear,
                height: formData.height,
                weight: formData.weight,
                age: formData.age,
                dateOfBirth: formData.dateOfBirth,
                profileImage: formData.profileImage,
                heightInches: formData.heightInches,
                weightLbs: formData.weightLbs,
                desiredDivision: formData.desiredDivision,
                affordableAmount: formData.affordableAmount,
                performanceMetrics: formData.performanceMetrics,
            });
        }

        setIsSaving(false);
        setErrors({});
    };

    const handleCancel = (): void => {
        setFormData({
            firstName: player.firstName,
            lastName: player.lastName,
            initials: player.initials,
            position: player.position,
            sport: player.sport,
            school: player.school,
            location: player.location,
            classYear: player.classYear,
            height: player.height,
            weight: player.weight,
            age: player.age,
            dateOfBirth: player.dateOfBirth,
            profileImage: player.profileImage,
            heightInches: player.heightInches,
            weightLbs: player.weightLbs,
            desiredDivision: player.desiredDivision,
            affordableAmount: player.affordableAmount,
            performanceMetrics: player.performanceMetrics,
        });
        setErrors({});
        if (onCancel) {
            onCancel();
        }
    };

    if (isEditing) {
        return (
            <section
                id="hero"
                ref={sectionRef}
                className="rounded-2xl p-6 transition-all duration-300"
                style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-3)' }}
            >
                <div className="max-w-6xl mx-auto">
                    <HeroSectionEdit
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                        isSaving={isSaving}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                </div>
            </section>
        );
    }

    return (
        <section id="hero" ref={sectionRef} className="max-w-6xl mx-auto px-4 py-8">
            {/* Main Profile Card */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}>
                {/* Dark header with brand-green glow */}
                <div
                    className="px-6 py-8 sm:px-8 sm:py-10 relative"
                    style={{
                        background: `radial-gradient(ellipse 80% 120% at 0% 50%, oklch(68% 0.22 150 / 0.15) 0%, transparent 60%), var(--ink-2)`,
                        borderBottom: '1px solid var(--ink-3)',
                    }}
                >
                    {/* Edit Button */}
                    {isOwner && (
                        <button
                            onClick={() => onEdit?.()}
                            disabled={isAnyOtherSectionEditing}
                            className="absolute top-4 right-4 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white transition-colors"
                            style={{ background: 'var(--ink-3)', color: 'var(--text-hi)' }}
                            onMouseEnter={e => !isAnyOtherSectionEditing && (e.currentTarget.style.background = 'var(--ink-0)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink-3)')}
                            aria-label={isAnyOtherSectionEditing ? 'Edit profile - disabled while another section is being edited' : 'Edit profile information'}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Profile
                        </button>
                    )}

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        {/* Profile Photo */}
                        <div className="relative">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden" style={{ border: '3px solid var(--brand-500)' }}>
                                {player.profileImage ? (
                                    <img
                                        src={player.profileImage}
                                        alt={`${fullName} profile photo`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--ink-3)' }}>
                                        <span className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--brand-500)' }}>
                                            {initials}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full" style={{ background: 'var(--status-success)', border: '3px solid var(--ink-2)' }} />
                        </div>

                        {/* Name and Info */}
                        <div className="flex-1">
                            <h1
                                className="font-black tracking-tight mb-1"
                                style={{ fontSize: 'clamp(1.5rem, 3vw + 0.5rem, 2rem)', color: 'var(--text-hi)' }}
                            >
                                {fullName}
                            </h1>
                            {player.hasAcceptedOffer && (
                                <div
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-2"
                                    style={{
                                        background: 'oklch(68% 0.22 150 / 0.15)',
                                        border: '1px solid oklch(68% 0.22 150 / 0.3)',
                                    }}
                                    data-testid="scholarship-accepted-badge"
                                    aria-label="Scholarship accepted"
                                >
                                    <svg
                                        className="w-3.5 h-3.5 flex-shrink-0"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                        style={{ color: 'var(--brand-500)' }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    <span
                                        className="text-xs font-semibold"
                                        style={{ color: 'var(--brand-500)' }}
                                    >
                                        Scholarship Accepted
                                    </span>
                                </div>
                            )}
                            <p className="text-lg mb-1" style={{ color: 'var(--brand-500)', fontWeight: 500 }}>
                                {player.position || 'Position'}
                            </p>
                            <p className="text-base" style={{ color: 'var(--text-mid)' }}>
                                {player.school || 'School Name'}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mt-4">
                                {player.classYear && (
                                    <span className="px-3 py-1 text-sm font-semibold rounded-full" style={{ background: 'var(--ink-3)', color: 'var(--text-mid)' }}>
                                        Class of {player.classYear}
                                    </span>
                                )}
                                {player.location && (
                                    <span className="px-3 py-1 text-sm font-semibold rounded-full" style={{ background: 'var(--ink-3)', color: 'var(--text-mid)' }}>
                                        {player.location}
                                    </span>
                                )}
                                <span className="px-3 py-1 text-sm font-semibold rounded-full" style={{ background: 'oklch(68% 0.22 150 / 0.15)', border: '1px solid oklch(68% 0.22 150 / 0.3)', color: 'var(--brand-500)' }}>
                                    Open to Recruitment
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="grid md:grid-cols-2 gap-6 p-6 sm:p-8">
                    {/* Athletic Profile */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--ink-3)' }}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--brand-500)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h2 className="text-base font-bold" style={{ color: 'var(--text-hi)' }}>Athletic Profile</h2>
                        </div>

                        <div className="space-y-4">
                            {player.sport && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--ink-3)' }}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--brand-500)' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs" style={{ color: 'var(--text-lo)' }}>Sport</p>
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-hi)' }}>{player.sport}</p>
                                    </div>
                                </div>
                            )}
                            {player.position && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--ink-3)' }}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--brand-500)' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs" style={{ color: 'var(--text-lo)' }}>{positionEventLabel}</p>
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-hi)' }}>{player.position}</p>
                                    </div>
                                </div>
                            )}
                            {player.height && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--ink-3)' }}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--brand-500)' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs" style={{ color: 'var(--text-lo)' }}>Height</p>
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-hi)' }}>{player.height}</p>
                                    </div>
                                </div>
                            )}
                            {player.weight && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--ink-3)' }}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--brand-500)' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs" style={{ color: 'var(--text-lo)' }}>Weight</p>
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-hi)' }}>{player.weight}</p>
                                    </div>
                                </div>
                            )}
                            {player.age && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--ink-3)' }}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--brand-500)' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs" style={{ color: 'var(--text-lo)' }}>Age</p>
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-hi)' }}>{player.age} years old</p>
                                    </div>
                                </div>
                            )}
                            {!!player.academic?.gpa && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--ink-3)' }}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--brand-500)' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs" style={{ color: 'var(--text-lo)' }}>GPA</p>
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-hi)' }}>{player.academic.gpa}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* School Information */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--ink-3)' }}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'var(--brand-500)' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                </svg>
                            </div>
                            <h2 className="text-base font-bold" style={{ color: 'var(--text-hi)' }}>School Information</h2>
                        </div>

                        <div className="rounded-xl p-6 mb-4 text-center" style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-3)' }}>
                            <div className="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'var(--ink-3)' }}>
                                <span className="text-2xl font-bold" style={{ color: 'var(--brand-500)' }}>{initials}</span>
                            </div>
                            <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-hi)' }}>
                                {player.school || 'School Name'}
                            </h3>
                            {player.location && (
                                <p className="text-sm" style={{ color: 'var(--text-mid)' }}>{player.location}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            {player.classYear && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm" style={{ color: 'var(--text-mid)' }}>Graduation Year:</span>
                                    <span className="text-sm font-semibold" style={{ color: 'var(--text-hi)' }}>{player.classYear}</span>
                                </div>
                            )}
                            {!!player.academic?.gpa && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm" style={{ color: 'var(--text-mid)' }}>Academic Standing:</span>
                                    <span className="text-sm font-semibold" style={{ color: 'var(--text-hi)' }}>
                                        {player.academic.gpa >= 3.5 ? 'Honor Roll' : 'Good Standing'}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="text-sm" style={{ color: 'var(--text-mid)' }}>Recruitment Status:</span>
                                <span className="text-sm font-semibold" style={{ color: 'var(--status-success)' }}>Open</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Highlights */}
                {player.performanceMetrics && player.performanceMetrics.length > 0 && (
                    <div className="px-6 py-6 sm:px-8" style={{ borderTop: '1px solid var(--ink-3)' }}>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl" aria-hidden="true">⚡</span>
                            <h2 className="text-base font-bold" style={{ color: 'var(--text-hi)' }}>Performance Highlights</h2>
                        </div>
                        <ul className="space-y-2">
                            {player.performanceMetrics.map((metric, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--brand-500)' }} />
                                    <span className="text-sm" style={{ color: 'var(--text-mid)' }}>{metric.label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </section>
    );
}
