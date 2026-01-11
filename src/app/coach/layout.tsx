'use client';

import { CoachNavbar } from '@/dashboard/coach/components/CoachNavbar';
import { usePathname } from 'next/navigation';

interface CoachLayoutProps {
    children: React.ReactNode;
}

/**
 * Coach Layout Component
 * Wraps all coach pages with consistent navigation and background styling
 * Applies background image and renders CoachNavbar at the top
 */
export default function CoachLayout({ children }: CoachLayoutProps) {
    // Extract coachId from the URL path using client-side hook
    const pathname = usePathname();

    // Extract coachId from path like /coach/dashboard/[coachId]
    const pathSegments = pathname.split('/').filter(Boolean);
    const coachIdIndex = pathSegments.indexOf('dashboard') + 1;
    const coachId = pathSegments[coachIdIndex] || '';

    return (
        <div
            className="min-h-screen bg-gray-900"
            style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
            }}
        >
            {/* Semi-transparent overlay for content readability */}
            <div className="min-h-screen bg-black/20">
                {/* Navigation Bar */}
                <CoachNavbar coachId={coachId} />

                {/* Content Area */}
                <main>
                    {children}
                </main>
            </div>
        </div>
    );
}
