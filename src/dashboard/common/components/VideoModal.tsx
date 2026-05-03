'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { VideoModalProps } from '../types';
import { getYouTubeEmbedUrl } from '../utils/youtube';
import { SpringSpinner } from '../../../components/primitives/SpringSpinner';

export function VideoModal({
    isOpen,
    onClose,
    videoUrl,
    videoTitle,
    playerName,
}: VideoModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const previousActiveElementRef = useRef<HTMLElement | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Reset loading state when modal opens
    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
        }
    }, [isOpen]);

    // Handle escape key press
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Handle body scroll lock and focus management
    useEffect(() => {
        if (!isOpen) return;

        // Store the currently focused element to return focus later
        previousActiveElementRef.current = document.activeElement as HTMLElement;

        // Lock scroll
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        // Focus close button when modal opens
        if (closeButtonRef.current) {
            closeButtonRef.current.focus();
        }

        return () => {
            // Unlock scroll
            document.body.style.overflow = originalOverflow;

            // Return focus to the element that triggered the modal
            if (previousActiveElementRef.current) {
                previousActiveElementRef.current.focus();
            }
        };
    }, [isOpen]);

    // Implement focus trap
    useEffect(() => {
        if (!isOpen || !modalRef.current) return;

        const handleTabKey = (event: KeyboardEvent) => {
            if (event.key !== 'Tab') return;

            const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            if (!focusableElements || focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            // If shift+tab on first element, focus last element
            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
            // If tab on last element, focus first element
            else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener('keydown', handleTabKey);
        return () => document.removeEventListener('keydown', handleTabKey);
    }, [isOpen]);

    // Handle backdrop click
    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    // Handle backdrop keyboard interaction (for accessibility)
    const handleBackdropKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        // Escape key is already handled by the global listener
        // This handler exists to satisfy accessibility linting
        if (event.key === 'Enter' || event.key === ' ') {
            if (event.target === event.currentTarget) {
                onClose();
            }
        }
    };

    // Handle iframe load
    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    // Handle missing video data
    if (!videoUrl || videoUrl.trim() === '') {
        // If modal is open but no video URL, treat as error
        if (isOpen) {
            // Missing or empty video URL
        }
    }

    // Get embed URL with error handling
    let embedUrl: string = '';
    let hasError = false;
    let errorMessage = 'The video URL appears to be invalid or unavailable.';

    try {
        if (!videoUrl || videoUrl.trim() === '') {
            hasError = true;
            errorMessage = 'No video URL provided.';
        } else {
            embedUrl = getYouTubeEmbedUrl(videoUrl);
        }
    } catch (error) {
        hasError = true;
        if (error instanceof Error) {
            // Provide user-friendly error message
            if (error.message.includes('Unable to extract video ID')) {
                errorMessage = 'The video URL format is not recognized. Please check the URL.';
            }
        } else {
            console.error('VideoModal: Unknown error transforming YouTube URL:', error);
        }
    }

    if (!isOpen) return null;

    const modalContent = (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
            onClick={handleBackdropClick}
            onKeyDown={handleBackdropKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby={videoTitle ? 'video-modal-title' : undefined}
        >
            <div
                ref={modalRef}
                className="relative w-full max-w-[1200px] rounded-2xl shadow-2xl overflow-hidden"
                style={{
                    maxHeight: '90vh',
                    background: 'var(--ink-1)',
                }}
            >
                {/* Close button */}
                <button
                    ref={closeButtonRef}
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-11 h-11 flex items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                    style={{
                        background: 'oklch(15% 0.015 260 / 0.7)',
                        backdropFilter: 'blur(8px)',
                    }}
                    aria-label="Close video modal"
                    type="button"
                    onMouseEnter={e => (e.currentTarget.style.background = 'oklch(15% 0.015 260 / 0.9)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'oklch(15% 0.015 260 / 0.7)')}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                        style={{ color: 'var(--text-hi)' }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Video container */}
                <div className="relative w-full bg-black" style={{ paddingBottom: '56.25%' }}>
                    {hasError ? (
                        <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ color: 'var(--text-hi)' }}
                        >
                            <div className="text-center p-8">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-16 h-16 mx-auto mb-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    aria-hidden="true"
                                    style={{ color: 'var(--status-danger)' }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-hi)' }}>
                                    Unable to load video
                                </p>
                                <p className="text-sm" style={{ color: 'var(--text-lo)' }}>
                                    {errorMessage}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {isLoading && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center"
                                    style={{ background: 'var(--ink-0)' }}
                                    data-testid="video-loading"
                                >
                                    <div className="text-center">
                                        <SpringSpinner size={10} label="Loading video…" />
                                        <p className="text-xs mt-3" style={{ color: 'var(--text-lo)' }}>
                                            Loading video...
                                        </p>
                                    </div>
                                </div>
                            )}
                            <iframe
                                src={embedUrl}
                                title={videoTitle || 'Player highlight video'}
                                className="absolute top-0 left-0 w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                onLoad={handleIframeLoad}
                            />
                        </>
                    )}
                </div>

                {/* Video info */}
                {(videoTitle || playerName) && (
                    <div className="px-6 py-4" style={{ background: 'var(--ink-1)' }}>
                        {videoTitle && (
                            <h2
                                id="video-modal-title"
                                className="text-base font-semibold mb-0.5"
                                style={{ color: 'var(--text-hi)' }}
                            >
                                {videoTitle}
                            </h2>
                        )}
                        {playerName && (
                            <p className="text-sm" style={{ color: 'var(--text-lo)' }}>
                                {playerName}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    // Use portal to render at body level
    return createPortal(modalContent, document.body);
}
