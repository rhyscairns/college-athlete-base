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
    // Debounce timer ref
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    // Debounced field change handler
    const handleFieldChange = useCallback((field: keyof CoachProfile, value: string) => {
        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Update form data immediately for responsive UI
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Debounce validation (validation happens in parent on save)
        // This prevents excessive re-renders during typing
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

            {/* Email */}
            <EmailInput
                value={formData.email}
                onChange={(value: string) => handleFieldChange('email', value)}
                error={errors.email}
                disabled={isSaving}
            />

            {/* Phone */}
            <TextInput
                label="Phone"
                name="phone"
                type="text"
                value={formData.phone || ''}
                onChange={(value: string) => handleFieldChange('phone', value)}
                error={errors.phone}
                placeholder="e.g., +1-555-0123"
                disabled={isSaving}
            />

            {/* University and Position */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                    label="University"
                    name="university"
                    value={formData.university || ''}
                    onChange={(value: string) => handleFieldChange('university', value)}
                    error={errors.university}
                    placeholder="e.g., State University"
                    disabled={isSaving}
                />
                <TextInput
                    label="Position"
                    name="position"
                    value={formData.position || ''}
                    onChange={(value: string) => handleFieldChange('position', value)}
                    error={errors.position}
                    placeholder="e.g., Head Coach"
                    disabled={isSaving}
                />
            </div>

            {/* Sport */}
            <TextInput
                label="Sport"
                name="sport"
                value={formData.sport || ''}
                onChange={(value: string) => handleFieldChange('sport', value)}
                error={errors.sport}
                placeholder="e.g., Basketball, Football, Soccer"
                disabled={isSaving}
            />

            {/* Profile Image URL */}
            <TextInput
                label="Profile Image URL"
                name="profileImage"
                type="text"
                value={formData.profileImage || ''}
                onChange={(value: string) => handleFieldChange('profileImage', value)}
                error={errors.profileImage}
                placeholder="https://example.com/image.jpg"
                disabled={isSaving}
            />

            {/* Team Website URL */}
            <TextInput
                label="Team Website URL"
                name="teamWebsiteUrl"
                type="text"
                value={formData.teamWebsiteUrl || ''}
                onChange={(value: string) => handleFieldChange('teamWebsiteUrl', value)}
                error={errors.teamWebsiteUrl}
                placeholder="https://university.edu/basketball"
                disabled={isSaving}
            />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                    onClick={onSave}
                    onKeyDown={handleSaveKeyDown}
                    disabled={isSaving}
                    className="min-h-[44px] w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white font-semibold hover:shadow-lg disabled:opacity-60 transition-all touch-manipulation flex items-center justify-center gap-2"
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
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                    onClick={onCancel}
                    onKeyDown={handleCancelKeyDown}
                    disabled={isSaving}
                    className="min-h-[44px] w-full sm:w-auto px-6 py-3 bg-white/5 border border-white/10 rounded-lg text-white/70 font-semibold hover:bg-white/10 hover:text-white transition-all touch-manipulation disabled:opacity-60 disabled:cursor-not-allowed"
                    type="button"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
});
