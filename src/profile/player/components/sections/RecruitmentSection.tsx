'use client';

import type { PlayerProfileFormData, RecruitmentSectionProps } from '../../types';
import { TextInput, SelectInput } from '../inputs';

const RECRUITMENT_STATUS_OPTIONS = [
    { value: 'open', label: 'Open to Recruitment' },
    { value: 'committed', label: 'Committed' },
    { value: 'not-looking', label: 'Not Looking' },
] as const;

export function RecruitmentSection({ formData, setFormData, isEditing }: RecruitmentSectionProps) {
    const handleChange = (field: keyof PlayerProfileFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-4">
            <hr className="border-t-2 border-gray-300 my-6 mt-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recruitment Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectInput
                    label="Recruitment Status"
                    name="recruitmentStatus"
                    value={formData.recruitmentStatus || ''}
                    onChange={(value) => handleChange('recruitmentStatus', value)}
                    options={RECRUITMENT_STATUS_OPTIONS}
                    disabled={!isEditing}
                />

                <TextInput
                    label="Available Date"
                    name="availableDate"
                    type="date"
                    value={formData.availableDate || ''}
                    onChange={(value) => handleChange('availableDate', value)}
                    disabled={!isEditing}
                />
            </div>

            <TextInput
                label="Scholarship Needs"
                name="scholarshipNeeds"
                value={formData.scholarshipNeeds || ''}
                onChange={(value) => handleChange('scholarshipNeeds', value)}
                placeholder="Optional"
                disabled={!isEditing}
            />
        </div>
    );
}
