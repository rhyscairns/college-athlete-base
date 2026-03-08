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

    const initials = `${formData.firstName?.charAt(0) || 'F'}${formData.lastName?.charAt(0) || 'L'}`;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Edit Mode Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Blue Gradient Header - Edit Mode */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-8 sm:px-8 sm:py-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full border-4 border-white bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <span className="text-2xl font-bold text-white">{initials}</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                            <p className="text-blue-100">Update your athletic profile information</p>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-6 sm:p-8 space-y-6">
                    {/* Personal Information Section */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            Personal Information
                        </h3>
                        <div className="space-y-4">
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
                        </div>
                    </div>

                    {/* Athletic Information Section */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            Athletic Information
                        </h3>
                        <div className="space-y-4">
                            <TextInput
                                label="Position"
                                name="position"
                                value={formData.position}
                                onChange={(value: string) => handleFieldChange('position', value)}
                                error={errors.position}
                                required
                                disabled={isSaving}
                                placeholder="e.g., Point Guard, Quarterback"
                            />
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
                        </div>
                    </div>

                    {/* School Information Section */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                </svg>
                            </div>
                            School Information
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextInput
                                    label="School"
                                    name="school"
                                    value={formData.school}
                                    onChange={(value: string) => handleFieldChange('school', value)}
                                    error={errors.school}
                                    required
                                    disabled={isSaving}
                                    placeholder="e.g., Lincoln High School"
                                />
                                <TextInput
                                    label="Location"
                                    name="location"
                                    value={formData.location}
                                    onChange={(value: string) => handleFieldChange('location', value)}
                                    error={errors.location}
                                    disabled={isSaving}
                                    placeholder="e.g., Los Angeles, CA"
                                />
                            </div>
                            <TextInput
                                label="Class Year"
                                name="classYear"
                                value={formData.classYear}
                                onChange={(value: string) => handleFieldChange('classYear', value)}
                                error={errors.classYear}
                                disabled={isSaving}
                                placeholder="e.g., 2025"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-6 border-t border-gray-200">
                        <ActionButtons
                            onSave={onSave}
                            onCancel={onCancel}
                            isSaving={isSaving}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
