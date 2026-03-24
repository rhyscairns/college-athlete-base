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

export function PlayerProfileView({
    playerId,
    currentUserId,
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

    // Handler to start editing a section
    const handleSectionEdit = (sectionId: string) => {
        setEditingSection(sectionId);
    };

    // Handler to save section changes
    const handleSectionSave = async (sectionId: string, updatedData: Partial<PlayerProfile>) => {
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
                const errorData = await response.json();
                console.error('Failed to save profile:', errorData);
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
            console.error('Error saving profile:', error);
            setSuccessMessage('Failed to save changes. Please try again.');
            setShowSuccessNotification(true);
        }
    };

    // Handler to cancel editing
    const handleSectionCancel = () => {
        setEditingSection(null);
    };

    // Handler to dismiss success notification
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

            <ProfileSideNav />
            <div className="lg:ml-48">
                {/* Hero section always shows */}
                <HeroSection
                    player={playerData}
                    isOwner={isOwner}
                    isEditing={editingSection === 'hero'}
                    isAnyOtherSectionEditing={editingSection !== null && editingSection !== 'hero'}
                    onEdit={() => handleSectionEdit('hero')}
                    onSave={(updatedData) => handleSectionSave('hero', updatedData)}
                    onCancel={handleSectionCancel}
                />

                {/* Stats section - always render, let component handle empty state */}
                <StatsShowcase
                    stats={playerData.stats}
                    isOwner={isOwner}
                    isEditing={editingSection === 'stats'}
                    isAnyOtherSectionEditing={editingSection !== null && editingSection !== 'stats'}
                    onEdit={() => handleSectionEdit('stats')}
                    onSave={(updatedData) => handleSectionSave('stats', updatedData)}
                    onCancel={handleSectionCancel}
                />

                {/* Athletic Achievements - always render, let component handle empty state */}
                <AthleticAchievementsSection
                    achievements={playerData.achievements}
                    isOwner={isOwner}
                    isEditing={editingSection === 'achievements'}
                    isAnyOtherSectionEditing={editingSection !== null && editingSection !== 'achievements'}
                    onEdit={() => handleSectionEdit('achievements')}
                    onSave={(updatedData) => handleSectionSave('achievements', updatedData)}
                    onCancel={handleSectionCancel}
                />

                {/* Academic Profile - always render, let component handle empty state */}
                <AcademicProfileSection
                    academic={playerData.academic}
                    isOwner={isOwner}
                    isEditing={editingSection === 'academic'}
                    isAnyOtherSectionEditing={editingSection !== null && editingSection !== 'academic'}
                    onEdit={() => handleSectionEdit('academic')}
                    onSave={(updatedData) => handleSectionSave('academic', updatedData)}
                    onCancel={handleSectionCancel}
                />

                {/* Game Highlights - always render, let component handle empty state */}
                <GameHighlightsSection
                    videos={playerData.videos}
                    isOwner={isOwner}
                    isEditing={editingSection === 'videos'}
                    isAnyOtherSectionEditing={editingSection !== null && editingSection !== 'videos'}
                    onEdit={() => handleSectionEdit('videos')}
                    onSave={(updatedData) => handleSectionSave('videos', updatedData)}
                    onCancel={handleSectionCancel}
                />

                {/* Coaches' Perspective - always render, let component handle empty state */}
                <CoachesPerspectiveSection
                    testimonials={playerData.coachTestimonials}
                    isOwner={isOwner}
                    isEditing={editingSection === 'testimonials'}
                    isAnyOtherSectionEditing={editingSection !== null && editingSection !== 'testimonials'}
                    onEdit={() => handleSectionEdit('testimonials')}
                    onSave={(updatedData) => handleSectionSave('testimonials', updatedData)}
                    onCancel={handleSectionCancel}
                />

                {/* Recruiting Contact - always render, let component handle empty state */}
                <RecruitingContactSection
                    contact={playerData.contact}
                    isOwner={isOwner}
                    isEditing={editingSection === 'contact'}
                    isAnyOtherSectionEditing={editingSection !== null && editingSection !== 'contact'}
                    onEdit={() => handleSectionEdit('contact')}
                    onSave={(updatedData) => handleSectionSave('contact', updatedData)}
                    onCancel={handleSectionCancel}
                />
            </div>
        </div>
    );
}
