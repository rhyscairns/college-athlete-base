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
                <div className="rounded-2xl p-8" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}>
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
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}>
                {/* Header */}
                <div
                    className="px-6 py-6 sm:px-8 relative"
                    style={{
                        background: `radial-gradient(ellipse 80% 120% at 0% 50%, oklch(68% 0.22 150 / 0.15) 0%, transparent 60%), var(--ink-2)`,
                        borderBottom: '1px solid var(--ink-3)',
                    }}
                >
                    {isOwner && (
                        <button
                            onClick={() => onEdit?.()}
                            disabled={isAnyOtherSectionEditing}
                            className="absolute top-4 right-4 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            style={{ background: 'var(--ink-3)', color: 'var(--text-hi)' }}
                            onMouseEnter={e => !isAnyOtherSectionEditing && (e.currentTarget.style.background = 'var(--ink-0)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink-3)')}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </button>
                    )}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--ink-3)' }}>
                            <span className="text-2xl">📚</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-hi)' }}>Academic Profile</h2>
                            <p style={{ color: 'var(--text-lo)' }}>Excellence in the classroom</p>
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
                                <div className="rounded-xl p-6" style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-3)' }}>
                                    <p className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: 'var(--text-lo)' }}>GPA</p>
                                    {academic.gpa > 0 ? (
                                        <>
                                            <p className="text-4xl md:text-5xl font-black mb-2" style={{ color: 'var(--brand-500)' }}>{academic.gpa}</p>
                                            <p className="font-medium" style={{ color: 'var(--text-mid)' }}>{academic.gpaScale}</p>
                                        </>
                                    ) : (
                                        <p className="italic" style={{ color: 'var(--text-lo)' }}>Not provided</p>
                                    )}
                                </div>
                            )}

                            {/* Test Scores */}
                            {((academic.satScore && academic.satScore > 0) || (academic.actScore && academic.actScore > 0) || isOwner) && (
                                <div className="rounded-xl p-6" style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-3)' }}>
                                    <p className="text-xs uppercase tracking-wider mb-3 font-semibold" style={{ color: 'var(--text-lo)' }}>Test Scores</p>
                                    <div className="space-y-4">
                                        {academic.satScore && academic.satScore > 0 ? (
                                            <div>
                                                <p className="text-lg font-bold mb-1" style={{ color: 'var(--text-hi)' }}>SAT: {academic.satScore}</p>
                                                {academic.satMath && academic.satReading && (
                                                    <p className="text-sm" style={{ color: 'var(--text-mid)' }}>Math: {academic.satMath} • Reading: {academic.satReading}</p>
                                                )}
                                            </div>
                                        ) : isOwner ? (
                                            <p className="italic text-sm" style={{ color: 'var(--text-lo)' }}>SAT scores not provided</p>
                                        ) : null}
                                        {academic.actScore && academic.actScore > 0 ? (
                                            <div>
                                                <p className="text-lg font-bold" style={{ color: 'var(--text-hi)' }}>ACT: {academic.actScore}</p>
                                            </div>
                                        ) : isOwner && (!academic.satScore || academic.satScore === 0) ? (
                                            <p className="italic text-sm" style={{ color: 'var(--text-lo)' }}>ACT scores not provided</p>
                                        ) : null}
                                    </div>
                                </div>
                            )}

                            {/* Class Rank */}
                            {(academic.classRank || isOwner) && (
                                <div className="rounded-xl p-6" style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-3)' }}>
                                    <p className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: 'var(--text-lo)' }}>Class Rank</p>
                                    {academic.classRank ? (
                                        <>
                                            <p className="text-xl md:text-2xl font-bold mb-1" style={{ color: 'var(--text-hi)' }}>{academic.classRank}</p>
                                            {academic.classRankDetail && (
                                                <p className="text-sm" style={{ color: 'var(--text-mid)' }}>{academic.classRankDetail}</p>
                                            )}
                                        </>
                                    ) : (
                                        <p className="italic" style={{ color: 'var(--text-lo)' }}>Not provided</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {/* NCAA Eligibility */}
                            {(academic.ncaaEligibilityCenter || isOwner) && (
                                <div
                                    className="rounded-xl p-6"
                                    style={{
                                        background: academic.ncaaEligibilityCenter
                                            ? 'oklch(68% 0.22 150 / 0.08)'
                                            : 'var(--ink-2)',
                                        border: academic.ncaaEligibilityCenter
                                            ? '1px solid oklch(68% 0.22 150 / 0.3)'
                                            : '1px solid var(--ink-3)',
                                    }}
                                >
                                    {academic.ncaaEligibilityCenter ? (
                                        <>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: 'var(--status-success)' }}></div>
                                                <p className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--status-success)' }}>NCAA Eligible</p>
                                            </div>
                                            <p className="text-lg mb-2 font-semibold" style={{ color: 'var(--text-hi)' }}>Eligibility Center ID</p>
                                            <p className="text-2xl font-mono" style={{ color: 'var(--text-mid)' }}>{academic.ncaaEligibilityCenter}</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-xs uppercase tracking-wider mb-2 font-semibold" style={{ color: 'var(--text-lo)' }}>NCAA Eligibility</p>
                                            <p className="italic" style={{ color: 'var(--text-lo)' }}>Not registered yet</p>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Coursework */}
                            {((academic.coursework && academic.coursework.length > 0) || isOwner) && (
                                <div className="rounded-xl p-6" style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-3)' }}>
                                    <p className="text-xs uppercase tracking-wider mb-3 font-semibold" style={{ color: 'var(--text-lo)' }}>Advanced Coursework</p>
                                    {academic.coursework && academic.coursework.length > 0 ? (
                                        <div className="space-y-3">
                                            {academic.coursework.map((course, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--brand-500)' }}></div>
                                                    <span style={{ color: 'var(--text-hi)' }}>{course}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="italic" style={{ color: 'var(--text-lo)' }}>No advanced courses listed</p>
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
