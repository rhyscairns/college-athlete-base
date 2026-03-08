import React, { useCallback, useRef, useEffect } from 'react';
import { TextInput } from '../../../../authentication/components/TextInput';
import { EmailInput } from '../../../../authentication/components/EmailInput';
import type { CoachHeroSectionEditProps, CoachProfile } from '../../types';

export const CoachHeroSectionEdit = React.memo(function CoachHeroSectionEdit({
    formData,
    setFormData,
    errors,
    isSaving,
    onSave,
    onCancel,
}: CoachHeroSectionEditProps) {
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const handleFieldChange = useCallback((field: keyof CoachProfile, value: string) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    }, [setFormData]);

    const handleSaveKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter' && !isSaving) {
            e.preventDefault();
            onSave();
        }
    };

    const handleCancelKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter' && !isSaving) {
            e.preventDefault();
            onCancel();
        }
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
                            <p className="text-blue-100">Update your coaching profile information</p>
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

                    {/* Contact Information Section */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            Contact Information
                        </h3>
                        <div className="space-y-4">
                            <EmailInput
                                value={formData.email}
                                onChange={(value: string) => handleFieldChange('email', value)}
                                error={errors.email}
                                disabled={isSaving}
                            />
                            <TextInput
                                label="Phone"
                                name="phone"
                                type="text"
                                value={formData.phone || ''}
                                onChange={(value: string) => handleFieldChange('phone', value)}
                                error={errors.phone}
                                placeholder="e.g., +1 (310) 825-4321"
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    {/* Professional Information Section */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            Professional Information
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextInput
                                    label="University"
                                    name="university"
                                    value={formData.university || ''}
                                    onChange={(value: string) => handleFieldChange('university', value)}
                                    error={errors.university}
                                    placeholder="e.g., University of California, Los Angeles"
                                    disabled={isSaving}
                                />
                                <TextInput
                                    label="Position"
                                    name="position"
                                    value={formData.position || ''}
                                    onChange={(value: string) => handleFieldChange('position', value)}
                                    error={errors.position}
                                    placeholder="e.g., Head Basketball Coach"
                                    disabled={isSaving}
                                />
                            </div>
                            <TextInput
                                label="Sport"
                                name="sport"
                                value={formData.sport || ''}
                                onChange={(value: string) => handleFieldChange('sport', value)}
                                error={errors.sport}
                                placeholder="e.g., Basketball, Football, Soccer"
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    {/* Media & Links Section */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            Media & Links
                        </h3>
                        <div className="space-y-4">
                            <TextInput
                                label="Profile Image URL"
                                name="profileImage"
                                type="text"
                                value={formData.profileImage || ''}
                                onChange={(value: string) => handleFieldChange('profileImage', value)}
                                error={errors.profileImage}
                                placeholder="https://example.com/profile-image.jpg"
                                disabled={isSaving}
                            />
                            <TextInput
                                label="Team Website URL"
                                name="teamWebsiteUrl"
                                type="text"
                                value={formData.teamWebsiteUrl || ''}
                                onChange={(value: string) => handleFieldChange('teamWebsiteUrl', value)}
                                error={errors.teamWebsiteUrl}
                                placeholder="https://uclabruins.com/sports/basketball"
                                disabled={isSaving}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                        <button
                            onClick={onSave}
                            onKeyDown={handleSaveKeyDown}
                            disabled={isSaving}
                            className="min-h-[44px] w-full sm:flex-1 px-6 py-3 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700 disabled:opacity-60 transition-all touch-manipulation flex items-center justify-center gap-2"
                            type="button"
                        >
                            {isSaving && (
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                            )}
                            <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
                        </button>
                        <button
                            onClick={onCancel}
                            onKeyDown={handleCancelKeyDown}
                            disabled={isSaving}
                            className="min-h-[44px] w-full sm:w-auto px-6 py-3 bg-gray-100 rounded-lg text-gray-700 font-semibold hover:bg-gray-200 transition-all touch-manipulation disabled:opacity-60 disabled:cursor-not-allowed"
                            type="button"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});
