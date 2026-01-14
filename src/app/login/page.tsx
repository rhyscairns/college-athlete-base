'use client';

import { LoginPage } from '@/authentication/pages/LoginPage';
import { useRouter } from 'next/navigation';
import type { User } from '@/authentication/types';

export default function Login() {
    const router = useRouter();

    const handleSuccess = (user: User) => {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'player') {
            router.push(`/player/${user.id}/dashboard`);
        } else if (user.role === 'coach') {
            router.push(`/coach/dashboard/${user.id}`);
        } else {
            router.push('/');
        }
    };

    return <LoginPage onSuccess={handleSuccess} />;
}
