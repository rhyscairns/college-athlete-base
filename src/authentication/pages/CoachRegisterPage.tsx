'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CoachRegistrationForm } from '../components/CoachRegistrationForm';
import type { CoachRegistrationData } from '../types';

export function CoachRegisterPage() {
    const router = useRouter();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (data: CoachRegistrationData) => {
        // TODO: Replace with actual API call in future task
        // Simulating API call for now
        await new Promise(resolve => setTimeout(resolve, 1500));

        console.log('Coach registration data:', data);

        // Mock successful registration
        setSuccessMessage('Registration successful! Redirecting to login...');

        // Redirect to login after 2 seconds
        setTimeout(() => {
            router.push('/login');
        }, 2000);
    };

    const handleCancel = () => {
        router.push('/login');
    };

    if (successMessage) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-sky-200 px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden">
                <div
                    className="absolute inset-0 opacity-90"
                    style={{
                        backgroundImage: 'url("https://images.unsplash.com/photo-1604329003703-dcd7f21527e2?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />
                <div className="w-full max-w-md p-12 bg-white/90 rounded-3xl shadow-2xl border border-white/50 text-center relative z-10">
                    <div className="mb-6">
                        <svg
                            className="w-16 h-16 mx-auto text-green-500"
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
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Success!</h2>
                    <p className="text-gray-600">{successMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-sky-200 px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden">
            <div
                className="absolute inset-0 opacity-90"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1604329003703-dcd7f21527e2?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <div className="relative z-10">
                <h1 className="text-6xl sm:text-6xl font-mono text-white mb-6 sm:mb-8 tracking-tight drop-shadow-2xl sm:text-center">
                    <strong>COACH REGISTRATION</strong>
                </h1>
            </div>
            <div className="w-full max-w-2xl relative z-10">
                <CoachRegistrationForm onSubmit={handleSubmit} onCancel={handleCancel} />

                <div className="text-center mt-6">
                    <button
                        onClick={() => router.push('/login')}
                        className="text-white hover:text-gray-200 transition-colors drop-shadow-lg font-medium"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}
