'use client';

import { useState, useEffect, useRef } from 'react';
import type { Academic, AcademicProfileSectionProps, ValidationErrors, PlayerProfile } from '../../types';
import { EditButton } from './EditButton';
import { AcademicProfileSectionEdit } from '../edit/components/sections/AcademicProfileSectionEdit';
import { validateAcademicSection } from '../../utils/validation';
import { hasSectionData } from '../../utils/profile-helpers';
import { EmptySection } from '../EmptySection';

export function AcademicProfileSection({
    academic,
    isOwner = false,
    isEditing = false,
    isAnyOtherSectionEditing = false,
    onEdit,
    onSave,
    onCancel,
}: AcademicProfileSectionProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const [formData, setFormData] = useState<Academic>({
        gpa: academic.gpa,
        gpaScale: academic.gpaScale,
        satScore: academic.satScore,
        satMath: academic.satMath,
        satReading: academic.satReading,
        actScore: academic.actScore,
        classRank: academic.classRank,
        classRankDetail: academic.classRankDetail,
        ncaaEligibilityCenter: academic.ncaaEligibilityCenter,
        ncaaQualifier: academic.ncaaQualifier,
        coursework: academic.coursework,
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSaving, setIsSaving] = useState(false);

    // Reset form data when academic data changes or when exiting edit mode
    useEffect(() => {
        if (!isEditing) {
            setFormData({
                gpa: academic.gpa,
                gpaScale: academic.gpaScale,
                satScore: academic.satScore,
                satMath: academic.satMath,
                satReading: academic.satReading,
                actScore: academic.actScore,
                classRank: academic.classRank,
                classRankDetail: academic.classRankDetail,
                ncaaEligibilityCenter: academic.ncaaEligibilityCenter,
                ncaaQualifier: academic.ncaaQualifier,
                coursework: academic.coursework,
            });
            setErrors({});
        }
    }, [isEditing, academic]);

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

    const handleSave = async () => {
        const validationErrors = validateAcademicSection(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSaving(true);
        // Simulate save delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (onSave) {
            onSave({
                academic: formData as PlayerProfile['academic'],
            });
        }

        setIsSaving(false);
        setErrors({});
    };

    const handleCancel = () => {
        // Reset form data to original academic data
        setFormData({
            gpa: academic.gpa,
            gpaScale: academic.gpaScale,
            satScore: academic.satScore,
            satMath: academic.satMath,
            satReading: academic.satReading,
            actScore: academic.actScore,
            classRank: academic.classRank,
            classRankDetail: academic.classRankDetail,
            ncaaEligibilityCenter: academic.ncaaEligibilityCenter,
            ncaaQualifier: academic.ncaaQualifier,
            coursework: academic.coursework,
        });
        setErrors({});
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <section
            id="academics"
            ref={sectionRef}
            className={`relative min-h-[calc(100vh-80px)] flex items-center px-4 py-6 transition-all duration-300 ease-in-out ${isEditing ? 'bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6' : ''
                }`}
        >
            <div className="max-w-6xl mx-auto w-full">
                {/* Section Header with Edit Button */}
                <div className="text-center mb-8">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex-1"></div>
                        <div className="flex-1 text-center">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3">
                                Academic Profile
                            </h2>
                            <p className="text-base md:text-lg text-slate-400">
                                Excellence in the classroom
                            </p>
                        </div>
                        <div className="flex-1 flex justify-end">
                            {isOwner && !isEditing && (
                                <EditButton
                                    onClick={() => onEdit?.()}
                                    disabled={isAnyOtherSectionEditing}
                                    tooltip={
                                        isAnyOtherSectionEditing
                                            ? 'Another section is being edited'
                                            : undefined
                                    }
                                />
                            )}
                        </div>
                    </div>
                </div>

                {isEditing ? (
                    <AcademicProfileSectionEdit
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                        isSaving={isSaving}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                ) : !hasSectionData(academic, 'academic') ? (
                    // Empty state
                    <EmptySection
                        title="No Academic Information Yet"
                        description="Add your GPA, test scores, class rank, and coursework to showcase your academic achievements to recruiters."
                        isOwner={isOwner}
                        showEditButton={true}
                        onEdit={onEdit}
                        icon="📚"
                    />
                ) : (
                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            {/* GPA Card */}
                            {(academic.gpa > 0 || isOwner) && (
                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/10">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">GPA</p>
                                    {academic.gpa > 0 ? (
                                        <>
                                            <p className="text-4xl md:text-5xl font-black text-yellow-400 mb-2">{academic.gpa}</p>
                                            <p className="text-slate-300">{academic.gpaScale}</p>
                                        </>
                                    ) : (
                                        <p className="text-slate-400 italic">Not provided</p>
                                    )}
                                </div>
                            )}

                            {/* Test Scores */}
                            {((academic.satScore && academic.satScore > 0) || (academic.actScore && academic.actScore > 0) || isOwner) && (
                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/10">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Test Scores</p>
                                    <div className="space-y-4">
                                        {academic.satScore && academic.satScore > 0 ? (
                                            <div>
                                                <p className="text-lg font-bold text-white mb-1">SAT: {academic.satScore}</p>
                                                {academic.satMath && academic.satReading && (
                                                    <p className="text-sm text-slate-400">Math: {academic.satMath} • Reading: {academic.satReading}</p>
                                                )}
                                            </div>
                                        ) : isOwner ? (
                                            <p className="text-slate-400 italic text-sm">SAT scores not provided</p>
                                        ) : null}
                                        {academic.actScore && academic.actScore > 0 ? (
                                            <div>
                                                <p className="text-lg font-bold text-white">ACT: {academic.actScore}</p>
                                            </div>
                                        ) : isOwner && (!academic.satScore || academic.satScore === 0) ? (
                                            <p className="text-slate-400 italic text-sm">ACT scores not provided</p>
                                        ) : null}
                                    </div>
                                </div>
                            )}

                            {/* Class Rank */}
                            {(academic.classRank || isOwner) && (
                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/10">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Class Rank</p>
                                    {academic.classRank ? (
                                        <>
                                            <p className="text-xl md:text-2xl font-bold text-white mb-1">{academic.classRank}</p>
                                            {academic.classRankDetail && (
                                                <p className="text-sm text-slate-300">{academic.classRankDetail}</p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-slate-400 italic">Not provided</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {/* NCAA Eligibility */}
                            {(academic.ncaaEligibilityCenter || isOwner) && (
                                <div className={`backdrop-blur-sm rounded-2xl p-5 md:p-6 border ${academic.ncaaEligibilityCenter
                                    ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-400/30'
                                    : 'bg-white/5 border-white/10'
                                    }`}>
                                    {academic.ncaaEligibilityCenter ? (
                                        <>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                                                <p className="text-sm font-bold text-emerald-300 uppercase tracking-wider">NCAA Eligible</p>
                                            </div>
                                            <p className="text-lg text-white mb-2">Eligibility Center ID</p>
                                            <p className="text-2xl font-mono text-slate-300">{academic.ncaaEligibilityCenter}</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">NCAA Eligibility</p>
                                            <p className="text-slate-400 italic">Not registered yet</p>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Coursework */}
                            {((academic.coursework && academic.coursework.length > 0) || isOwner) && (
                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-white/10">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Advanced Coursework</p>
                                    {academic.coursework && academic.coursework.length > 0 ? (
                                        <div className="space-y-3">
                                            {academic.coursework.map((course, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                                    <span className="text-white">{course}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 italic">No advanced courses listed</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
