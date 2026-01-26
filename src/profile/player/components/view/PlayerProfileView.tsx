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
import { mockPlayerData, type MockPlayerData } from '../../data/mockPlayerData';
import type { PlayerProfileViewProps } from '../../types';

export function PlayerProfileView({
    playerId,
    currentUserId,
    initialData = mockPlayerData,
    onDataUpdate,
}: PlayerProfileViewProps) {
    // State management for editing
    const [playerData, setPlayerData] = useState<MockPlayerData>(initialData);
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
    const handleSectionSave = (sectionId: string, updatedData: Partial<MockPlayerData>) => {
        setPlayerData((prev) => ({ ...prev, ...updatedData }));
        setEditingSection(null);

        // Show success notification
        setSuccessMessage('Changes saved successfully!');
        setShowSuccessNotification(true);

        // Call optional callback for future API integration
        if (onDataUpdate) {
            onDataUpdate(updatedData);
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

    // Check if data exists for each section
    const hasStats = playerData.stats && Object.keys(playerData.stats).length > 0;
    const hasAchievements = playerData.achievements && playerData.achievements.length > 0;
    const hasAcademics = playerData.academic && Object.keys(playerData.academic).length > 0;
    const hasVideos = playerData.videos && playerData.videos.length > 0;
    const hasTestimonials = playerData.coachTestimonials && playerData.coachTestimonials.length > 0;
    const hasContact = playerData.contact && Object.keys(playerData.contact).length > 0;

    return (
        <div className="relative">
            {/* Success notification */}
            {showSuccessNotification && (
                <SuccessNotification
                    message={successMessage}
                    onDismiss={handleDismissNotification}
                />
            )}

            <ProfileSideNav />
            <div className="lg:ml-20">
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

                {/* Conditional sections with props */}
                {hasStats && (
                    <StatsShowcase
                        stats={playerData.stats}
                        isOwner={isOwner}
                        isEditing={editingSection === 'stats'}
                        isAnyOtherSectionEditing={editingSection !== null && editingSection !== 'stats'}
                        onEdit={() => handleSectionEdit('stats')}
                        onSave={(updatedData) => handleSectionSave('stats', updatedData)}
                        onCancel={handleSectionCancel}
                    />
                )}
                {hasAchievements && (
                    <AthleticAchievementsSection
                        achievements={playerData.achievements}
                        isOwner={isOwner}
                        isEditing={editingSection === 'achievements'}
                        isAnyOtherSectionEditing={editingSection !== null && editingSection !== 'achievements'}
                        onEdit={() => handleSectionEdit('achievements')}
                        onSave={(updatedData) => handleSectionSave('achievements', updatedData)}
                        onCancel={handleSectionCancel}
                    />
                )}
                {hasAcademics && (
                    <AcademicProfileSection
                        academic={playerData.academic}
                        isOwner={isOwner}
                        isEditing={editingSection === 'academic'}
                        isAnyOtherSectionEditing={editingSection !== null && editingSection !== 'academic'}
                        onEdit={() => handleSectionEdit('academic')}
                        onSave={(updatedData) => handleSectionSave('academic', updatedData)}
                        onCancel={handleSectionCancel}
                    />
                )}
                {hasVideos && (
                    <GameHighlightsSection
                        videos={playerData.videos}
                        isOwner={isOwner}
                        isEditing={editingSection === 'videos'}
                        isAnyOtherSectionEditing={editingSection !== null && editingSection !== 'videos'}
                        onEdit={() => handleSectionEdit('videos')}
                        onSave={(updatedData) => handleSectionSave('videos', updatedData)}
                        onCancel={handleSectionCancel}
                    />
                )}
                {hasTestimonials && (
                    <CoachesPerspectiveSection
                        testimonials={playerData.coachTestimonials}
                        isOwner={isOwner}
                        isEditing={editingSection === 'testimonials'}
                        isAnyOtherSectionEditing={editingSection !== null && editingSection !== 'testimonials'}
                        onEdit={() => handleSectionEdit('testimonials')}
                        onSave={(updatedData) => handleSectionSave('testimonials', updatedData)}
                        onCancel={handleSectionCancel}
                    />
                )}
                {hasContact && (
                    <RecruitingContactSection
                        contact={playerData.contact}
                        isOwner={isOwner}
                        isEditing={editingSection === 'contact'}
                        isAnyOtherSectionEditing={editingSection !== null && editingSection !== 'contact'}
                        onEdit={() => handleSectionEdit('contact')}
                        onSave={(updatedData) => handleSectionSave('contact', updatedData)}
                        onCancel={handleSectionCancel}
                    />
                )}
            </div>
        </div>
    );
}
