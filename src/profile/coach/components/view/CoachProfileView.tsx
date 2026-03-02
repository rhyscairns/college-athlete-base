'use client';

import { useState, useCallback } from 'react';
import { CoachHeroSection } from './CoachHeroSection';
import { CoachHeroSectionEdit } from '../edit/CoachHeroSectionEdit';
import { SuccessNotification } from '../../../player/components/view-page/SuccessNotification';
import type { CoachProfile, CoachProfileViewProps, ValidationErrors } from '../../types';
import { validateCoachProfile } from '../../utils/validation';

export function CoachProfileView({
    coachId,
    currentUserId,
    initialData,
    onDataUpdate,
}: CoachProfileViewProps) {
    // State management
    const [coachData, setCoachData] = useState<CoachProfile>(initialData);
    const [isEditing, setIsEditing] = useState(false);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [formData, setFormData] = useState<CoachProfile>(initialData);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSaving, setIsSaving] = useState(false);

    // Calculate if current user is the profile owner
    const isOwner = currentUserId === coachId;

    // Handler to enter edit mode
    const handleEdit = useCallback(() => {
        setFormData(coachData);
        setErrors({});
        setIsEditing(true);
    }, [coachData]);

    // Handler to cancel editing
    const handleCancel = useCallback(() => {
        setFormData(coachData);
        setErrors({});
        setIsEditing(false);
    }, [coachData]);

    // Handler to save changes
    const handleSave = useCallback(async () => {
        // Validate form data before API call
        const validationErrors = validateCoachProfile(formData);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSaving(true);
        setErrors({});

        // Store previous data for rollback on error
        const previousData = coachData;

        try {
            // Optimistic update - update UI immediately
            setCoachData(formData);

            // Call PUT /api/coach/[coachId]/profile endpoint
            const response = await fetch(`/api/coach/${coachId}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                // Rollback on error
                setCoachData(previousData);
                setFormData(previousData);

                if (response.status === 400 && result.validationErrors) {
                    // Handle validation errors from API
                    setErrors(result.validationErrors);
                } else {
                    // Handle other API errors
                    setErrors({
                        general: result.error || 'Failed to save changes. Please try again.',
                    });
                }
                return;
            }

            // Handle successful save
            if (result.success && result.data) {
                setCoachData(result.data);
                setFormData(result.data);
            }

            // Exit edit mode and show notification
            setIsEditing(false);
            setShowSuccessNotification(true);

            // Call optional callback for future integration
            if (onDataUpdate) {
                onDataUpdate(formData);
            }
        } catch (error) {
            // Rollback on network error
            setCoachData(previousData);
            setFormData(previousData);
            setErrors({
                general: 'Network error. Please check your connection and try again.',
            });
        } finally {
            setIsSaving(false);
        }
    }, [coachId, formData, coachData, onDataUpdate]);

    // Handler to dismiss success notification
    const handleDismissNotification = useCallback(() => {
        setShowSuccessNotification(false);
    }, []);

    return (
        <div className="relative">
            {/* Success notification */}
            {showSuccessNotification && (
                <SuccessNotification
                    message="Profile updated successfully!"
                    onDismiss={handleDismissNotification}
                />
            )}

            {/* Hero section - toggle between view and edit mode */}
            {isEditing ? (
                <CoachHeroSectionEdit
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                    isSaving={isSaving}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            ) : (
                <CoachHeroSection
                    coach={coachData}
                    isOwner={isOwner}
                    isEditing={isEditing}
                    onEdit={handleEdit}
                />
            )}
        </div>
    );
}
