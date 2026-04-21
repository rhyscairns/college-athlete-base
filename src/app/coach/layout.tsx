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

    // Extract coachId from path like /coach/[coachId]/dashboard or /coach/[coachId]/profile
    const pathSegments = pathname.split('/').filter(Boolean);

    // All coach routes follow /coach/[coachId]/... so coachId is always the segment after 'coach'
    const coachIndex = pathSegments.indexOf('coach');
    const coachId = (coachIndex !== -1 && pathSegments[coachIndex + 1]) ? pathSegments[coachIndex + 1] : '';

    return (
        <div className="min-h-screen white" >
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
