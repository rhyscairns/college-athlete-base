'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlayerRegistrationForm } from '../components/PlayerRegistrationForm';
import { SplitScreenLayout } from '../components/SplitScreenLayout';
import type { PlayerRegistrationData, ApiResponse } from '../types';

export function PlayerRegisterPage() {
    const router = useRouter();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    const handleSubmit = async (data: PlayerRegistrationData) => {
        setApiError(null);

        try {
            // Map gender to sex for API compatibility
            const apiData = {
                ...data,
                sex: data.gender,
            };
            // Remove gender field as API expects sex
            delete (apiData as any).gender;

            const response = await fetch('/api/auth/register/player', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiData),
            });

            const result: ApiResponse = await response.json();

            if (!response.ok) {
                // Handle validation errors
                if (result.success === false && result.errors) {
                    // Map API validation errors to form errors
                    const errorMessages = result.errors
                        .map((err) => `${err.field}: ${err.message}`)
                        .join(', ');
                    throw new Error(errorMessages);
                }

                // Handle other error responses
                if (result.success === false && result.message) {
                    throw new Error(result.message);
                }

                throw new Error('Registration failed. Please try again.');
            }

            // Success - show success message
            setSuccessMessage('Registration successful! Redirecting to login...');

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (error) {
            // Handle network errors and other exceptions
            if (error instanceof TypeError && error.message.includes('fetch')) {
                setApiError('Network error. Please check your connection and try again.');
            } else if (error instanceof Error) {
                setApiError(error.message);
            } else {
                setApiError('An unexpected error occurred. Please try again.');
            }

            // Re-throw to let the form handle it
            throw error;
        }
    };

    const handleCancel = () => {
        router.push('/login');
    };

    if (successMessage) {
        return (
            <SplitScreenLayout
                showBackButton
                backHref="/register"
                heroImage="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070"
                heroTitle="Welcome to the team!"
                heroSubtitle="You're one step closer to connecting with college coaches and achieving your athletic dreams."
                sportTags={['Football', 'Basketball', 'Soccer']}
            >
                <div className="text-center space-y-6">
                    <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-10 h-10 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Success!</h2>
                        <p className="text-gray-600">{successMessage}</p>
                    </div>
                </div>
            </SplitScreenLayout>
        );
    }

    return (
        <SplitScreenLayout
            showBackButton
            backHref="/register"
            heroImage="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070"
            heroTitle="Your future starts on the field."
            heroSubtitle="Connect with over 2,500 college coaches and showcase your talent on the nation's premier recruitment platform."
            testimonial={{
                quote: "Found my dream scholarship in 3 weeks!",
                author: "Marcus T.",
                role: "D1 Commit",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
            }}
            sportTags={['Football', 'Basketball', 'Soccer']}
        >
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
                    <p className="text-gray-600">
                        Welcome to College Athlete Base — let's build your recruitment profile.
                    </p>
                </div>

                {apiError && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        <p className="font-semibold text-sm">Registration Error</p>
                        <p className="text-sm">{apiError}</p>
                    </div>
                )}

                <PlayerRegistrationForm onSubmit={handleSubmit} onCancel={handleCancel} />

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
