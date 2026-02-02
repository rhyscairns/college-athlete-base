import React from 'react';
import { TextInput, EmailInput } from '../inputs';
import { ActionButtons } from './ActionButtons';
import type { RecruitingContactSectionEditProps, Contact } from '../../../../types';



export function RecruitingContactSectionEdit({
    formData,
    setFormData,
    errors,
    isSaving,
    onSave,
    onCancel,
}: RecruitingContactSectionEditProps) {
    const handleFieldChange = (field: keyof Contact, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSocialMediaChange = (platform: keyof Contact['socialMedia'], value: string) => {
        setFormData((prev) => ({
            ...prev,
            socialMedia: {
                ...prev.socialMedia,
                [platform]: value,
            },
        }));
    };

    return (
        <div className="space-y-4 p-3 sm:p-4 bg-white/5 rounded-2xl border border-white/10 animate-fade-in">
            {/* Player Contact Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Player Contact</h3>

                <EmailInput
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={(value: string) => handleFieldChange('email', value)}
                    error={errors.email}
                    disabled={isSaving}
                />

                <TextInput
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(value: string) => handleFieldChange('phone', value)}
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
                    onChange={(value: string) => handleFieldChange('parentGuardianName', value)}
                    error={errors.parentGuardianName}
                    disabled={isSaving}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TextInput
                        label="Parent/Guardian Phone"
                        name="parentGuardianPhone"
                        type="tel"
                        value={formData.parentGuardianPhone || ''}
                        onChange={(value: string) => handleFieldChange('parentGuardianPhone', value)}
                        error={errors.parentGuardianPhone}
                        placeholder="(555) 555-5555"
                        disabled={isSaving}
                    />

                    <EmailInput
                        label="Parent/Guardian Email"
                        name="parentGuardianEmail"
                        value={formData.parentGuardianEmail || ''}
                        onChange={(value: string) => handleFieldChange('parentGuardianEmail', value)}
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
                        onChange={(value: string) => handleSocialMediaChange('twitter', value)}
                        error={errors['socialMedia.twitter']}
                        placeholder="https://twitter.com/username"
                        disabled={isSaving}
                    />

                    <TextInput
                        label="Instagram"
                        name="instagram"
                        value={formData.socialMedia.instagram || ''}
                        onChange={(value: string) => handleSocialMediaChange('instagram', value)}
                        error={errors['socialMedia.instagram']}
                        placeholder="https://instagram.com/username"
                        disabled={isSaving}
                    />

                    <TextInput
                        label="YouTube"
                        name="youtube"
                        value={formData.socialMedia.youtube || ''}
                        onChange={(value: string) => handleSocialMediaChange('youtube', value)}
                        error={errors['socialMedia.youtube']}
                        placeholder="https://youtube.com/@username"
                        disabled={isSaving}
                    />

                    <TextInput
                        label="TikTok"
                        name="tiktok"
                        value={formData.socialMedia.tiktok || ''}
                        onChange={(value: string) => handleSocialMediaChange('tiktok', value)}
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
                    value={formData.preferredContactMethod || ''}
                    onChange={(value: string) => handleFieldChange('preferredContactMethod', value)}
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
