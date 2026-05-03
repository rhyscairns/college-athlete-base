'use client';

import { useState, useEffect, useRef } from 'react';
import { MessagesTable } from '@/messages/components/MessagesTable';
import { usePlayerCache } from '../../PlayerCacheContext';
import type { Conversation } from '@/messages/types';

const MESSAGES_TTL = 2 * 60 * 1000;

function MessagesHeader() {
    return (
        <header className="relative overflow-hidden text-center px-6 pt-12 pb-10 mb-8 rounded-2xl">
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-2xl"
                style={{ background: `radial-gradient(ellipse 80% 60% at 50% -10%, oklch(68% 0.22 150 / 0.18) 0%, transparent 70%), var(--ink-1)` }}
            />
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 opacity-[0.03] rounded-2xl"
                style={{ backgroundImage: `linear-gradient(var(--text-hi) 1px, transparent 1px), linear-gradient(90deg, var(--text-hi) 1px, transparent 1px)`, backgroundSize: '48px 48px' }}
            />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-5" style={{ background: 'oklch(68% 0.22 150 / 0.15)', border: '1px solid oklch(68% 0.22 150 / 0.3)', color: 'var(--brand-500)' }}>
                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--brand-500)' }} />
                Inbox
            </div>
            <h1
                className="font-black tracking-tight leading-none mb-3"
                style={{
                    fontSize: 'clamp(2rem, 4vw + 1rem, 3rem)',
                    background: `linear-gradient(135deg, var(--text-hi) 0%, oklch(85% 0.15 150) 50%, var(--text-hi) 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}
            >
                Messages
            </h1>
            <p className="text-base" style={{ color: 'var(--text-mid)' }}>
                Your conversations with coaches
            </p>
        </header>
    );
}

function TableSkeleton() {
    return (
        <div className="rounded-xl overflow-hidden animate-pulse" style={{ border: '1px solid var(--ink-3)' }} aria-label="Loading messages" aria-busy="true">
            <div className="px-4 py-3 flex gap-6" style={{ background: 'var(--ink-2)' }}>
                {[120, 100, 90, 80, 140].map((w, i) => (
                    <div key={i} className="h-3 rounded" style={{ width: w, background: 'var(--ink-3)' }} />
                ))}
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-4 py-4 flex gap-6 items-center" style={{ borderTop: '1px solid var(--ink-2)', background: i % 2 === 0 ? 'var(--ink-1)' : 'transparent' }}>
                    {[120, 100, 90, 80, 140].map((w, j) => (
                        <div key={j} className="h-3 rounded" style={{ width: w, background: 'var(--ink-2)' }} />
                    ))}
                </div>
            ))}
            <span className="sr-only">Loading your messages...</span>
        </div>
    );
}

interface MessagesPageClientProps {
    playerId: string;
}

export function MessagesPageClient({ playerId }: MessagesPageClientProps) {
    const { readMessages, writeMessages, isMessagesStale } = usePlayerCache();

    const cached = readMessages();
    const [conversations, setConversations] = useState<Conversation[] | null>(cached?.data ?? null);
    const [isLoading, setIsLoading] = useState(!cached);
    const fetchStarted = useRef(false);

    useEffect(() => {
        if (fetchStarted.current) return;
        if (!isMessagesStale()) return;

        fetchStarted.current = true;

        const run = async () => {
            try {
                const res = await fetch(`/api/player/${playerId}/messages`);
                if (!res.ok) return;
                const json = await res.json();
                if (!json.success) return;
                writeMessages(json.data);
                setConversations(json.data);
            } finally {
                setIsLoading(false);
            }
        };

        run();
    }, [playerId, isMessagesStale, writeMessages]);

    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <MessagesHeader />
                {isLoading && !conversations ? (
                    <TableSkeleton />
                ) : (
                    <MessagesTable
                        conversations={conversations ?? []}
                        currentUserId={playerId}
                        userType="player"
                        emptyMessage="No messages yet."
                    />
                )}
            </div>
        </div>
    );
}
