'use client';

import { TextInput } from '../inputs';
import type { PhysicalAttributesSectionProps, PlayerProfileFormData } from '../../types';

export function PhysicalAttributesSection({
    formData,
    setFormData,
    errors,
    handleBlur,
    isEditing,
}: PhysicalAttributesSectionProps) {
    const handleChange = (field: keyof PlayerProfileFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    if (!isEditing) {
        return (
            <div className="border-b border-gray-200 pb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Physical Attributes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Height
                        </label>
                        <p className="text-gray-900">{formData.height || 'Not provided'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Weight
                        </label>
                        <p className="text-gray-900">{formData.weight || 'Not provided'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <hr className="border-t-2 border-gray-300 my-6 mt-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Physical Attributes</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                    label="Height"
                    name="height"
                    type="number"
                    value={formData.height || ''}
                    onChange={(value) => handleChange('height', value)}
                    placeholder="Optional"
                />

                <TextInput
                    label="Weight"
                    name="weight"
                    type="number"
                    value={formData.weight || ''}
                    onChange={(value) => handleChange('weight', value)}
                    placeholder="Optional"
                />
            </div>
        </div>
    );
}
