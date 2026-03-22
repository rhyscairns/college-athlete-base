'use client';

import { useState, useEffect, useRef } from 'react';
import { StatsShowcaseProps, ValidationErrors } from '../../types';
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

    useEffect(() => {
        if (!isEditing) {
            setFormData(stats);
            setErrors({});
        }
    }, [isEditing, stats]);

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
        Object.entries(data).forEach(([key, value]) => {
            if (value === '' || value === null || value === undefined) {
                validationErrors[`${key}-value`] = 'Value is required';
            } else if (typeof value === 'string') {
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
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (onSave) {
            const updatedStats = Object.entries(formData).reduce((acc, [key, value]) => {
                if (typeof value === 'string') {
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
        setFormData(stats);
        setErrors({});
        if (onCancel) {
            onCancel();
        }
    };

    const hasStats = hasSectionData(stats, 'stats');

    if (!hasStats && !isOwner) {
        return null;
    }

    if (!hasStats && isOwner && !isEditing) {
        return (
            <section id="stats" ref={sectionRef} className="max-w-6xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <EmptySection
                        title="No Stats Yet"
                        description="Add your season statistics to showcase your performance. Include key metrics like receiving yards, touchdowns, and more."
                        isOwner={isOwner}
                        showEditButton={true}
                        onEdit={onEdit}
                        icon="📊"
                    />
                </div>
            </section>
        );
    }

    if (isEditing) {
        return (
            <section id="stats" ref={sectionRef} className="max-w-6xl mx-auto px-4 py-8">
                <StatsShowcaseEdit
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

    const statCards = Object.entries(stats || {}).map(([key, value]: [string, string | number]) => ({
        label: key,
        value: typeof value === 'string' ? value : value.toLocaleString(),
    }));

    return (
        <section id="stats" ref={sectionRef} className="max-w-6xl mx-auto px-4 py-8">
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
                            <span className="text-2xl">📊</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Season Statistics</h2>
                            <p className="text-blue-100">Junior Year Performance • 2023-24</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {statCards.map((stat, idx) => (
                            <div
                                key={idx}
                                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-md transition-all"
                            >
                                <div className="text-center">
                                    <div className="text-3xl font-black text-blue-600 mb-2">{stat.value}</div>
                                    <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
