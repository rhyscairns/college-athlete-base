'use client';

import { useState, useEffect, useRef } from 'react';
import { StatsShowcaseProps, ValidationErrors } from '../../types';
import { EditButton } from './EditButton';
import { StatsShowcaseEdit } from '../edit/components/sections/StatsShowcaseEdit';
import { EmptySection } from '../EmptySection';
import { hasSectionData } from '../../utils/profile-helpers';

export function StatsShowcase({
    stats,
    isOwner = false,
    isEditing = false,
    isAnyOtherSectionEditing = false,
    onEdit,
    onSave,
    onCancel,
}: StatsShowcaseProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const [formData, setFormData] = useState<Record<string, number | string>>(stats);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSaving, setIsSaving] = useState(false);

    // Reset form data when stats change or when exiting edit mode
    useEffect(() => {
        if (!isEditing) {
            setFormData(stats);
            setErrors({});
        }
    }, [isEditing, stats]);

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

    const validateStatsSection = (data: Record<string, number | string>): ValidationErrors => {
        const validationErrors: ValidationErrors = {};

        // Validate that numeric values are valid numbers
        Object.entries(data).forEach(([key, value]) => {
            if (value === '' || value === null || value === undefined) {
                validationErrors[`${key}-value`] = 'Value is required';
            } else if (typeof value === 'string') {
                // Remove commas before checking if it's a number
                const cleanedValue = value.replace(/,/g, '');
                if (isNaN(Number(cleanedValue))) {
                    validationErrors[`${key}-value`] = 'Value must be a number';
                }
            }
        });

        return validationErrors;
    };

    const handleSave = async () => {
        const validationErrors = validateStatsSection(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSaving(true);
        // Simulate save delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (onSave) {
            // Convert string values to numbers where appropriate
            const updatedStats = Object.entries(formData).reduce((acc, [key, value]) => {
                if (typeof value === 'string') {
                    // Remove commas and check if it's a valid number
                    const cleanedValue = value.replace(/,/g, '');
                    acc[key] = !isNaN(Number(cleanedValue)) && cleanedValue !== '' ? Number(cleanedValue) : value;
                } else {
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, number | string>);

            onSave({ stats: updatedStats as any });
        }

        setIsSaving(false);
        setErrors({});
    };

    const handleCancel = () => {
        // Reset form data to original stats
        setFormData(stats);
        setErrors({});
        if (onCancel) {
            onCancel();
        }
    };

    // Check if stats section has data
    const hasStats = hasSectionData(stats, 'stats');

    // If no stats and not owner, hide the section
    if (!hasStats && !isOwner) {
        return null;
    }

    // If no stats and owner, show empty state (unless editing)
    if (!hasStats && isOwner && !isEditing) {
        return (
            <section
                id="stats"
                ref={sectionRef}
                className="relative min-h-[calc(100vh-80px)] flex items-center px-4 py-6"
            >
                <div className="max-w-6xl mx-auto w-full">
                    {/* Section Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Season Statistics</h2>
                        <p className="text-base text-slate-400">Junior Year Performance • 2023-24</p>
                    </div>

                    <EmptySection
                        title="No Stats Yet"
                        description="Add your season statistics to showcase your performance on the field. Include key metrics like receiving yards, touchdowns, and more."
                        isOwner={isOwner}
                        showEditButton={true}
                        onEdit={onEdit}
                        icon="📊"
                    />
                </div>
            </section>
        );
    }

    const statCards = Object.entries(stats || {}).map(([key, value]: [string, string | number]) => ({
        label: key,
        value: typeof value === 'string' ? value : value.toLocaleString(),
        sublabel: '',
    }));

    return (
        <section
            id="stats"
            ref={sectionRef}
            className={`relative min-h-[calc(100vh-80px)] flex items-center px-4 py-6 transition-all duration-300 ease-in-out ${isEditing ? 'bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6' : ''
                }`}
        >
            <div className="max-w-6xl mx-auto w-full">
                {/* Section Header with Edit Button */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-4 mb-3">
                        <h2 className="text-3xl md:text-4xl font-black text-white">Season Statistics</h2>
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
                    <p className="text-base text-slate-400">Junior Year Performance • 2023-24</p>
                </div>

                {isEditing ? (
                    <StatsShowcaseEdit
                        formData={formData}
                        setFormData={setFormData}
                        errors={errors}
                        isSaving={isSaving}
                        onSave={handleSave}
                        onCancel={handleCancel}
                    />
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {statCards.map((stat, idx) => (
                            <div
                                key={idx}
                                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-yellow-400/50 hover:scale-105 transition-all duration-300"
                            >
                                <div className="text-center">
                                    <div className="text-4xl font-black text-yellow-400 mb-2">{stat.value}</div>
                                    <div className="text-xs font-bold text-white uppercase tracking-wide mb-1">{stat.label}</div>
                                    <div className="text-xs text-slate-400">{stat.sublabel}</div>
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-amber-500/0 group-hover:from-yellow-400/5 group-hover:to-amber-500/5 rounded-2xl transition-all"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
