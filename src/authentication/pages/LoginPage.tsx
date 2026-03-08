'use client';

import Link from 'next/link';
import { LoginForm } from '../components/LoginForm';
import { SplitScreenLayout } from '../components/SplitScreenLayout';
import type { LoginPageProps } from '../types';

export function LoginPage({ onSuccess, redirectTo }: LoginPageProps) {
    return (
        <SplitScreenLayout
            showBackButton
            backHref="/"
            heroImage="https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=2069"
            heroTitle="Welcome back to the game."
            heroSubtitle="Sign in to access your profile, connect with coaches, and take the next step in your athletic career."
            testimonial={{
                quote: "This platform changed my recruitment journey completely!",
                author: "Marcus T.",
                role: "D1 Commit",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
            }}
            sportTags={['Football', 'Basketball', 'Track & Field']}
        >
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h2>
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                            Sign up
                        </Link>
                    </p>
                </div>

                <LoginForm onSuccess={onSuccess} redirectTo={redirectTo} />
            </div>
        </SplitScreenLayout>
    );
}
