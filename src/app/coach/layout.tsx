'use client';

import { CoachNavbar } from '@/dashboard/coach/components/CoachNavbar';
import { ProgressBar } from '@/components/primitives/ProgressBar';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface CoachLayoutProps {
    children: React.ReactNode;
}

export default function CoachLayout({ children }: CoachLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const pathSegments = pathname.split('/').filter(Boolean);
    const coachIndex = pathSegments.indexOf('coach');
    const coachId = (coachIndex !== -1 && pathSegments[coachIndex + 1]) ? pathSegments[coachIndex + 1] : '';

    // ProgressBar: active during route transitions
    const [navLoading, setNavLoading] = useState(false);
    const prevPathname = useRef(pathname);

    useEffect(() => {
        if (prevPathname.current !== pathname) {
            setNavLoading(true);
            const t = setTimeout(() => setNavLoading(false), 500);
            prevPathname.current = pathname;
            return () => clearTimeout(t);
        }
    }, [pathname]);

    // Detect bfcache restores (back-button after logout) and redirect to /login
    useEffect(() => {
        const handlePageShow = async (e: PageTransitionEvent) => {
            if (!e.persisted) return;
            try {
                const res = await fetch('/api/auth/session', { method: 'GET', cache: 'no-store' });
                if (!res.ok) router.replace('/login');
            } catch {
                // Network error — leave the user where they are
            }
        };
        window.addEventListener('pageshow', handlePageShow);
        return () => window.removeEventListener('pageshow', handlePageShow);
    }, [router]);

    return (
        <div
            className="relative min-h-screen"
            style={{ background: 'var(--ink-0)' }}
        >
            <div aria-hidden="true" className="field-bg" />
            <div className="relative z-10">
                <ProgressBar active={navLoading} />
                <CoachNavbar coachId={coachId} />
                <main className="pt-16 pb-16 md:pb-0" aria-label="Coach content">
                    {children}
                </main>
            </div>
        </div>
    );
}
