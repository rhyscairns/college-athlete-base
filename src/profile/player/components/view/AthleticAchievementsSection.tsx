'use client';

import { useState, useEffect, useRef } from 'react';
import type { AthleticAchievementsSectionProps, ValidationErrors } from '../../types';
import { EditButton } from './EditButton';
import { AthleticAchievementsSectionEdit } from './AthleticAchievementsSectionEdit';

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

    return (
        <section
            id="achievements"
            ref={sectionRef}
            className={`relative min-h-[calc(100vh-80px)] flex items-center px-6 py-12 transition-all duration-300 ease-in-out ${isEditing ? 'bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6' : ''
                }`}
        >
            <div className="max-w-7xl mx-auto w-full">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white">
                            Achievements & Honors
                        </h2>
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
                    <p className="text-lg md:text-xl text-white">Recognition and accomplishments</p>
                </div>

                {isEditing ? (
                    <AthleticAchievementsSectionEdit
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                        isSaving={isSaving}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 text-white">
                        {achievements.map((achievement) => (
                            <div
                                key={achievement.id}
                                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-yellow-400/50 hover:scale-105 transition-all duration-300"
                            >
                                <div className="text-4xl md:text-5xl mb-4">
                                    {iconMap[achievement.icon] || '🏆'}
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-white mb-2">
                                    {achievement.title}
                                </h3>
                                <p className="text-sm md:text-base text-white">{achievement.description}</p>

                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-bl-3xl"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
