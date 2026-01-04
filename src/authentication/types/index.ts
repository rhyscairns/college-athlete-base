/**
 * Authentication feature type definitions
 */

/**
 * User entity representing an authenticated user
 */
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'player' | 'coach';
    createdAt: string;
    updatedAt: string;
}

/**
 * Login credentials for authentication
 */
export interface LoginCredentials {
    email: string;
    password: string;
}

/**
 * Validation errors for form fields
 */
export interface ValidationErrors {
    email?: string;
    password?: string;
}

/**
 * Component prop interfaces
 */

export interface LoginPageProps {
    onSuccess?: (user: User) => void;
    redirectTo?: string;
}

export interface LoginFormProps {
    onSuccess?: (user: User) => void;
    redirectTo?: string;
}

export interface EmailInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
}

export interface PasswordInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
}

export interface SubmitButtonProps {
    loading: boolean;
    disabled: boolean;
    children: React.ReactNode;
}

export interface ErrorMessageProps {
    message: string;
    className?: string;
    id?: string;
}

export interface LoginLinkProps {
    className?: string;
}
