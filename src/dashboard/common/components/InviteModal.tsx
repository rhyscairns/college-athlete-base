'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    promoCode: string | null;
}

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

type Tab = 'player' | 'coach';

function QRCanvas({ url }: { url: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        QRCode.toCanvas(canvasRef.current, url, {
            width: 180,
            margin: 2,
            color: {
                dark: '#ffffff',
                light: '#00000000', // transparent background
            },
        });
    }, [url]);

    return (
        <canvas
            ref={canvasRef}
            aria-label={`QR code for ${url}`}
            className="rounded-xl"
            style={{ display: 'block' }}
        />
    );
}

export function InviteModal({ isOpen, onClose, promoCode }: InviteModalProps) {
    const [activeTab, setActiveTab] = useState<Tab>('player');
    const [copied, setCopied] = useState(false);
    const overlayRef = useRef<HTMLDivElement>(null);

    const playerUrl = promoCode
        ? `${BASE_URL}/register/player?ref=${promoCode}`
        : `${BASE_URL}/register/player`;

    const coachUrl = promoCode
        ? `${BASE_URL}/register/coach?ref=${promoCode}`
        : `${BASE_URL}/register/coach`;

    const activeUrl = activeTab === 'player' ? playerUrl : coachUrl;

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(activeUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard unavailable
        }
    }, [activeUrl]);

    // Reset copied state when tab changes
    useEffect(() => { setCopied(false); }, [activeTab]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'oklch(0% 0 0 / 0.6)' }}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-modal-title"
        >
            <div
                className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
                style={{ background: 'var(--ink-1)', border: '1px solid var(--ink-3)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2
                        id="invite-modal-title"
                        className="text-lg font-bold"
                        style={{ color: 'var(--text-hi)' }}
                    >
                        Invite someone to join
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label="Close invite modal"
                        className="p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2"
                        style={{ color: 'var(--text-lo)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--ink-3)')}
                        onMouseLeave={e => (e.currentTarget.style.background = '')}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {promoCode && (
                    <p className="text-xs mb-4" style={{ color: 'var(--text-mid)' }}>
                        Your code{' '}
                        <span className="font-mono font-semibold" style={{ color: 'var(--brand-500)' }}>
                            {promoCode}
                        </span>{' '}
                        will be pre-filled so they're linked to your account.
                    </p>
                )}

                {/* Tabs */}
                <div
                    className="flex rounded-xl p-1 mb-5"
                    style={{ background: 'var(--ink-2)' }}
                    role="tablist"
                    aria-label="Invite type"
                >
                    {(['player', 'coach'] as Tab[]).map((tab) => (
                        <button
                            key={tab}
                            role="tab"
                            aria-selected={activeTab === tab}
                            onClick={() => setActiveTab(tab)}
                            className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 capitalize"
                            style={{
                                background: activeTab === tab ? 'var(--brand-500)' : 'transparent',
                                color: activeTab === tab ? 'var(--ink-0)' : 'var(--text-lo)',
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* QR code */}
                <div className="flex justify-center mb-5">
                    <div
                        className="p-3 rounded-2xl"
                        style={{ background: 'var(--ink-2)', border: '1px solid var(--ink-3)' }}
                    >
                        <QRCanvas url={activeUrl} />
                    </div>
                </div>

                {/* Link + copy */}
                <div className="flex items-center gap-2">
                    <input
                        readOnly
                        value={activeUrl}
                        aria-label={`${activeTab === 'player' ? 'Player' : 'Coach'} registration link`}
                        className="flex-1 px-3 py-2 rounded-lg text-xs font-mono truncate focus:outline-none focus:ring-2"
                        style={{
                            background: 'var(--ink-2)',
                            border: '1px solid var(--ink-3)',
                            color: 'var(--text-mid)',
                        }}
                    />
                    <button
                        onClick={handleCopy}
                        aria-label={`Copy ${activeTab} registration link`}
                        className="shrink-0 px-3 py-2 text-xs font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2"
                        style={{
                            background: copied ? 'var(--status-success)' : 'var(--brand-500)',
                            color: 'var(--ink-0)',
                        }}
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>
        </div>
    );
}
