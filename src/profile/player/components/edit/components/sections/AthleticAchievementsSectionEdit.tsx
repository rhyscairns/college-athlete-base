import React from 'react';
import { TextInput } from '../inputs/TextInput';
import { ActionButtons } from './ActionButtons';
import type { AthleticAchievementsSectionEditProps, Achievement } from '../../../../types';
import { iconOptions, colorOptions } from '../../../../constants';

export function AthleticAchievementsSectionEdit({
    formData,
    setFormData,
    errors,
    isSaving,
    onSave,
    onCancel,
}: AthleticAchievementsSectionEditProps) {
    const handleAchievementChange = (index: number, field: keyof Achievement, value: string) => {
        setFormData((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [field]: value,
            };
            return updated;
        });
    };

    const handleAddAchievement = () => {
        const newAchievement: Achievement = {
            id: `achievement-${Date.now()}`,
            icon: 'trophy',
            title: '',
            description: '',
            color: 'gold',
        };
        setFormData((prev) => [...prev, newAchievement]);
    };

    const handleRemoveAchievement = (index: number) => {
        setFormData((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4 p-6 sm:p-8 rounded-2xl animate-fade-in" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}>
            <div className="space-y-4">
                {formData.map((achievement, index) => (
                    <div
                        key={achievement.id}
                        className="space-y-3 p-6 rounded-xl"
                        style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-3)' }}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <h4 className="text-sm font-semibold" style={{ color: 'var(--text-hi)' }}>
                                Achievement {index + 1}
                            </h4>
                            <button
                                type="button"
                                onClick={() => handleRemoveAchievement(index)}
                                disabled={isSaving}
                                className="min-h-[44px] w-full sm:w-auto px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                                style={{ background: 'oklch(60% 0.22 25 / 0.1)', color: 'var(--status-danger)', border: '1px solid oklch(60% 0.22 25 / 0.3)' }}
                            >
                                Remove
                            </button>
                        </div>

                        <TextInput
                            label="Title"
                            name={`achievement-title-${index}`}
                            value={achievement.title}
                            onChange={(value: string) => handleAchievementChange(index, 'title', value)}
                            error={errors[`achievement-${index}-title`]}
                            disabled={isSaving}
                            placeholder="e.g., All-State Selection"
                            required
                        />

                        <TextInput
                            label="Description"
                            name={`achievement-description-${index}`}
                            value={achievement.description}
                            onChange={(value: string) => handleAchievementChange(index, 'description', value)}
                            error={errors[`achievement-${index}-description`]}
                            disabled={isSaving}
                            placeholder="e.g., 1st Team WR (2023)"
                            required
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor={`achievement-icon-${index}`}
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: 'var(--text-mid)' }}
                                >
                                    Icon
                                </label>
                                <select
                                    id={`achievement-icon-${index}`}
                                    value={achievement.icon}
                                    onChange={(e) => handleAchievementChange(index, 'icon', e.target.value)}
                                    disabled={isSaving}
                                    className="w-full px-4 py-3 rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)', color: 'var(--text-hi)' }}
                                >
                                    {iconOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor={`achievement-color-${index}`}
                                    className="block text-sm font-medium mb-2"
                                    style={{ color: 'var(--text-mid)' }}
                                >
                                    Color
                                </label>
                                <select
                                    id={`achievement-color-${index}`}
                                    value={achievement.color}
                                    onChange={(e) => handleAchievementChange(index, 'color', e.target.value)}
                                    disabled={isSaving}
                                    className="w-full px-4 py-3 rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)', color: 'var(--text-hi)' }}
                                >
                                    {colorOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {formData.length === 0 && (
                <p className="text-center py-8" style={{ color: 'var(--text-lo)' }}>
                    No achievements added yet. Click "Add Achievement" to get started.
                </p>
            )}

            <button
                type="button"
                onClick={handleAddAchievement}
                disabled={isSaving}
                className="min-h-[44px] w-full sm:w-auto px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                style={{ background: 'oklch(68% 0.22 150 / 0.1)', color: 'var(--brand-500)', border: '1px solid oklch(68% 0.22 150 / 0.3)' }}
            >
                + Add Achievement
            </button>

            {errors.achievements && (
                <p className="text-sm" style={{ color: 'var(--status-danger)' }}>{errors.achievements}</p>
            )}

            {/* Action Buttons */}
            <ActionButtons
                onSave={onSave}
                onCancel={onCancel}
                isSaving={isSaving}
                disabled={isSaving}
            />
        </div>
    );
}
