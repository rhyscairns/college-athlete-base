import React from 'react';
import { TextInput } from '../inputs/TextInput';
import { ActionButtons } from './ActionButtons';
import type { StatsShowcaseEditProps } from '../../../../types';

export function StatsShowcaseEdit({
    formData,
    setFormData,
    errors,
    isSaving,
    onSave,
    onCancel,
}: StatsShowcaseEditProps) {
    const handleStatChange = (key: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleAddStat = () => {
        const newKey = `newStat${Object.keys(formData).length + 1}`;
        setFormData((prev) => ({
            ...prev,
            [newKey]: '',
        }));
    };

    const handleRemoveStat = (key: string) => {
        setFormData((prev) => {
            const updated = { ...prev };
            delete updated[key];
            return updated;
        });
    };

    const handleKeyChange = (oldKey: string, newKey: string) => {
        if (oldKey === newKey) return;

        setFormData((prev) => {
            const updated = { ...prev };
            const value = updated[oldKey];
            delete updated[oldKey];
            updated[newKey] = value;
            return updated;
        });
    };

    return (
        <div className="space-y-4 p-6 sm:p-8 bg-white rounded-2xl shadow-lg animate-fade-in">
            {Object.entries(formData).length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                    No stats added yet. Click &quot;Add Stat&quot; to get started.
                </p>
            ) : (
                <div className="space-y-3">
                    {Object.entries(formData).map(([key, value]) => (
                        <div key={key} className="flex flex-col gap-3">
                            <TextInput
                                label="Stat Name"
                                name={`stat-name-${key}`}
                                value={key}
                                onChange={(newKey: string) => handleKeyChange(key, newKey)}
                                error={errors[`${key}-name`]}
                                disabled={isSaving}
                                placeholder="e.g., Receiving Yards"
                            />
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <TextInput
                                        label="Value"
                                        name={`stat-value-${key}`}
                                        value={String(value)}
                                        onChange={(newValue: string) => handleStatChange(key, newValue)}
                                        error={errors[`${key}-value`]}
                                        disabled={isSaving}
                                        placeholder="e.g., 1250"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveStat(key)}
                                        disabled={isSaving}
                                        className="min-h-[44px] px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-semibold hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation whitespace-nowrap"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button
                type="button"
                onClick={handleAddStat}
                disabled={isSaving}
                className="min-h-[44px] w-full sm:w-auto px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 text-sm font-semibold hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation"
            >
                + Add Stat
            </button>

            {errors.stats && (
                <p className="text-sm text-red-600">{errors.stats}</p>
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
