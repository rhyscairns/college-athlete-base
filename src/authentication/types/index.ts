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
 * Player registration data
 */
export interface PlayerRegistrationData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    gender: string;
    sport: string;
    position: string;
    gpa: number;
    country: string;
    state?: string;
    region?: string;
    scholarshipAmount?: number;
    testScores?: string;
}

/**
 * Coach registration data
 */
export interface CoachRegistrationData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    coachingCategory: string;
    sports: string[];
    university: string;
}

/**
 * Player registration form state
 */
export interface PlayerFormState {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    gender: string;
    sport: string;
    position: string;
    gpa: string;
    country: string;
    state: string;
    region: string;
    scholarshipAmount: string;
    testScores: string;
    errors: Record<string, string>;
    isSubmitting: boolean;
}

/**
 * Coach registration form state
 */
export interface CoachFormState {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    sports: string[];
    university: string;
    errors: Record<string, string>;
    isSubmitting: boolean;
}

/**
 * Validation error for a specific field
 */
export interface ValidationError {
    field: string;
    message: string;
}

/**
 * User role type
 */
export type UserRole = 'player' | 'coach';

/**
 * API Response types
 */

/**
 * API error response
 */
export interface ApiErrorResponse {
    success: false;
    message?: string;
    errors?: ValidationError[];
}

/**
 * API success response for player registration
 */
export interface ApiSuccessResponse {
    success: true;
    message: string;
    playerId: string;
}

/**
 * Combined API response type
 */
export type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

/**
 * Database record types
 */

/**
 * Player record structure for database operations
 */
export interface PlayerRecord {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    sex: string;
    sport: string;
    position: string;
    gpa: number;
    country: string;
    state?: string;
    region?: string;
    scholarshipAmount?: number;
    testScores?: string;
}

/**
 * Player record as returned from database (with additional fields)
 */
export interface PlayerDatabaseRecord extends PlayerRecord {
    id: string;
    createdAt: Date;
    updatedAt: Date;
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
    onBlur?: () => void;
    error?: string;
    disabled?: boolean;
}

export interface PasswordInputProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
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

export interface TextInputProps {
    label: string;
    name: string;
    type?: 'text' | 'email' | 'password' | 'number';
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: string;
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
    min?: number;
    max?: number;
    step?: number;
}

export interface SelectInputProps {
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    options: ReadonlyArray<{ readonly value: string; readonly label: string }>;
    error?: string;
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
}

export interface MultiSelectInputProps {
    label: string;
    name: string;
    values: string[];
    onChange: (values: string[]) => void;
    options: ReadonlyArray<{ readonly value: string; readonly label: string }>;
    maxSelections?: number;
    error?: string;
    required?: boolean;
    disabled?: boolean;
}

export interface PlayerRegistrationFormProps {
    onSubmit: (data: PlayerRegistrationData) => Promise<void>;
    onCancel?: () => void;
}

export interface CoachRegistrationFormProps {
    onSubmit: (data: CoachRegistrationData) => Promise<void>;
    onCancel?: () => void;
}
