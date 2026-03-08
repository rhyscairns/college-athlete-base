'use client';

import { useState, useEffect, useRef } from 'react';
import type { Academic, AcademicProfileSectionProps, ValidationErrors, PlayerProfile } from '../../types';
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

    if (isEditing) {
        return (
            <section
                id="academics"
                ref={sectionRef}
                className="max-w-6xl mx-auto px-4 py-8"
            >
                <AcademicProfileSectionEdit
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    isSaving={isSaving}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            </section>
        );
    }

    if (!hasSectionData(academic, 'academic')) {
        return (
            <section id="academics" ref={sectionRef} className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <EmptySection
                        title="No Academic Information Yet"
                        description="Add your GPA, test scores, class rank, and coursework to showcase your academic achievements to recruiters."
                        isOwner={isOwner}
                        showEditButton={true}
                        onEdit={onEdit}
                        icon="📚"
                    />
                </div>
            </section>
        );
    }

    return (
        <section id="academics" ref={sectionRef} className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-6 sm:px-8 relative">
                    {isOwner && (
                        <button
                            onClick={() => onEdit?.()}
                            disabled={isAnyOtherSectionEditing}
                            className="absolute top-4 right-4 px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </button>
                    )}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">📚</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Academic Profile</h2>
                            <p className="text-blue-100">Excellence in the classroom</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8">
                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            {/* GPA Card */}
                            {(academic.gpa > 0 || isOwner) && (
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-2 font-semibold">GPA</p>
                                    {academic.gpa > 0 ? (
                                        <>
                                            <p className="text-4xl md:text-5xl font-black text-blue-600 mb-2">{academic.gpa}</p>
                                            <p className="text-gray-700 font-medium">{academic.gpaScale}</p>
                                        </>
                                    ) : (
                                        <p className="text-gray-500 italic">Not provided</p>
                                    )}
                                </div>
                            )}

                            {/* Test Scores */}
                            {((academic.satScore && academic.satScore > 0) || (academic.actScore && academic.actScore > 0) || isOwner) && (
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-3 font-semibold">Test Scores</p>
                                    <div className="space-y-4">
                                        {academic.satScore && academic.satScore > 0 ? (
                                            <div>
                                                <p className="text-lg font-bold text-gray-900 mb-1">SAT: {academic.satScore}</p>
                                                {academic.satMath && academic.satReading && (
                                                    <p className="text-sm text-gray-600">Math: {academic.satMath} • Reading: {academic.satReading}</p>
                                                )}
                                            </div>
                                        ) : isOwner ? (
                                            <p className="text-gray-500 italic text-sm">SAT scores not provided</p>
                                        ) : null}
                                        {academic.actScore && academic.actScore > 0 ? (
                                            <div>
                                                <p className="text-lg font-bold text-gray-900">ACT: {academic.actScore}</p>
                                            </div>
                                        ) : isOwner && (!academic.satScore || academic.satScore === 0) ? (
                                            <p className="text-gray-500 italic text-sm">ACT scores not provided</p>
                                        ) : null}
                                    </div>
                                </div>
                            )}

                            {/* Class Rank */}
                            {(academic.classRank || isOwner) && (
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-2 font-semibold">Class Rank</p>
                                    {academic.classRank ? (
                                        <>
                                            <p className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{academic.classRank}</p>
                                            {academic.classRankDetail && (
                                                <p className="text-sm text-gray-700">{academic.classRankDetail}</p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-gray-500 italic">Not provided</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {/* NCAA Eligibility */}
                            {(academic.ncaaEligibilityCenter || isOwner) && (
                                <div className={`rounded-xl p-6 border ${academic.ncaaEligibilityCenter
                                    ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                                    : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
                                    }`}>
                                    {academic.ncaaEligibilityCenter ? (
                                        <>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                                <p className="text-sm font-bold text-green-700 uppercase tracking-wider">NCAA Eligible</p>
                                            </div>
                                            <p className="text-lg text-gray-900 mb-2 font-semibold">Eligibility Center ID</p>
                                            <p className="text-2xl font-mono text-gray-700">{academic.ncaaEligibilityCenter}</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-xs text-gray-600 uppercase tracking-wider mb-2 font-semibold">NCAA Eligibility</p>
                                            <p className="text-gray-500 italic">Not registered yet</p>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Coursework */}
                            {((academic.coursework && academic.coursework.length > 0) || isOwner) && (
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-3 font-semibold">Advanced Coursework</p>
                                    {academic.coursework && academic.coursework.length > 0 ? (
                                        <div className="space-y-3">
                                            {academic.coursework.map((course, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                    <span className="text-gray-900">{course}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">No advanced courses listed</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
