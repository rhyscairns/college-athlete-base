'use client';

import { useState, useEffect, useRef } from 'react';
import type { Hero, HeroSectionProps, ValidationErrors } from '../../types';
import { EditButton } from './EditButton';
import { HeroSectionEdit } from '../edit/components/sections/HeroSectionEdit';

export function HeroSection({
    player,
    isOwner = false,
    isEditing = false,
    isAnyOtherSectionEditing = false,
    onEdit,
    onSave,
    onCancel,
}: HeroSectionProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const [formData, setFormData] = useState<Hero>({
        firstName: player.firstName,
        lastName: player.lastName,
        initials: player.initials,
        position: player.position,
        school: player.school,
        location: player.location,
        classYear: player.classYear,
        height: player.height,
        weight: player.weight,
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSaving, setIsSaving] = useState(false);

    // Reset form data when player data changes or when exiting edit mode
    useEffect(() => {
        if (!isEditing) {
            setFormData({
                firstName: player.firstName,
                lastName: player.lastName,
                initials: player.initials,
                position: player.position,
                school: player.school,
                location: player.location,
                classYear: player.classYear,
                height: player.height,
                weight: player.weight,
            });
            setErrors({});
        }
    }, [isEditing, player]);

    // Scroll into view when entering edit mode and set focus
    useEffect(() => {
        if (isEditing && sectionRef.current) {
            sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Focus the first input field after a short delay to allow for scroll
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

        if (!data.firstName?.trim()) {
            validationErrors.firstName = 'First name is required';
        }
        if (!data.lastName?.trim()) {
            validationErrors.lastName = 'Last name is required';
        }
        if (!data.position?.trim()) {
            validationErrors.position = 'Position is required';
        }
        if (!data.school?.trim()) {
            validationErrors.school = 'School is required';
        }

        return validationErrors;
    };

    const handleSave = async () => {
        const validationErrors = validateHeroSection(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSaving(true);
        // Simulate save delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (onSave) {
            onSave({
                firstName: formData.firstName,
                lastName: formData.lastName,
                position: formData.position,
                school: formData.school,
                location: formData.location,
                classYear: formData.classYear,
                height: formData.height,
                weight: formData.weight,
            });
        }

        setIsSaving(false);
        setErrors({});
    };

    const handleCancel = () => {
        // Reset form data to original player data
        setFormData({
            firstName: player.firstName,
            lastName: player.lastName,
            initials: player.initials,
            position: player.position,
            school: player.school,
            location: player.location,
            classYear: player.classYear,
            height: player.height,
            weight: player.weight,
        });
        setErrors({});
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <section
            id="hero"
            ref={sectionRef}
            className={`relative min-h-[calc(100vh-80px)] flex items-center py-6 px-4 transition-all duration-300 ease-in-out ${isEditing ? 'bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6' : ''
                }`}
        >
            <div className="max-w-6xl mx-auto w-full">
                {/* Edit Button Header */}
                {isOwner && !isEditing && (
                    <div className="flex justify-end mb-3">
                        <EditButton
                            onClick={() => onEdit?.()}
                            disabled={isAnyOtherSectionEditing}
                            tooltip={
                                isAnyOtherSectionEditing
                                    ? 'Another section is being edited'
                                    : undefined
                            }
                        />
                    </div>
                )}

                {isEditing ? (
                    <HeroSectionEdit
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                        isSaving={isSaving}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                ) : (
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        {/* Left Side - Player Info */}
                        <div className="space-y-4">
                            {/* Status Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-400/50 rounded-full">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                <span className="text-xs font-semibold text-emerald-300 tracking-wide uppercase">
                                    Open to Recruitment
                                </span>
                            </div>

                            {/* Player Name */}
                            <div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-2">
                                    {player.firstName || 'First Name'}
                                </h1>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                                    {player.lastName || 'Last Name'}
                                </h1>
                            </div>

                            {/* Position & School */}
                            <div className="space-y-1">
                                <p className="text-2xl font-bold text-blue-400">
                                    {player.position || 'Position'}
                                </p>
                                <p className="text-lg text-slate-300">
                                    {player.school || 'School Name'}
                                </p>
                                {(player.location || player.classYear) && (
                                    <p className="text-base text-slate-400">
                                        {player.location || 'Location'}
                                        {player.location && player.classYear && ' • '}
                                        {player.classYear && `Class of ${player.classYear}`}
                                    </p>
                                )}
                            </div>

                            {/* Quick Stats */}
                            {(player.height || player.weight || player.academic?.gpa) && (
                                <div className="grid grid-cols-3 gap-3 pt-4">
                                    {player.height && (
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                            <p className="text-xs text-slate-400 uppercase mb-1">Height</p>
                                            <p className="text-xl font-bold text-white">{player.height}</p>
                                        </div>
                                    )}
                                    {player.weight && (
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                            <p className="text-xs text-slate-400 uppercase mb-1">Weight</p>
                                            <p className="text-xl font-bold text-white">{player.weight}</p>
                                        </div>
                                    )}
                                    {player.academic?.gpa && player.academic.gpa > 0 && (
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                            <p className="text-xs text-slate-400 uppercase mb-1">GPA</p>
                                            <p className="text-xl font-bold text-white">
                                                {player.academic.gpa}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Performance Metrics */}
                            {player.performanceMetrics && player.performanceMetrics.length > 0 && (
                                <div className="space-y-2 pt-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase">
                                        Performance Highlights
                                    </p>
                                    {player.performanceMetrics.map((metric, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                                            <span className="text-sm text-slate-300">{metric.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Side - Player Image */}
                        <div className="relative hidden lg:block">
                            <div className="relative aspect-[3/4] max-w-md mx-auto">
                                <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-transparent rounded-2xl blur-2xl"></div>

                                <div className="relative h-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-white/10 flex items-center justify-center">
                                    <span className="text-9xl font-black text-white/5">
                                        {player.initials || '??'}
                                    </span>

                                    <div className="absolute top-6 right-6 w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-xl">
                                        <span className="text-2xl font-black text-slate-900">
                                            {player.initials || '??'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
