'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CoachRegistrationForm } from '../components/CoachRegistrationForm';
import { SplitScreenLayout } from '../components/SplitScreenLayout';
import type { CoachRegistrationData } from '../types';

export function CoachRegisterPage() {
    const router = useRouter();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    const handleSubmit = async (data: CoachRegistrationData) => {
        setApiError(null);

        try {
            const response = await fetch('/api/auth/register/coach', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                // Handle validation errors
                if (result.success === false && result.errors) {
                    const errorMessages = result.errors
                        .map((err: any) => `${err.field}: ${err.message}`)
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
                heroImage="https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=2070"
                heroTitle="Welcome to the team!"
                heroSubtitle="You're one step closer to discovering talented athletes and building your championship roster."
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
            heroImage="https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=2070"
            heroTitle="Discover tomorrow's champions."
            heroSubtitle="Join over 2,500 college coaches using our platform to find and recruit the best athletic talent in the nation."
            testimonial={{
                quote: "Found 3 perfect recruits in my first month!",
                author: "Coach Williams",
                role: "D1 Head Coach",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
            }}
            sportTags={['Football', 'Basketball', 'Soccer']}
        >
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Create coach account</h2>
                    <p className="text-gray-600">
                        Join our network of college coaches and start recruiting top talent.
                    </p>
                </div>

                {apiError && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        <p className="font-semibold text-sm">Registration Error</p>
                        <p className="text-sm">{apiError}</p>
                    </div>
                )}

                <CoachRegistrationForm onSubmit={handleSubmit} onCancel={handleCancel} />

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
