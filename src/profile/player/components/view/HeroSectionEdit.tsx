import React from 'react';
import { TextInput } from '../edit/inputs/TextInput';
import { ActionButtons } from './ActionButtons';
import type { HeroData, ValidationErrors } from '../../types';

interface HeroSectionEditProps {
    formData: HeroData;
    setFormData: React.Dispatch<React.SetStateAction<HeroData>>;
    errors: ValidationErrors;
    isSaving: boolean;
    onSave: () => void;
    onCancel: () => void;
}

export function HeroSectionEdit({
    formData,
    setFormData,
    errors,
    isSaving,
    onSave,
    onCancel,
}: HeroSectionEditProps) {
    const handleFieldChange = (field: keyof HeroData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <div className="space-y-4 p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10 animate-fade-in">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={(value) => handleFieldChange('firstName', value)}
                    error={errors.firstName}
                    required
                    disabled={isSaving}
                />
                <TextInput
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={(value) => handleFieldChange('lastName', value)}
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
                onChange={(value) => handleFieldChange('position', value)}
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
                    onChange={(value) => handleFieldChange('school', value)}
                    error={errors.school}
                    required
                    disabled={isSaving}
                />
                <TextInput
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={(value) => handleFieldChange('location', value)}
                    error={errors.location}
                    disabled={isSaving}
                />
            </div>

            {/* Class Year */}
            <TextInput
                label="Class Year"
                name="classYear"
                value={formData.classYear}
                onChange={(value) => handleFieldChange('classYear', value)}
                error={errors.classYear}
                disabled={isSaving}
            />

            {/* Height and Weight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                    label="Height"
                    name="height"
                    value={formData.height}
                    onChange={(value) => handleFieldChange('height', value)}
                    error={errors.height}
                    placeholder="e.g., 6'2&quot;"
                    disabled={isSaving}
                />
                <TextInput
                    label="Weight"
                    name="weight"
                    value={formData.weight}
                    onChange={(value) => handleFieldChange('weight', value)}
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
