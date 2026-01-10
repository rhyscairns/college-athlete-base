'use client';

import { useState, FormEvent } from 'react';
import { EmailInput } from './EmailInput';
import { PasswordInput } from './PasswordInput';
import { SubmitButton } from './SubmitButton';
import { ErrorMessage } from './ErrorMessage';
import { LoginLink } from './LoginLink';
import type { User, ValidationErrors, LoginFormProps } from '../types';

/**
 * Detect user role based on email domain
 * @param email - User's email address
 * @returns 'coach' if email ends with .edu, 'player' otherwise
 */
function getUserRole(email: string): 'player' | 'coach' {
    return email.toLowerCase().endsWith('.edu') ? 'coach' : 'player';
}

/**
 * Get the appropriate login endpoint based on user role
 * @param role - User role (player or coach)
 * @returns API endpoint path
 */
function getLoginEndpoint(role: 'player' | 'coach'): string {
    return `/api/auth/login/${role}`;
}

export function LoginForm({ onSuccess, redirectTo }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};

        // Email validation
        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setGeneralError(null);

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // Detect user role based on email domain
            const role = getUserRole(email);
            const endpoint = getLoginEndpoint(role);

            // Call login API
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for session management
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle API errors
                if (data.errors && Array.isArray(data.errors)) {
                    // Handle validation errors from API
                    const newErrors: ValidationErrors = {};
                    data.errors.forEach((error: { field: string; message: string }) => {
                        if (error.field === 'email' || error.field === 'password') {
                            newErrors[error.field] = error.message;
                        }
                    });
                    setErrors(newErrors);
                    // Don't set general error if we have field-specific errors
                    if (Object.keys(newErrors).length === 0 && data.message) {
                        setGeneralError(data.message);
                    }
                } else if (data.message) {
                    // Handle general error message
                    setGeneralError(data.message);
                } else {
                    setGeneralError('An error occurred during login. Please try again.');
                }
                return;
            }

            // Extract user ID from response
            const userId = role === 'player' ? data.playerId : data.coachId;

            // Create user object for callback
            const user: User = {
                id: userId,
                email,
                name: '', // Name will be fetched from dashboard
                role,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // Call onSuccess callback with user data
            if (onSuccess) {
                onSuccess(user);
            }

            // Handle redirect if specified
            if (redirectTo) {
                window.location.href = redirectTo;
            }
        } catch (error) {
            setGeneralError('An error occurred during login. Please try again.');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = email.length > 0 && password.length > 0;

    return (
        <form onSubmit={handleSubmit} role="form" className="w-full max-w-md mx-auto p-12 bg-white/90 rounded-3xl shadow-2xl border border-white/50">
            {generalError && (
                <div className="mb-6">
                    <ErrorMessage message={generalError} className="text-center" />
                </div>
            )}

            <div className="space-y-6 mb-6">
                <EmailInput
                    value={email}
                    onChange={setEmail}
                    error={errors.email}
                    disabled={loading}
                />
                <PasswordInput
                    value={password}
                    onChange={setPassword}
                    error={errors.password}
                    disabled={loading}
                />
            </div>

            <div className="flex items-center justify-between mb-8">
                <label className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-400 bg-white/60 text-gray-700 focus:ring-0" />
                    <span className="ml-2 text-sm text-gray-700">Keep logged in</span>
                </label>
                <a href="#" className="text-sm text-gray-700 hover:text-gray-900">Forgot Password?</a>
            </div>

            <SubmitButton loading={loading} disabled={!isFormValid}>
                Sign In
            </SubmitButton>

            <LoginLink className="mt-6" />
        </form>
    );
}
