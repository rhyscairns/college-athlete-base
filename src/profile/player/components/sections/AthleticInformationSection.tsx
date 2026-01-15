'use client';

import type { AthleticInformationSectionProps, PlayerProfileFormData } from '../../types';
import { TextInput } from '../inputs';

export function AthleticInformationSection({ formData, setFormData, isEditing }: AthleticInformationSectionProps) {
    const handleChange = (field: keyof PlayerProfileFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleArrayChange = (field: 'previousTeams' | 'championships' | 'allStarSelections', value: string) => {
        // Convert comma-separated string to array
        const arrayValue = value ? value.split(',').map(item => item.trim()).filter(item => item) : [];
        setFormData((prev) => ({ ...prev, [field]: arrayValue }));
    };

    return (
        <div className="space-y-4">
            <hr className="border-t-2 border-gray-300 my-6 mt-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Athletic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                    label="Club Team"
                    name="clubTeam"
                    value={formData.clubTeam || ''}
                    onChange={(value) => handleChange('clubTeam', value)}
                    placeholder="Optional"
                    disabled={!isEditing}
                />

                <TextInput
                    label="High School"
                    name="highSchool"
                    value={formData.highSchool || ''}
                    onChange={(value) => handleChange('highSchool', value)}
                    placeholder="Optional"
                    disabled={!isEditing}
                />
            </div>

            <div>
                <label htmlFor="input-previousTeams" className="block text-sm font-medium text-gray-700 mb-1">
                    Previous Teams
                </label>
                <textarea
                    id="input-previousTeams"
                    name="previousTeams"
                    value={formData.previousTeams?.join(', ') || ''}
                    onChange={(e) => handleArrayChange('previousTeams', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Optional"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-500 border-2 border-white/80 rounded-xl focus:outline-none focus:bg-white/80 focus:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
            </div>

            <div>
                <label htmlFor="input-championships" className="block text-sm font-medium text-gray-700 mb-1">
                    Championships
                </label>
                <textarea
                    id="input-championships"
                    name="championships"
                    value={formData.championships?.join(', ') || ''}
                    onChange={(e) => handleArrayChange('championships', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Optional"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-500 border-2 border-white/80 rounded-xl focus:outline-none focus:bg-white/80 focus:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
            </div>

            <div>
                <label htmlFor="input-allStarSelections" className="block text-sm font-medium text-gray-700 mb-1">
                    All-Star Selections
                </label>
                <textarea
                    id="input-allStarSelections"
                    name="allStarSelections"
                    value={formData.allStarSelections?.join(', ') || ''}
                    onChange={(e) => handleArrayChange('allStarSelections', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Optional"
                    rows={3}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-500 border-2 border-white/80 rounded-xl focus:outline-none focus:bg-white/80 focus:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
            </div>
        </div>
    );
}
