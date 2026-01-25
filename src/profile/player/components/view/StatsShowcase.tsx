'use client';

import { useState, useEffect, useRef } from 'react';
import type { StatsShowcaseProps, ValidationErrors } from '../../types';
import { EditButton } from './EditButton';
import { StatsShowcaseEdit } from './StatsShowcaseEdit';

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
    const [formData, setFormData] = useState<Record<string, number | string>>({
        receivingYards: stats.receivingYards,
        touchdowns: stats.touchdowns,
        receptions: stats.receptions,
        yardsPerCatch: stats.yardsPerCatch,
        longestReception: stats.longestReception,
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSaving, setIsSaving] = useState(false);

    // Reset form data when stats change or when exiting edit mode
    useEffect(() => {
        if (!isEditing) {
            setFormData({
                receivingYards: stats.receivingYards,
                touchdowns: stats.touchdowns,
                receptions: stats.receptions,
                yardsPerCatch: stats.yardsPerCatch,
                longestReception: stats.longestReception,
            });
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
            } else if (typeof value === 'string' && isNaN(Number(value))) {
                validationErrors[`${key}-value`] = 'Value must be a number';
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
                acc[key] = typeof value === 'string' && !isNaN(Number(value)) ? Number(value) : value;
                return acc;
            }, {} as Record<string, number | string>);

            onSave({ stats: updatedStats });
        }

        setIsSaving(false);
        setErrors({});
    };

    const handleCancel = () => {
        // Reset form data to original stats
        setFormData({
            receivingYards: stats.receivingYards,
            touchdowns: stats.touchdowns,
            receptions: stats.receptions,
            yardsPerCatch: stats.yardsPerCatch,
            longestReception: stats.longestReception,
        });
        setErrors({});
        if (onCancel) {
            onCancel();
        }
    };

    const statCards = [
        { label: 'Receiving Yards', value: stats.receivingYards.toLocaleString(), sublabel: 'Junior Season' },
        { label: 'Touchdowns', value: stats.touchdowns, sublabel: '2023-24' },
        { label: 'Receptions', value: stats.receptions, sublabel: 'Total Catches' },
        { label: 'Yards/Catch', value: stats.yardsPerCatch, sublabel: 'Average' },
        { label: 'Longest Reception', value: `${stats.longestReception}`, sublabel: 'Yards' },
    ];

    return (
        <section
            id="stats"
            ref={sectionRef}
            className={`relative min-h-[calc(100vh-80px)] flex items-center px-6 py-12 transition-all duration-300 ease-in-out ${isEditing ? 'bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6' : ''
                }`}
        >
            <div className="max-w-7xl mx-auto w-full">
                {/* Section Header with Edit Button */}
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <h2 className="text-5xl md:text-6xl font-black text-white">Season Statistics</h2>
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
                    <p className="text-xl text-slate-400">Junior Year Performance • 2023-24</p>
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
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {statCards.map((stat, idx) => (
                            <div
                                key={idx}
                                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 hover:border-yellow-400/50 hover:scale-105 transition-all duration-300"
                            >
                                <div className="text-center">
                                    <div className="text-5xl font-black text-yellow-400 mb-3">{stat.value}</div>
                                    <div className="text-sm font-bold text-white uppercase tracking-wide mb-1">{stat.label}</div>
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
