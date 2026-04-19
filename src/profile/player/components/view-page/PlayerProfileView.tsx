'use client';

import { useState } from 'react';
import { HeroSection } from './HeroSection';
import { StatsShowcase } from './StatsShowcase';
import { AthleticAchievementsSection } from './AthleticAchievementsSection';
import { AcademicProfileSection } from './AcademicProfileSection';
import { GameHighlightsSection } from './GameHighlightsSection';
import { CoachesPerspectiveSection } from './CoachesPerspectiveSection';
import { RecruitingContactSection } from './RecruitingContactSection';
import { ProfileSideNav } from './ProfileSideNav';
import { SuccessNotification } from './SuccessNotification';
import type { PlayerProfile, PlayerProfileViewProps } from '../../types';

/**
 * PlayerProfileView Component
 * 
 * Main container component for displaying and editing player profiles.
 * Manages section editing state, API calls for saving changes, and conditional
 * rendering based on user type (coach vs player) and ownership.
 * 
 * Features:
 * - Section-based editing with single-section-at-a-time constraint
 * - Optimistic UI updates with API persistence
 * - Success/error notifications for save operations
 * - Conditional section visibility based on user type and data availability
 * - Side navigation for quick section access
 * 
 * User Type Behavior:
 * - Owner (player viewing own profile): Can edit all sections, sees all sections
 * - Coach viewing player: Read-only access to all sections with data
 * - Player viewing other player: Limited view (hero and videos only)
 * 
 * @param props - Component props
 * @param props.playerId - ID of the player whose profile is being viewed
 * @param props.currentUserId - ID of the currently logged-in user
 * @param props.userType - Type of current user ('coach' or 'player')
 * @param props.initialData - Initial player profile data from server
 * @param props.onDataUpdate - Optional callback when profile data is updated
 * @returns Player profile view with editable sections
 * 
 * @example
 * ```tsx
 * // Coach viewing player profile
 * <PlayerProfileView
 *   playerId="player-123"
 *   currentUserId="coach-456"
 *   userType="coach"
 *   initialData={playerData}
 * />
 * 
 * // Player viewing own profile
 * <PlayerProfileView
 *   playerId="player-123"
 *   currentUserId="player-123"
 *   userType="player"
 *   initialData={playerData}
 *   onDataUpdate={(data) => console.log('Profile updated', data)}
 * />
 * ```
 */
export function PlayerProfileView({
    playerId,
    currentUserId,
    userType = 'player',
    initialData,
    onDataUpdate,
}: PlayerProfileViewProps) {
    // State management for editing
    const [playerData, setPlayerData] = useState<PlayerProfile>(initialData);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Calculate if current user is the profile owner
    const isOwner = currentUserId === playerId;

    // Determine what sections to show based on user type
    const isCoach = userType === 'coach';

    /**
     * Initiates edit mode for a specific section
     * Only one section can be edited at a time
     * 
     * @param sectionId - Identifier of the section to edit (e.g., 'hero', 'stats')
     */
    const handleSectionEdit = (sectionId: string) => {
        setEditingSection(sectionId);
    };

    /**
     * Saves changes to a profile section via API
     * Updates local state on success and shows notification
     * Handles errors gracefully with user feedback
     * 
     * @param updatedData - Partial player profile data to save
     */
    const handleSectionSave = async (updatedData: Partial<PlayerProfile>) => {
        try {
            // Call API to save changes
            const response = await fetch(`/api/player/${playerId}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                await response.json().catch(() => ({})); // Consume response body
                // Show error notification
                setSuccessMessage('Failed to save changes. Please try again.');
                setShowSuccessNotification(true);
                return;
            }

            // Update local state on success
            setPlayerData((prev) => ({ ...prev, ...updatedData }));
            setEditingSection(null);

            // Show success notification
            setSuccessMessage('Changes saved successfully!');
            setShowSuccessNotification(true);

            // Call optional callback for future integration
            if (onDataUpdate) {
                onDataUpdate(updatedData);
            }
        } catch (error) {
            setSuccessMessage('Failed to save changes. Please try again.');
            setShowSuccessNotification(true);
        }
    };

    /**
     * Cancels editing mode and reverts to view mode
     * Does not save any pending changes
     */
    const handleSectionCancel = () => {
        setEditingSection(null);
    };

    /**
     * Dismisses the success/error notification
     */
    const handleDismissNotification = () => {
        setShowSuccessNotification(false);
    };

    return (
        <div className="relative bg-slate-100 min-h-screen">
            {/* Success notification */}
            {showSuccessNotification && (
                <SuccessNotification
                    message={successMessage}
                    onDismiss={handleDismissNotification}
                />
            )}

            {/* Screen reader announcement for save operations */}
            <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            >
                {showSuccessNotification && successMessage}
            </div>

            <ProfileSideNav />
            <div className="lg:ml-48">
                {/* Hero section always shows */}
                <HeroSection
                    player={playerData}
                    isOwner={isOwner}
                    isEditing={editingSection === 'hero'}
                    isAnyOtherSectionEditing={editingSection !== null && editingSection !== 'hero'}
                    onEdit={() => handleSectionEdit('hero')}
                    onSave={(updatedData) => handleSectionSave(updatedData)}
                    onCancel={handleSectionCancel}
                />

                {/* Stats section - always render for coaches and owners, let component handle empty state */}
                {(isCoach || isOwner) && (
                    <StatsShowcase
                        stats={playerData.stats}
                        isOwner={isOwner}
                        isEditing={editingSection === 'stats'}
                        isAnyOtherSectionEditing={editingSection !== null && editingSection !== 'stats'}
                        onEdit={() => handleSectionEdit('stats')}
                        onSave={(updatedData) => handleSectionSave(updatedData)}
                        onCancel={handleSectionCancel}
                    />
                )}

                {/* Athletic Achievements - always render for coaches and owners, let component handle empty state */}
                {(isCoach || isOwner) && (
                    <AthleticAchievementsSection
                        achievements={playerData.achievements}
                        isOwner={isOwner}
                        isEditing={editingSection === 'achievements'}
                        isAnyOtherSectionEditing={editingSection !== null && editingSection !== 'achievements'}
                        onEdit={() => handleSectionEdit('achievements')}
                        onSave={(updatedData) => handleSectionSave(updatedData)}
                        onCancel={handleSectionCancel}
                    />
                )}

                {/* Academic Profile - always render for coaches and owners, let component handle empty state */}
                {(isCoach || isOwner) && (
                    <AcademicProfileSection
                        academic={playerData.academic}
                        isOwner={isOwner}
                        isEditing={editingSection === 'academic'}
                        isAnyOtherSectionEditing={editingSection !== null && editingSection !== 'academic'}
                        onEdit={() => handleSectionEdit('academic')}
                        onSave={(updatedData) => handleSectionSave(updatedData)}
                        onCancel={handleSectionCancel}
                    />
                )}

                {/* Game Highlights - show if has videos OR if owner */}
                {((playerData.videos && playerData.videos.length > 0) || isOwner) && (
                    <GameHighlightsSection
                        videos={playerData.videos}
                        isOwner={isOwner}
                        isEditing={editingSection === 'videos'}
                        isAnyOtherSectionEditing={editingSection !== null && editingSection !== 'videos'}
                        onEdit={() => handleSectionEdit('videos')}
                        onSave={(updatedData) => handleSectionSave(updatedData)}
                        onCancel={handleSectionCancel}
                    />
                )}

                {/* Coaches' Perspective - always render for coaches and owners, let component handle empty state */}
                {(isCoach || isOwner) && (
                    <CoachesPerspectiveSection
                        testimonials={playerData.coachTestimonials}
                        isOwner={isOwner}
                        isEditing={editingSection === 'testimonials'}
                        isAnyOtherSectionEditing={editingSection !== null && editingSection !== 'testimonials'}
                        onEdit={() => handleSectionEdit('testimonials')}
                        onSave={(updatedData) => handleSectionSave(updatedData)}
                        onCancel={handleSectionCancel}
                    />
                )}

                {/* Recruiting Contact - show if has contact data OR if owner */}
                {(isCoach || isOwner) && (
                    <RecruitingContactSection
                        contact={playerData.contact}
                        isOwner={isOwner}
                        isEditing={editingSection === 'contact'}
                        isAnyOtherSectionEditing={editingSection !== null && editingSection !== 'contact'}
                        onEdit={() => handleSectionEdit('contact')}
                        onSave={(updatedData) => handleSectionSave(updatedData)}
                        onCancel={handleSectionCancel}
                    />
                )}
            </div>
        </div>
    );
}
