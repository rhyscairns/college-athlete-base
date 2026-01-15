'use client';

import type { ContactInformationSectionProps, PlayerProfileFormData } from '../../types';
import { TextInput, EmailInput } from '../inputs';

export function ContactInformationSection({ formData, setFormData, errors, handleBlur, isEditing }: ContactInformationSectionProps) {
    const handleChange = (field: keyof PlayerProfileFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const onBlur = (field: string) => {
        if (handleBlur) {
            handleBlur(field, formData[field as keyof PlayerProfileFormData] as string);
        }
    };

    return (
        <div className="space-y-4">
            <hr className="border-t-2 border-gray-300 my-6 mt-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>

            <TextInput
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(value) => handleChange('phone', value)}
                onBlur={() => onBlur('phone')}
                error={errors?.phone}
                placeholder="Optional"
                disabled={!isEditing}
            />

            <TextInput
                label="Parent/Guardian Name"
                name="parentGuardianName"
                value={formData.parentGuardianName || ''}
                onChange={(value) => handleChange('parentGuardianName', value)}
                placeholder="Optional"
                disabled={!isEditing}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                    label="Parent/Guardian Phone"
                    name="parentGuardianPhone"
                    type="tel"
                    value={formData.parentGuardianPhone || ''}
                    onChange={(value) => handleChange('parentGuardianPhone', value)}
                    onBlur={() => onBlur('parentGuardianPhone')}
                    error={errors?.parentGuardianPhone}
                    placeholder="Optional"
                    disabled={!isEditing}
                />

                <EmailInput
                    label="Parent/Guardian Email"
                    name="parentGuardianEmail"
                    value={formData.parentGuardianEmail || ''}
                    onChange={(value) => handleChange('parentGuardianEmail', value)}
                    onBlur={() => onBlur('parentGuardianEmail')}
                    error={errors?.parentGuardianEmail}
                    placeholder="Optional"
                    disabled={!isEditing}
                />
            </div>

            <div className="w-full">
                <label htmlFor="coachReferences" className="block text-sm font-medium text-gray-700 mb-1">
                    Coach References
                </label>
                <textarea
                    id="coachReferences"
                    value={formData.coachReferences ? JSON.stringify(formData.coachReferences) : ''}
                    onChange={(e) => handleChange('coachReferences', e.target.value)}
                    placeholder="Optional"
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm text-gray-800 placeholder-gray-500 border-2 border-white/80 rounded-xl focus:outline-none focus:bg-white/80 focus:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none"
                />
            </div>
        </div>
    );
}
