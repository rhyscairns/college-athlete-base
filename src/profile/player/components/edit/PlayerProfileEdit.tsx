'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PlayerProfileProps, PlayerProfileFormData, ProfileValidationErrors } from '../../types';
import { BasicInformationSection } from './sections/BasicInformationSection';
import { PhysicalAttributesSection } from './sections/PhysicalAttributesSection';
import { AcademicInformationSection } from './sections/AcademicInformationSection';
import { AthleticInformationSection } from './sections/AthleticInformationSection';
import { StatsSection } from './sections/StatsSection';
import { RecruitmentSection } from './sections/RecruitmentSection';
import { ContactInformationSection } from './sections/ContactInformationSection';
import { VideosSection } from './sections/VideosSection';
import { SocialMediaSection } from './sections/SocialMediaSection';
import { SubmitButton } from './inputs';
import { validateField, validateVideos, validateSocialMedia } from '../../utils/validation';

export default function PlayerProfileEdit({ playerId, playerData }: PlayerProfileProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [errors, setErrors] = useState<ProfileValidationErrors>({});

    // Initialize form data from player data - always in edit mode
    const [formData, setFormData] = useState<PlayerProfileFormData>({
        firstName: playerData.firstName,
        lastName: playerData.lastName,
        email: playerData.email,
        sex: playerData.sex,
        sport: playerData.sport,
        position: playerData.position,
        gpa: playerData.gpa.toString(),
        country: playerData.country,
        state: playerData.state,
        region: playerData.region,
        scholarshipAmount: playerData.scholarshipAmount?.toString(),
        testScores: playerData.testScores,
        height: playerData.height,
        weight: playerData.weight,
        clubTeam: playerData.clubTeam,
        highSchool: playerData.highSchool,
        stats: playerData.stats,
        graduationYear: playerData.graduationYear?.toString(),
        major: playerData.major,
        intendedMajor: playerData.intendedMajor,
        classRank: playerData.classRank,
        honors: playerData.honors || [],
        previousTeams: playerData.previousTeams || [],
        championships: playerData.championships || [],
        allStarSelections: playerData.allStarSelections || [],
        availableDate: playerData.availableDate,
        preferredRegions: playerData.preferredRegions || [],
        scholarshipNeeds: playerData.scholarshipNeeds,
        recruitmentStatus: playerData.recruitmentStatus,
        phone: playerData.phone,
        parentGuardianName: playerData.parentGuardianName,
        parentGuardianPhone: playerData.parentGuardianPhone,
        parentGuardianEmail: playerData.parentGuardianEmail,
        coachReferences: playerData.coachReferences || [],
        videos: playerData.videos || [],
        socialMedia: playerData.socialMedia,
    });

    /**
     * Handles field blur event for field-level validation
     */
    const handleBlur = (field: string, value: string | undefined | null) => {
        const error = validateField(field, value);

        setErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            if (error) {
                newErrors[field] = error;
            } else {
                delete newErrors[field];
            }
            return newErrors;
        });
    };

    /**
     * Validates the entire form
     * Returns true if valid, false otherwise
     */
    const validateForm = (): boolean => {
        const newErrors: ProfileValidationErrors = {};

        // Validate required fields
        const requiredFields: Array<keyof PlayerProfileFormData> = [
            'firstName',
            'lastName',
            'email',
            'sex',
            'sport',
            'position',
            'gpa',
            'country',
        ];

        requiredFields.forEach((field) => {
            const value = formData[field];
            const error = validateField(field, value as string);
            if (error) {
                newErrors[field] = error;
            }
        });

        // Validate optional fields that have values
        if (formData.phone) {
            const error = validateField('phone', formData.phone);
            if (error) {
                newErrors.phone = error;
            }
        }

        if (formData.parentGuardianEmail) {
            const error = validateField('parentGuardianEmail', formData.parentGuardianEmail);
            if (error) {
                newErrors.parentGuardianEmail = error;
            }
        }

        if (formData.parentGuardianPhone) {
            const error = validateField('parentGuardianPhone', formData.parentGuardianPhone);
            if (error) {
                newErrors.parentGuardianPhone = error;
            }
        }

        // Validate videos
        const videoErrors = validateVideos(formData.videos);
        Object.assign(newErrors, videoErrors);

        // Validate social media
        const socialMediaErrors = validateSocialMedia(formData.socialMedia);
        Object.assign(newErrors, socialMediaErrors);

        setErrors(newErrors);

        // Return true if no errors
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        // Validate form before saving
        if (!validateForm()) {
            setSaveMessage('Please fix the errors before saving.');
            setTimeout(() => setSaveMessage(null), 3000);

            // Focus the first error field
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField) {
                const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
                if (element) {
                    element.focus();
                }
            }
            return;
        }

        setIsSaving(true);
        setSaveMessage(null);

        try {
            const response = await fetch(`/api/player/profile/${playerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to save profile');
            }

            setSaveMessage('Profile saved successfully!');
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (error) {
            setSaveMessage('Error saving profile. Please try again.');
            console.error('Save error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        // Navigate to player dashboard without saving changes
        router.push(`/player/${playerId}/dashboard`);
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-8 sm:p-12 bg-white/90 rounded-3xl shadow-2xl border border-white/50 max-h-[85vh] overflow-y-auto mt-6">
            {/* Save Message */}
            {saveMessage && (
                <div
                    className={`mb-6 p-4 rounded-xl ${saveMessage.includes('Error')
                        ? 'bg-red-100 text-red-700 border-2 border-red-400'
                        : 'bg-green-100 text-green-700 border-2 border-green-400'
                        }`}
                >
                    {saveMessage}
                </div>
            )}

            {/* Profile Sections - Always in edit mode */}
            <div className="space-y-8">
                <BasicInformationSection
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    handleBlur={handleBlur}
                    isEditing={true}
                />

                <PhysicalAttributesSection
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    handleBlur={handleBlur}
                    isEditing={true}
                />

                <AcademicInformationSection
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    handleBlur={handleBlur}
                    isEditing={true}
                />

                <AthleticInformationSection
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    handleBlur={handleBlur}
                    isEditing={true}
                />

                <StatsSection
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    handleBlur={handleBlur}
                    isEditing={true}
                />

                <RecruitmentSection
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    handleBlur={handleBlur}
                    isEditing={true}
                />

                <ContactInformationSection
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    handleBlur={handleBlur}
                    isEditing={true}
                />

                <VideosSection
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    handleBlur={handleBlur}
                    isEditing={true}
                />

                <SocialMediaSection
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    handleBlur={handleBlur}
                    isEditing={true}
                />
            </div>

            <div className="mt-8 space-y-4">
                <SubmitButton
                    onClick={handleSave}
                    loading={isSaving}
                    disabled={isSaving}
                >
                    Save Profile
                </SubmitButton>

                <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="w-full h-12 text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
