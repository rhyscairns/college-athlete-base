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
        <div className="space-y-4 p-6 sm:p-8 rounded-2xl animate-fade-in" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}>
            {Object.entries(formData).length === 0 ? (
                <p className="text-center py-8" style={{ color: 'var(--text-lo)' }}>
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
                                        className="min-h-[44px] px-4 py-3 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation whitespace-nowrap"
                                        style={{ background: 'oklch(60% 0.22 25 / 0.1)', color: 'var(--status-danger)', border: '1px solid oklch(60% 0.22 25 / 0.3)' }}
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
                className="min-h-[44px] w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation"
                style={{ background: 'oklch(68% 0.22 150 / 0.1)', color: 'var(--brand-500)', border: '1px solid oklch(68% 0.22 150 / 0.3)' }}
            >
                + Add Stat
            </button>

            {errors.stats && (
                <p className="text-sm" style={{ color: 'var(--status-danger)' }}>{errors.stats}</p>
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
