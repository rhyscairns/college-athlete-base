import React, { useEffect, useState } from 'react';

interface SuccessNotificationProps {
    message: string;
    onDismiss: () => void;
    duration?: number;
}

export function SuccessNotification({
    message,
    onDismiss,
    duration = 3000,
}: SuccessNotificationProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        // Start fade-out animation before dismissing
        const fadeOutTimer = setTimeout(() => {
            setIsFadingOut(true);
        }, duration - 300); // Start fade-out 300ms before dismiss

        // Dismiss after duration
        const dismissTimer = setTimeout(() => {
            setIsVisible(false);
            onDismiss();
        }, duration);

        return () => {
            clearTimeout(fadeOutTimer);
            clearTimeout(dismissTimer);
        };
    }, [duration, onDismiss]);

    if (!isVisible) {
        return null;
    }

    return (
        <div
            className={`fixed top-4 right-4 px-6 py-3 bg-emerald-500 text-white rounded-lg shadow-lg transition-all duration-300 z-50 ${isFadingOut ? 'opacity-0 translate-x-2' : 'opacity-100 translate-x-0 animate-fade-in'
                }`}
            role="alert"
            aria-live="polite"
        >
            <div className="flex items-center gap-2">
                <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                    />
                </svg>
                <span className="font-medium">{message}</span>
            </div>
        </div>
    );
}
