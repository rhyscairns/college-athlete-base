'use client';

import { TextInput } from '../inputs';
import type { SocialMediaSectionProps } from '../../types';

export function SocialMediaSection({ formData, setFormData, errors, handleBlur, isEditing }: SocialMediaSectionProps) {
    const handleSocialMediaChange = (platform: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            socialMedia: {
                ...prev.socialMedia,
                [platform]: value,
            },
        }));
    };

    const onBlur = (platform: string) => {
        if (handleBlur) {
            const value = formData.socialMedia?.[platform as keyof typeof formData.socialMedia];
            handleBlur(`socialMedia_${platform}`, value);
        }
    };

    if (!isEditing) {
        return (
            <div className="pb-8">
                <hr className="border-t-2 border-gray-300 my-6 mt-6" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Social Media</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                        <p className="text-gray-900">{formData.socialMedia?.instagram || 'Not provided'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Twitter / X</label>
                        <p className="text-gray-900">{formData.socialMedia?.twitter || 'Not provided'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                        <p className="text-gray-900">{formData.socialMedia?.facebook || 'Not provided'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">TikTok</label>
                        <p className="text-gray-900">{formData.socialMedia?.tiktok || 'Not provided'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                        <p className="text-gray-900">{formData.socialMedia?.linkedin || 'Not provided'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
                        <p className="text-gray-900">{formData.socialMedia?.youtube || 'Not provided'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <hr className="border-t-2 border-gray-300 my-6 mt-6" />
            <TextInput
                label="Instagram"
                name="instagram"
                type="text"
                value={formData.socialMedia?.instagram || ''}
                onChange={(value) => handleSocialMediaChange('instagram', value)}
                onBlur={() => onBlur('instagram')}
                error={errors?.socialMedia_instagram}
                placeholder="Optional"
            />
            <TextInput
                label="Twitter / X"
                name="twitter"
                type="text"
                value={formData.socialMedia?.twitter || ''}
                onChange={(value) => handleSocialMediaChange('twitter', value)}
                onBlur={() => onBlur('twitter')}
                error={errors?.socialMedia_twitter}
                placeholder="Optional"
            />
            <TextInput
                label="Facebook"
                name="facebook"
                type="text"
                value={formData.socialMedia?.facebook || ''}
                onChange={(value) => handleSocialMediaChange('facebook', value)}
                onBlur={() => onBlur('facebook')}
                error={errors?.socialMedia_facebook}
                placeholder="Optional"
            />
            <TextInput
                label="TikTok"
                name="tiktok"
                type="text"
                value={formData.socialMedia?.tiktok || ''}
                onChange={(value) => handleSocialMediaChange('tiktok', value)}
                onBlur={() => onBlur('tiktok')}
                error={errors?.socialMedia_tiktok}
                placeholder="Optional"
            />
            <TextInput
                label="LinkedIn"
                name="linkedin"
                type="text"
                value={formData.socialMedia?.linkedin || ''}
                onChange={(value) => handleSocialMediaChange('linkedin', value)}
                onBlur={() => onBlur('linkedin')}
                error={errors?.socialMedia_linkedin}
                placeholder="Optional"
            />
            <TextInput
                label="YouTube"
                name="youtube"
                type="text"
                value={formData.socialMedia?.youtube || ''}
                onChange={(value) => handleSocialMediaChange('youtube', value)}
                onBlur={() => onBlur('youtube')}
                error={errors?.socialMedia_youtube}
                placeholder="Optional"
            />
        </div>
    );
}
