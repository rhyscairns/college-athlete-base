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
        <div className="space-y-4 p-3 sm:p-4 bg-white/5 rounded-2xl border border-white/10 animate-fade-in text-white">
            <div className="space-y-4">
                {formData.map((achievement, index) => (
                    <div
                        key={achievement.id}
                        className="space-y-3 p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <h4 className="text-sm font-semibold text-white">
                                Achievement {index + 1}
                            </h4>
                            <button
                                type="button"
                                onClick={() => handleRemoveAchievement(index)}
                                disabled={isSaving}
                                className="min-h-[44px] w-full sm:w-auto px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-semibold hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation"
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
                                    className="block text-sm font-medium text-white/90 mb-2"
                                >
                                    Icon
                                </label>
                                <select
                                    id={`achievement-icon-${index}`}
                                    value={achievement.icon}
                                    onChange={(e) => handleAchievementChange(index, 'icon', e.target.value)}
                                    disabled={isSaving}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                                    className="block text-sm font-medium text-white/90 mb-2"
                                >
                                    Color
                                </label>
                                <select
                                    id={`achievement-color-${index}`}
                                    value={achievement.color}
                                    onChange={(e) => handleAchievementChange(index, 'color', e.target.value)}
                                    disabled={isSaving}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                <p className="text-center text-slate-400 py-8">
                    No achievements added yet. Click "Add Achievement" to get started.
                </p>
            )}

            <button
                type="button"
                onClick={handleAddAchievement}
                disabled={isSaving}
                className="min-h-[44px] w-full sm:w-auto px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-semibold hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation"
            >
                + Add Achievement
            </button>

            {errors.achievements && (
                <p className="text-sm text-red-600">{errors.achievements}</p>
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
