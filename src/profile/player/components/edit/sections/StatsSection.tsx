'use client';

import { TextInput } from '../inputs';
import type { StatsSectionProps } from '../../../types';

export function StatsSection({ formData, setFormData, isEditing }: StatsSectionProps) {
    const handleStatChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            stats: {
                ...prev.stats,
                [field]: value ? parseFloat(value) : undefined,
            },
        }));
    };

    return (
        <div className="space-y-4">
            <hr className="border-t-2 border-gray-300 my-6 mt-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                    label="Points Per Game"
                    name="pointsPerGame"
                    type="number"
                    value={formData.stats?.pointsPerGame?.toString() || ''}
                    onChange={(value) => handleStatChange('pointsPerGame', value)}
                    disabled={!isEditing}
                    step={0.1}
                    placeholder="Optional"
                />
                <TextInput
                    label="Assists Per Game"
                    name="assistsPerGame"
                    type="number"
                    value={formData.stats?.assistsPerGame?.toString() || ''}
                    onChange={(value) => handleStatChange('assistsPerGame', value)}
                    disabled={!isEditing}
                    step={0.1}
                    placeholder="Optional"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                    label="Rebounds Per Game"
                    name="reboundsPerGame"
                    type="number"
                    value={formData.stats?.reboundsPerGame?.toString() || ''}
                    onChange={(value) => handleStatChange('reboundsPerGame', value)}
                    disabled={!isEditing}
                    step={0.1}
                    placeholder="Optional"
                />
            </div>
        </div>
    );
}
