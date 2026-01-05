'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RoleSelector } from '../components/RoleSelector';
import type { UserRole } from '../types';

export function RegisterPage() {
    const router = useRouter();

    const handleSelectRole = (role: UserRole) => {
        router.push(`/register/${role}`);
    };

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
                    <strong>COLLEGE ATHLETE BASE</strong>
                </h1>
            </div>
            <div className="w-full max-w-2xl relative z-10">
                <RoleSelector onSelectRole={handleSelectRole} />
                <div className="text-center mt-6">
                    <Link
                        href="/login"
                        className="text-white hover:text-gray-100 text-sm font-semibold focus:outline-none focus:underline drop-shadow-lg"
                    >
                        Already have an account? Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}
