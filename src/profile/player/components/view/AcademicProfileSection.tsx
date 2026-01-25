'use client';

import { useState, useEffect, useRef } from 'react';
import type { AcademicProfileSectionProps, AcademicData, ValidationErrors, MockPlayerData } from '../../types';
import { EditButton } from './EditButton';
import { AcademicProfileSectionEdit } from './AcademicProfileSectionEdit';
import { validateAcademicSection } from '../../utils/validation';

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
    const [formData, setFormData] = useState<AcademicData>({
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
                academic: formData as MockPlayerData['academic'],
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
            className={`relative min-h-[calc(100vh-80px)] flex items-center px-6 py-12 transition-all duration-300 ease-in-out ${isEditing ? 'bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6' : ''
                }`}
        >
            <div className="max-w-7xl mx-auto w-full">
                {/* Section Header with Edit Button */}
                <div className="text-center mb-12">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1"></div>
                        <div className="flex-1 text-center">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4">
                                Academic Profile
                            </h2>
                            <p className="text-lg md:text-xl text-slate-400">
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
                ) : (
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
                )}
            </div>
        </section>
    );
}
