/**
 * Authentication feature public API
 * Barrel export file for the authentication feature
 */

// Export types
export type {
    User,
    LoginCredentials,
    ValidationErrors,
    LoginPageProps,
    LoginFormProps,
    EmailInputProps,
    PasswordInputProps,
    SubmitButtonProps,
    ErrorMessageProps,
    LoginLinkProps,
} from './types';

// Components
export { EmailInput } from './components/EmailInput';
export { PasswordInput } from './components/PasswordInput';
export { SubmitButton } from './components/SubmitButton';
export { ErrorMessage } from './components/ErrorMessage';
export { LoginLink } from './components/LoginLink';
export { LoginForm } from './components/LoginForm';
export { LoginPage } from './pages/LoginPage';

// Hooks will be exported here as they are created
// export { useLogin } from './hooks/useLogin';
// export { useAuthValidation } from './hooks/useAuthValidation';

// Store will be exported here as it is created
// export { AuthProvider, useAuth } from './store/AuthContext';
