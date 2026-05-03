'use client';

import React, { createContext, useContext, useRef, useCallback } from 'react';
import type { PlayerProfile } from '@/profile/player/types';
import type { Conversation } from '@/messages/types';

const PROFILE_TTL = 5 * 60 * 1000; // 5 minutes
const MESSAGES_TTL = 2 * 60 * 1000; // 2 minutes

export interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

interface PlayerCacheContextValue {
    readProfile: () => CacheEntry<PlayerProfile> | null;
    readMessages: () => CacheEntry<Conversation[]> | null;
    writeProfile: (data: PlayerProfile) => void;
    writeMessages: (data: Conversation[]) => void;
    isProfileStale: () => boolean;
    isMessagesStale: () => boolean;
}

const PlayerCacheContext = createContext<PlayerCacheContextValue | null>(null);

export function PlayerCacheProvider({ children }: { children: React.ReactNode }) {
    const profileRef = useRef<CacheEntry<PlayerProfile> | null>(null);
    const messagesRef = useRef<CacheEntry<Conversation[]> | null>(null);

    const readProfile = useCallback(() => profileRef.current, []);
    const readMessages = useCallback(() => messagesRef.current, []);

    const writeProfile = useCallback((data: PlayerProfile) => {
        profileRef.current = { data, timestamp: Date.now() };
    }, []);

    const writeMessages = useCallback((data: Conversation[]) => {
        messagesRef.current = { data, timestamp: Date.now() };
    }, []);

    const isProfileStale = useCallback(() => {
        const entry = profileRef.current;
        return !entry || Date.now() - entry.timestamp > PROFILE_TTL;
    }, []);

    const isMessagesStale = useCallback(() => {
        const entry = messagesRef.current;
        return !entry || Date.now() - entry.timestamp > MESSAGES_TTL;
    }, []);

    return (
        <PlayerCacheContext.Provider value={{ readProfile, readMessages, writeProfile, writeMessages, isProfileStale, isMessagesStale }}>
            {children}
        </PlayerCacheContext.Provider>
    );
}

export function usePlayerCache() {
    const ctx = useContext(PlayerCacheContext);
    if (!ctx) throw new Error('usePlayerCache must be used within PlayerCacheProvider');
    return ctx;
}
