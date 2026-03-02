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

    // Extract coachId from path like /coach/dashboard/[coachId] or /coach/[coachId]/profile
    const pathSegments = pathname.split('/').filter(Boolean);

    let coachId = '';

    // Pattern 1: /coach/dashboard/[coachId]
    const dashboardIndex = pathSegments.indexOf('dashboard');
    if (dashboardIndex !== -1 && pathSegments[dashboardIndex + 1]) {
        coachId = pathSegments[dashboardIndex + 1];
    }
    // Pattern 2: /coach/[coachId]/profile (or other routes)
    else {
        const coachIndex = pathSegments.indexOf('coach');
        if (coachIndex !== -1 && pathSegments[coachIndex + 1] && pathSegments[coachIndex + 1] !== 'dashboard') {
            coachId = pathSegments[coachIndex + 1];
        }
    }

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
