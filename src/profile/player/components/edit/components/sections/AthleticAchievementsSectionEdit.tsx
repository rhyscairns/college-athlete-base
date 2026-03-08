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
        <div className="space-y-4 p-6 sm:p-8 bg-white rounded-2xl shadow-lg animate-fade-in">
            <div className="space-y-4">
                {formData.map((achievement, index) => (
                    <div
                        key={achievement.id}
                        className="space-y-3 p-6 bg-gray-50 rounded-xl border border-gray-200"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                            <h4 className="text-sm font-semibold text-gray-900">
                                Achievement {index + 1}
                            </h4>
                            <button
                                type="button"
                                onClick={() => handleRemoveAchievement(index)}
                                disabled={isSaving}
                                className="min-h-[44px] w-full sm:w-auto px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
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
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Icon
                                </label>
                                <select
                                    id={`achievement-icon-${index}`}
                                    value={achievement.icon}
                                    onChange={(e) => handleAchievementChange(index, 'icon', e.target.value)}
                                    disabled={isSaving}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Color
                                </label>
                                <select
                                    id={`achievement-color-${index}`}
                                    value={achievement.color}
                                    onChange={(e) => handleAchievementChange(index, 'color', e.target.value)}
                                    disabled={isSaving}
                                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                <p className="text-center text-gray-500 py-8">
                    No achievements added yet. Click "Add Achievement" to get started.
                </p>
            )}

            <button
                type="button"
                onClick={handleAddAchievement}
                disabled={isSaving}
                className="min-h-[44px] w-full sm:w-auto px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg font-semibold hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
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
