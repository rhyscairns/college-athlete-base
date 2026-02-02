import React from 'react';
import { TextInput } from '../inputs/TextInput';
import { ActionButtons } from './ActionButtons';
import type { Hero, HeroSectionEditProps } from '../../../../types';

export function HeroSectionEdit({
    formData,
    setFormData,
    errors,
    isSaving,
    onSave,
    onCancel,
}: HeroSectionEditProps) {
    const handleFieldChange = (field: keyof Hero, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <div className="space-y-4 p-3 sm:p-4 bg-white/5 rounded-2xl border border-white/10 animate-fade-in">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={(value: string) => handleFieldChange('firstName', value)}
                    error={errors.firstName}
                    required
                    disabled={isSaving}
                />
                <TextInput
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={(value: string) => handleFieldChange('lastName', value)}
                    error={errors.lastName}
                    required
                    disabled={isSaving}
                />
            </div>

            {/* Position */}
            <TextInput
                label="Position"
                name="position"
                value={formData.position}
                onChange={(value: string) => handleFieldChange('position', value)}
                error={errors.position}
                required
                disabled={isSaving}
            />

            {/* School and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                    label="School"
                    name="school"
                    value={formData.school}
                    onChange={(value: string) => handleFieldChange('school', value)}
                    error={errors.school}
                    required
                    disabled={isSaving}
                />
                <TextInput
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={(value: string) => handleFieldChange('location', value)}
                    error={errors.location}
                    disabled={isSaving}
                />
            </div>

            {/* Class Year */}
            <TextInput
                label="Class Year"
                name="classYear"
                value={formData.classYear}
                onChange={(value: string) => handleFieldChange('classYear', value)}
                error={errors.classYear}
                disabled={isSaving}
            />

            {/* Height and Weight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                    label="Height"
                    name="height"
                    value={formData.height}
                    onChange={(value: string) => handleFieldChange('height', value)}
                    error={errors.height}
                    placeholder="e.g., 6'2&quot;"
                    disabled={isSaving}
                />
                <TextInput
                    label="Weight"
                    name="weight"
                    value={formData.weight}
                    onChange={(value: string) => handleFieldChange('weight', value)}
                    error={errors.weight}
                    placeholder="e.g., 185 lbs"
                    disabled={isSaving}
                />
            </div>

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
