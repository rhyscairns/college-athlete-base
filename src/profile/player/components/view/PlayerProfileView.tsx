'use client';

import { HeroSection } from './HeroSection';
import { StatsShowcase } from './StatsShowcase';
import { AthleticAchievementsSection } from './AthleticAchievementsSection';
import { AcademicProfileSection } from './AcademicProfileSection';
import { GameHighlightsSection } from './GameHighlightsSection';
import { CoachesPerspectiveSection } from './CoachesPerspectiveSection';
import { RecruitingContactSection } from './RecruitingContactSection';
import { ProfileSideNav } from './ProfileSideNav';
import { mockPlayerData } from '../../data/mockPlayerData';

export function PlayerProfileView() {
    const player = mockPlayerData;

    // Check if data exists for each section
    const hasStats = player.stats && Object.keys(player.stats).length > 0;
    const hasAchievements = player.achievements && player.achievements.length > 0;
    const hasAcademics = player.academic && Object.keys(player.academic).length > 0;
    const hasVideos = player.videos && player.videos.length > 0;
    const hasTestimonials = player.coachTestimonials && player.coachTestimonials.length > 0;
    const hasContact = player.contact && Object.keys(player.contact).length > 0;

    return (
        <div className="relative">
            <ProfileSideNav />
            <div className="lg:ml-20">
                {/* Hero section always shows */}
                <HeroSection player={player} />

                {/* Conditional sections with props */}
                {hasStats && <StatsShowcase stats={player.stats} />}
                {hasAchievements && <AthleticAchievementsSection achievements={player.achievements} />}
                {hasAcademics && <AcademicProfileSection academic={player.academic} />}
                {hasVideos && <GameHighlightsSection videos={player.videos} />}
                {hasTestimonials && <CoachesPerspectiveSection testimonials={player.coachTestimonials} />}
                {hasContact && <RecruitingContactSection contact={player.contact} />}
            </div>
        </div>
    );
}
