'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RoleSelector } from '../components/RoleSelector';
import { SplitScreenLayout } from '../components/SplitScreenLayout';
import type { UserRole } from '../types';

export function RegisterPage() {
    const router = useRouter();

    const handleSelectRole = (role: UserRole) => {
        router.push(`/register/${role}`);
    };

    return (
        <SplitScreenLayout
            showBackButton
            backHref="/"
            heroImage="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070"
            heroTitle="Your future starts on the field."
            heroSubtitle="Connect with over 2,500 college coaches and showcase your talent on the nation's premier recruitment platform."
            testimonial={{
                quote: "Found my dream scholarship in 3 weeks!",
                author: "Marcus T.",
                role: "D1 Commit",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
            }}
            sportTags={['Football', 'Basketball', 'Track & Field']}
        >
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
                    <p className="text-gray-600">
                        Welcome to College Athlete Base — let's build your recruitment profile.
                    </p>
                </div>

                <RoleSelector onSelectRole={handleSelectRole} />

                <div className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                        Sign in
                    </Link>
                </div>
            </div>
        </SplitScreenLayout>
    );
}
