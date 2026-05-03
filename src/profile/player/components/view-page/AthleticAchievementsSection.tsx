'use client';

import { useState, useEffect, useRef } from 'react';
import type { AthleticAchievementsSectionProps, ValidationErrors } from '../../types';
import { AthleticAchievementsSectionEdit } from '../edit/components/sections/AthleticAchievementsSectionEdit';
import { hasSectionData } from '../../utils/profile-helpers';
import { EmptySection } from '../EmptySection';

interface Achievement {
    id: string;
    icon: string;
    title: string;
    description: string;
    color: string;
}

export function AthleticAchievementsSection({
    achievements,
    isOwner = false,
    isEditing = false,
    isAnyOtherSectionEditing = false,
    onEdit,
    onSave,
    onCancel,
}: AthleticAchievementsSectionProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const [formData, setFormData] = useState<Achievement[]>(achievements);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSaving, setIsSaving] = useState(false);

    const iconMap: Record<string, string> = {
        trophy: '🏆',
        medal: '🥇',
        star: '⭐',
        lightning: '⚡',
        target: '🎯',
        award: '🏅',
    };

    // Reset form data when achievements data changes or when exiting edit mode
    useEffect(() => {
        if (!isEditing) {
            setFormData(achievements);
            setErrors({});
        }
    }, [isEditing, achievements]);

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
        // Validate achievements
        const validationErrors: ValidationErrors = {};

        formData.forEach((achievement, index) => {
            if (!achievement.title.trim()) {
                validationErrors[`achievement-${index}-title`] = 'Title is required';
            }
            if (!achievement.description.trim()) {
                validationErrors[`achievement-${index}-description`] = 'Description is required';
            }
        });

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSaving(true);
        // Simulate save delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (onSave) {
            onSave({
                achievements: formData,
            });
        }

        setIsSaving(false);
        setErrors({});
    };

    const handleCancel = () => {
        // Reset form data to original achievements data
        setFormData(achievements);
        setErrors({});
        if (onCancel) {
            onCancel();
        }
    };

    // Check if achievements section has data
    const hasAchievements = hasSectionData(achievements, 'achievements');

    // If no achievements and not owner, hide the section
    if (!hasAchievements && !isOwner) {
        return null;
    }

    if (isEditing) {
        return (
            <section
                id="achievements"
                ref={sectionRef}
                className="max-w-6xl mx-auto px-4 py-8"
            >
                <AthleticAchievementsSectionEdit
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

    if (!hasAchievements && isOwner) {
        return (
            <section id="achievements" ref={sectionRef} className="max-w-6xl mx-auto px-4 py-8">
                <div className="rounded-2xl p-8" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}>
                    <EmptySection
                        title="No Achievements Yet"
                        description="Add your athletic achievements, honors, and awards to highlight your accomplishments to college recruiters."
                        isOwner={isOwner}
                        showEditButton={true}
                        onEdit={onEdit}
                        icon="🏆"
                    />
                </div>
            </section>
        );
    }

    return (
        <section id="achievements" ref={sectionRef} className="max-w-6xl mx-auto px-4 py-8">
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
                            <span className="text-2xl">🏆</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-hi)' }}>Achievements & Honors</h2>
                            <p style={{ color: 'var(--text-lo)' }}>Recognition and accomplishments</p>
                        </div>
                    </div>
                </div>

                {/* Achievements Grid */}
                <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {achievements.map((achievement) => (
                            <div
                                key={achievement.id}
                                className="group relative rounded-xl p-6 hover:scale-105 transition-all duration-300"
                                style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-3)' }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--brand-500)')}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--ink-3)')}
                            >
                                <div className="text-4xl md:text-5xl mb-4">
                                    {iconMap[achievement.icon] || '🏆'}
                                </div>
                                <h3 className="text-lg md:text-xl font-bold mb-2" style={{ color: 'var(--text-hi)' }}>
                                    {achievement.title}
                                </h3>
                                <p className="text-sm md:text-base" style={{ color: 'var(--text-mid)' }}>{achievement.description}</p>

                                <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-3xl" style={{ background: 'oklch(68% 0.22 150 / 0.08)' }}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
