'use client';

import { useState, useEffect, useRef } from 'react';
import { PlayerProfileView } from '@/profile/player/components/view-page/PlayerProfileView';
import { usePlayerCache } from '../../PlayerCacheContext';
import type { PlayerProfile } from '@/profile/player/types';

const PROFILE_TTL = 5 * 60 * 1000;

function ProfileSkeleton() {
    return (
        <div className="relative min-h-screen animate-pulse">
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
                <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}>
                    <div className="h-48" style={{ background: 'var(--ink-2)' }} />
                    <div className="p-8 space-y-3">
                        <div className="h-8 w-56 rounded-lg" style={{ background: 'var(--ink-2)' }} />
                        <div className="h-4 w-40 rounded" style={{ background: 'var(--ink-3)' }} />
                        <div className="h-4 w-72 rounded" style={{ background: 'var(--ink-3)' }} />
                    </div>
                </div>
                <div className="h-40 rounded-2xl" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }} />
                <div className="h-40 rounded-2xl" style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }} />
            </div>
        </div>
    );
}

interface ProfilePageClientProps {
    playerId: string;
    currentUserId: string;
}

export function ProfilePageClient({ playerId, currentUserId }: ProfilePageClientProps) {
    const { readProfile, writeProfile, isProfileStale } = usePlayerCache();

    const cached = readProfile();
    const [profileData, setProfileData] = useState<PlayerProfile | null>(cached?.data ?? null);
    // Only block render if we have nothing to show
    const [isLoading, setIsLoading] = useState(!cached);
    const fetchStarted = useRef(false);

    useEffect(() => {
        if (fetchStarted.current) return;
        if (!isProfileStale()) return; // fresh cache — nothing to do

        fetchStarted.current = true;

        const run = async () => {
            try {
                const res = await fetch(`/api/player/${playerId}/profile`);
                if (!res.ok) return;
                const json = await res.json();
                if (!json.success || !json.data) return;
                writeProfile(json.data);
                setProfileData(json.data);
            } finally {
                setIsLoading(false);
            }
        };

        run();
    }, [playerId, isProfileStale, writeProfile]);

    const handleDataUpdate = (updatedData: Partial<PlayerProfile>) => {
        setProfileData(prev => {
            if (!prev) return prev;
            const merged = { ...prev, ...updatedData };
            writeProfile(merged);
            return merged;
        });
    };

    if (isLoading || !profileData) return <ProfileSkeleton />;

    return (
        <PlayerProfileView
            playerId={playerId}
            currentUserId={currentUserId}
            initialData={profileData}
            onDataUpdate={handleDataUpdate}
        />
    );
}
