import React from 'react';
import { TextInput } from '../edit/inputs/TextInput';
import { EmailInput } from '../edit/inputs/EmailInput';
import { ActionButtons } from './ActionButtons';
import type { ValidationErrors } from '../../types';

// Contact data structure for editing
export interface ContactFormData {
    email: string;
    phone: string;
    parentGuardianName?: string;
    parentGuardianPhone?: string;
    parentGuardianEmail?: string;
    socialMedia: {
        twitter?: string;
        instagram?: string;
        youtube?: string;
        tiktok?: string;
    };
    preferredContactMethod: string;
}

interface RecruitingContactSectionEditProps {
    formData: ContactFormData;
    setFormData: React.Dispatch<React.SetStateAction<ContactFormData>>;
    errors: ValidationErrors;
    isSaving: boolean;
    onSave: () => void;
    onCancel: () => void;
}

export function RecruitingContactSectionEdit({
    formData,
    setFormData,
    errors,
    isSaving,
    onSave,
    onCancel,
}: RecruitingContactSectionEditProps) {
    const handleFieldChange = (field: keyof ContactFormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSocialMediaChange = (platform: keyof ContactFormData['socialMedia'], value: string) => {
        setFormData((prev) => ({
            ...prev,
            socialMedia: {
                ...prev.socialMedia,
                [platform]: value,
            },
        }));
    };

    return (
        <div className="space-y-4 p-4 sm:p-6 bg-white/5 rounded-2xl border border-white/10 animate-fade-in">
            {/* Player Contact Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Player Contact</h3>

                <EmailInput
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={(value) => handleFieldChange('email', value)}
                    error={errors.email}
                    disabled={isSaving}
                />

                <TextInput
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(value) => handleFieldChange('phone', value)}
                    error={errors.phone}
                    placeholder="(555) 555-5555"
                    disabled={isSaving}
                />
            </div>

            {/* Parent/Guardian Contact */}
            <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white">Parent/Guardian Contact</h3>

                <TextInput
                    label="Parent/Guardian Name"
                    name="parentGuardianName"
                    value={formData.parentGuardianName || ''}
                    onChange={(value) => handleFieldChange('parentGuardianName', value)}
                    error={errors.parentGuardianName}
                    disabled={isSaving}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextInput
                        label="Parent/Guardian Phone"
                        name="parentGuardianPhone"
                        type="tel"
                        value={formData.parentGuardianPhone || ''}
                        onChange={(value) => handleFieldChange('parentGuardianPhone', value)}
                        error={errors.parentGuardianPhone}
                        placeholder="(555) 555-5555"
                        disabled={isSaving}
                    />

                    <EmailInput
                        label="Parent/Guardian Email"
                        name="parentGuardianEmail"
                        value={formData.parentGuardianEmail || ''}
                        onChange={(value) => handleFieldChange('parentGuardianEmail', value)}
                        error={errors.parentGuardianEmail}
                        disabled={isSaving}
                    />
                </div>
            </div>

            {/* Social Media Links */}
            <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white">Social Media</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextInput
                        label="Twitter/X"
                        name="twitter"
                        value={formData.socialMedia.twitter || ''}
                        onChange={(value) => handleSocialMediaChange('twitter', value)}
                        error={errors['socialMedia.twitter']}
                        placeholder="https://twitter.com/username"
                        disabled={isSaving}
                    />

                    <TextInput
                        label="Instagram"
                        name="instagram"
                        value={formData.socialMedia.instagram || ''}
                        onChange={(value) => handleSocialMediaChange('instagram', value)}
                        error={errors['socialMedia.instagram']}
                        placeholder="https://instagram.com/username"
                        disabled={isSaving}
                    />

                    <TextInput
                        label="YouTube"
                        name="youtube"
                        value={formData.socialMedia.youtube || ''}
                        onChange={(value) => handleSocialMediaChange('youtube', value)}
                        error={errors['socialMedia.youtube']}
                        placeholder="https://youtube.com/@username"
                        disabled={isSaving}
                    />

                    <TextInput
                        label="TikTok"
                        name="tiktok"
                        value={formData.socialMedia.tiktok || ''}
                        onChange={(value) => handleSocialMediaChange('tiktok', value)}
                        error={errors['socialMedia.tiktok']}
                        placeholder="https://tiktok.com/@username"
                        disabled={isSaving}
                    />
                </div>
            </div>

            {/* Preferred Contact Method */}
            <div className="pt-4 border-t border-white/10">
                <TextInput
                    label="Preferred Contact Method"
                    name="preferredContactMethod"
                    value={formData.preferredContactMethod}
                    onChange={(value) => handleFieldChange('preferredContactMethod', value)}
                    error={errors.preferredContactMethod}
                    placeholder="e.g., Email, Phone, Text"
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
