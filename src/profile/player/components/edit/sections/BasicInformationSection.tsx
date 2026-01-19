'use client';

import type { BasicInformationSectionProps, PlayerProfileFormData } from '../../../types';
import { SPORTS_LIST, COUNTRIES_LIST, US_STATES_LIST, SEX_OPTIONS } from '@/authentication/constants';
import { TextInput, SelectInput, EmailInput } from '../inputs';

export function BasicInformationSection({ formData, setFormData, errors, handleBlur, isEditing }: BasicInformationSectionProps) {
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={(value) => handleChange('firstName', value)}
                    onBlur={() => onBlur('firstName')}
                    error={errors?.firstName}
                    required
                    disabled={!isEditing}
                />

                <TextInput
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={(value) => handleChange('lastName', value)}
                    onBlur={() => onBlur('lastName')}
                    error={errors?.lastName}
                    required
                    disabled={!isEditing}
                />
            </div>

            <EmailInput
                value={formData.email}
                onChange={(value) => handleChange('email', value)}
                onBlur={() => onBlur('email')}
                error={errors?.email}
                disabled={!isEditing}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectInput
                    label="Sex"
                    name="sex"
                    value={formData.sex}
                    onChange={(value) => handleChange('sex', value)}
                    onBlur={() => onBlur('sex')}
                    error={errors?.sex}
                    options={SEX_OPTIONS}
                    required
                    disabled={!isEditing}
                />

                <SelectInput
                    label="Sport"
                    name="sport"
                    value={formData.sport}
                    onChange={(value) => handleChange('sport', value)}
                    onBlur={() => onBlur('sport')}
                    error={errors?.sport}
                    options={SPORTS_LIST}
                    required
                    disabled={!isEditing}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                    label="Position"
                    name="position"
                    value={formData.position}
                    onChange={(value) => handleChange('position', value)}
                    onBlur={() => onBlur('position')}
                    error={errors?.position}
                    required
                    disabled={!isEditing}
                />

                <TextInput
                    label="GPA"
                    name="gpa"
                    type="number"
                    value={formData.gpa}
                    onChange={(value) => handleChange('gpa', value)}
                    onBlur={() => onBlur('gpa')}
                    error={errors?.gpa}
                    min={0}
                    max={4.0}
                    step={0.01}
                    required
                    disabled={!isEditing}
                />
            </div>

            <SelectInput
                label="Country"
                name="country"
                value={formData.country}
                onChange={(value) => handleChange('country', value)}
                onBlur={() => onBlur('country')}
                error={errors?.country}
                options={COUNTRIES_LIST}
                required
                disabled={!isEditing}
            />

            {formData.country === 'USA' && (
                <SelectInput
                    label="State"
                    name="state"
                    value={formData.state || ''}
                    onChange={(value) => handleChange('state', value)}
                    options={US_STATES_LIST}
                    required
                    disabled={!isEditing}
                />
            )}

            {formData.country && formData.country !== 'USA' && (
                <TextInput
                    label="Region"
                    name="region"
                    value={formData.region || ''}
                    onChange={(value) => handleChange('region', value)}
                    placeholder="e.g., Ontario, Bavaria"
                    required
                    disabled={!isEditing}
                />
            )}

            <TextInput
                label="Scholarship Amount"
                name="scholarshipAmount"
                value={formData.scholarshipAmount || ''}
                onChange={(value) => handleChange('scholarshipAmount', value)}
                placeholder="Optional"
                disabled={!isEditing}
            />
        </div>
    );
}
