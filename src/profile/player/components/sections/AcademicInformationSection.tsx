'use client';

import type { PlayerProfileFormData, ProfileValidationErrors } from '../../types';
import { TextInput } from '../inputs';

interface AcademicInformationSectionProps {
    formData: PlayerProfileFormData;
    setFormData: React.Dispatch<React.SetStateAction<PlayerProfileFormData>>;
    errors?: ProfileValidationErrors;
    handleBlur?: (field: string, value: string | undefined | null) => void;
    isEditing: boolean;
}

export function AcademicInformationSection({
    formData,
    setFormData,
    isEditing,
}: AcademicInformationSectionProps) {
    const handleChange = (field: keyof PlayerProfileFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleArrayChange = (field: 'honors', value: string[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const addHonor = () => {
        const honors = formData.honors || [];
        setFormData((prev) => ({ ...prev, honors: [...honors, ''] }));
    };

    const updateHonor = (index: number, value: string) => {
        const honors = [...(formData.honors || [])];
        honors[index] = value;
        handleArrayChange('honors', honors);
    };

    const removeHonor = (index: number) => {
        const honors = [...(formData.honors || [])];
        honors.splice(index, 1);
        handleArrayChange('honors', honors);
    };

    // Parse test scores from string format
    const testScoresObj = formData.testScores ? JSON.parse(formData.testScores) : { sat: '', act: '' };
    const satScore = testScoresObj.sat || '';
    const actScore = testScoresObj.act || '';

    const handleTestScoreChange = (type: 'sat' | 'act', value: string) => {
        const scores = { ...testScoresObj, [type]: value };
        handleChange('testScores', JSON.stringify(scores));
    };

    return (
        <div className="space-y-4">
            <hr className="border-t-2 border-gray-300 my-6 mt-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Academic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                    label="SAT Score"
                    name="satScore"
                    type="number"
                    value={satScore}
                    onChange={(value) => handleTestScoreChange('sat', value)}
                    placeholder="Optional"
                    disabled={!isEditing}
                />

                <TextInput
                    label="ACT Score"
                    name="actScore"
                    type="number"
                    value={actScore}
                    onChange={(value) => handleTestScoreChange('act', value)}
                    placeholder="Optional"
                    disabled={!isEditing}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                    label="Graduation Year"
                    name="graduationYear"
                    type="number"
                    value={formData.graduationYear || ''}
                    onChange={(value) => handleChange('graduationYear', value)}
                    placeholder="Optional"
                    disabled={!isEditing}
                />

                <TextInput
                    label="GPA"
                    name="academicGpa"
                    type="number"
                    value={formData.gpa || ''}
                    onChange={(value) => handleChange('gpa', value)}
                    min={0}
                    max={4.0}
                    step={0.01}
                    placeholder="Optional"
                    disabled={!isEditing}
                />
            </div>

            <TextInput
                label="Class Rank"
                name="classRank"
                value={formData.classRank || ''}
                onChange={(value) => handleChange('classRank', value)}
                placeholder="Optional"
                disabled={!isEditing}
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Honors & Awards
                </label>
                {isEditing ? (
                    <div className="space-y-2">
                        {(formData.honors || []).map((honor, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={honor}
                                    onChange={(e) => updateHonor(index, e.target.value)}
                                    className="flex-1 h-12 px-4 bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-500 border-2 border-white/80 rounded-xl focus:outline-none focus:bg-white/80 focus:border-white transition-all"
                                    placeholder="Optional"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeHonor(index)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addHonor}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Add Honor/Award
                        </button>
                    </div>
                ) : (
                    <div>
                        {formData.honors && formData.honors.length > 0 ? (
                            <ul className="list-disc list-inside space-y-1">
                                {formData.honors.map((honor, index) => (
                                    <li key={index} className="text-gray-900">
                                        {honor}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-900">Not provided</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
